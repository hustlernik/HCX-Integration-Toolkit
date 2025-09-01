import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import Sidebar from '@/components/dashboard/Sidebar';
import { apiTestingSidebarSections } from '@/constants/sidebarSections';
import { ArrowRight } from 'lucide-react';
import { mockFhirResources } from '@/constants/mockFhirResources';
import { io } from 'socket.io-client';
import { workflows } from '@/constants/workflows';
import { generateDefaultHeaders } from '@/constants/defaultHeaders';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api';
import { getISTTimestamp } from '@/utils/getISTTImestamp';

interface RequestHeader {
  key: string;
  value: string;
}

interface HcxRequest {
  headers: Record<string, string>;
  payload: string;
}

interface HcxTransaction {
  status: string;
  correlationId: string;
  workflow: string;
  timestamp: string;
  responseStatus: string;
  request: HcxRequest;
  response: unknown;
}

const ApiTesting: React.FC = () => {
  const [workflow, setWorkflow] = useState(workflows[0].key);
  const [selectedMock, setSelectedMock] = useState(0);
  const selectedMocks = mockFhirResources[workflow as keyof typeof mockFhirResources] || [];
  const selectedResource = selectedMocks[selectedMock]?.resource;
  const [headers, setHeaders] = useState<RequestHeader[]>(() => {
    const filled = generateDefaultHeaders().map((h) => h);
    return filled;
  });
  const [rawView, setRawView] = useState<boolean>(false);
  const [response, setResponse] = useState<unknown>(null);
  const [responseStatus, setResponseStatus] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<HcxTransaction[]>([]);
  const [bodyText, setBodyText] = useState(() =>
    selectedResource ? JSON.stringify(selectedResource, null, 2) : '',
  );
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [editedResource, setEditedResource] = useState<unknown>(selectedResource);
  const [coverageEligibilityExample, setCoverageEligibilityExample] = useState<object | null>(null);
  const [claimExample, setClaimExample] = useState<object | null>(null);

  useEffect(() => {
    axios
      .get(`${API_CONFIG.FHIR.SERVER_URL}/Bundle/48263415`)
      .then((res) => setCoverageEligibilityExample(res.data))
      .catch((err) => console.error('Error fetching coverage eligibility example:', err));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`${API_CONFIG.FHIR.SERVER_URL}/Bundle/48611046`, { signal: controller.signal })
      .then((res) => setClaimExample(res.data))
      .catch((err) => {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') return;
        console.error('Error fetching claim example:', err);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (workflow === 'coverage-eligibility' && coverageEligibilityExample) {
      setEditedResource(coverageEligibilityExample);
      setBodyText(JSON.stringify(coverageEligibilityExample, null, 2));
    } else if (workflow === 'claim' && claimExample) {
      setEditedResource(claimExample);
      setBodyText(JSON.stringify(claimExample, null, 2));
    } else {
      setEditedResource(selectedResource);
      setBodyText(selectedResource ? JSON.stringify(selectedResource, null, 2) : '');
    }
  }, [workflow, coverageEligibilityExample, selectedResource, claimExample]);

  useEffect(() => {
    try {
      setBodyError(null);
      const parsed = JSON.parse(bodyText);
      setEditedResource(parsed);
    } catch {
      setBodyError('Invalid JSON');
    }
  }, [bodyText]);

  useEffect(() => {
    setEditedResource(selectedResource);
  }, [selectedResource]);

  const lastHeader = headers[headers.length - 1];
  const lastHeaderKey = lastHeader?.key;
  const lastHeaderValue = lastHeader?.value;

  useEffect(() => {
    setHeaders((hs) => {
      if (hs.length === 0 || hs[hs.length - 1].key || hs[hs.length - 1].value) {
        return [...hs, { key: '', value: '' }];
      }

      const trimmed = hs.slice();
      while (
        trimmed.length > 1 &&
        !trimmed[trimmed.length - 1].key &&
        !trimmed[trimmed.length - 1].value &&
        !trimmed[trimmed.length - 2].key &&
        !trimmed[trimmed.length - 2].value
      ) {
        trimmed.pop();
      }
      return trimmed;
    });
  }, [headers.length, lastHeaderKey, lastHeaderValue]);

  function removeHeader(idx: number) {
    setHeaders((hs) => {
      const filtered = hs.filter((_, i) => i !== idx);

      if (
        filtered.length === 0 ||
        filtered[filtered.length - 1].key ||
        filtered[filtered.length - 1].value
      ) {
        return [...filtered, { key: '', value: '' }];
      }
      return filtered;
    });
  }

  function updateHeader(idx: number, field: 'key' | 'value', value: string) {
    setHeaders((hs) => hs.map((h, i) => (i === idx ? { ...h, [field]: value } : h)));
  }

  const getWorkflowEndpoint = (workflowKey: string): string | null => {
    const workflowEndpoints: Record<string, string> = {
      'coverage-eligibility': API_ENDPOINTS.PROVIDER.COVERAGE_ELIGIBILITY,
      preauth: API_ENDPOINTS.PROVIDER.PREAUTH,
      claim: API_ENDPOINTS.PROVIDER.CLAIM,
      'payment-notice': API_ENDPOINTS.PROVIDER.PAYMENT_NOTICE,
      predetermination: API_ENDPOINTS.PROVIDER.PREDETERMINATION,
      'insurance-plan': API_ENDPOINTS.PROVIDER.INSURANCE_PLAN,
    };
    return workflowEndpoints[workflowKey] || null;
  };

  const buildRequestPayload = () => ({
    headers: Object.fromEntries(
      headers.filter((h) => h.key && h.key.trim() !== '').map((h) => [h.key, h.value]),
    ),
    payload: JSON.stringify(editedResource),
  });

  const handleApiResponse = (response: any) => ({
    status: 'acknowledged',
    response: response.data,
    responseStatus: `${response.status} ${response.statusText}`,
  });

  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      return {
        status: 'errored',
        response: error.response.data,
        responseStatus: `${error.response.status} ${error.response.statusText}`,
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'errored',
      response: { error: errorMessage },
      responseStatus: 'Error',
    };
  };

  const getCorrelationId = (): string => {
    return headers.find((h) => h.key === 'x-hcx-correlation_id')?.value || '';
  };

  const createTransaction = (status: string, response: unknown, responseStatus: string) => ({
    status,
    correlationId: getCorrelationId(),
    workflow,
    timestamp: getISTTimestamp(),
    responseStatus,
    request: buildRequestPayload(),
    response,
  });

  async function sendRequest(): Promise<void> {
    setSending(true);

    const endpoint = getWorkflowEndpoint(workflow);
    if (!endpoint) {
      const errorResult = handleApiError(new Error('Invalid workflow'));
      setResponse(errorResult.response);
      setResponseStatus(errorResult.responseStatus);
      setSending(false);
      return;
    }

    try {
      const requestPayload = buildRequestPayload();
      const response = await axios.post(endpoint, requestPayload);
      const result = handleApiResponse(response);

      setResponse(result.response);
      setResponseStatus(result.responseStatus);
      setSending(false);
      setTransactions([
        createTransaction(result.status, result.response, result.responseStatus),
        ...transactions,
      ]);
    } catch (error) {
      const result = handleApiError(error);

      setResponse(result.response);
      setResponseStatus(result.responseStatus);
      setSending(false);
      setTransactions([
        createTransaction(result.status, result.response, result.responseStatus),
        ...transactions,
      ]);
    }
  }

  useEffect(() => {
    const socket = io(API_CONFIG.PROVIDER.BASE_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
    });

    const handleSocketResponse = (data: any) => {
      setResponse(data);
      setResponseStatus('ResponseReceived');
    };

    socket.on('connect', () => console.log('[WS] connected', socket.id));
    socket.on('connect_error', (err) => console.error('[WS] connect_error', err.message));
    socket.on('error', (err) => console.error('[WS] error', err));
    socket.on('reconnect_attempt', (n) => console.log('[WS] reconnect_attempt', n));
    socket.on('reconnect', (n) => console.log('[WS] reconnected', n));
    socket.on('disconnect', (reason) => console.warn('[WS] disconnected', reason));

    socket.on('insurance-plan-response', handleSocketResponse);
    socket.on('coverage-eligibility-response', handleSocketResponse);
    socket.on('claim-response', handleSocketResponse);

    return () => {
      socket.off('insurance-plan-response', handleSocketResponse);
      socket.off('coverage-eligibility-response', handleSocketResponse);
      socket.off('claim-response', handleSocketResponse);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <Header />
      <Sidebar sections={apiTestingSidebarSections} />
      <main className="ml-64 p-8 min-h-[calc(100vh-4rem)] bg-gray-50">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>API Testing</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Simulate provider interactions</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1 text-sm font-medium">Workflow</label>
                <Select
                  value={workflow}
                  onValueChange={(v) => {
                    setWorkflow(v);
                    setSelectedMock(0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{workflows.find((wf) => wf.key === workflow)?.label}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map((wf) => (
                      <SelectItem key={wf.key} value={wf.key}>
                        {wf.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block mb-1 text-sm font-medium">Sample Request Bundle</label>
                {workflow === 'coverage-eligibility' ? (
                  <Select value={String(0)} onValueChange={() => {}}>
                    <SelectTrigger className="w-full">
                      <SelectValue>Coverage Eligibility Request Bundle</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key={'Coverage Eligibility Request Bundle'} value={String(0)}>
                        Coverage Eligibility Request Bundle
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={String(selectedMock)}
                    onValueChange={(v) => setSelectedMock(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {selectedMocks[selectedMock]?.name || 'No example available'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMocks.map((mock, idx) => (
                        <SelectItem key={mock.name} value={String(idx)}>
                          {mock.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <Tabs defaultValue="body" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>
              <TabsContent value="headers">
                <div className="mb-8">
                  <div className="mb-2 font-medium">Headers</div>
                  {headers.map((h, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        className="border rounded px-3 py-2 flex-1"
                        value={h.key}
                        placeholder="Header Key"
                        readOnly={[
                          'x-hcx-sender_code',
                          'x-hcx-recipient_code',
                          'x-hcx-api_call_id',
                          'x-hcx-workflow_id',
                          'Content-Type',
                        ].includes(h.key)}
                        onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                      />
                      <input
                        className="border rounded px-3 py-2 flex-1"
                        value={h.value}
                        placeholder="Header Value"
                        onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => removeHeader(idx)}
                        disabled={[
                          'x-hcx-sender_code',
                          'x-hcx-recipient_code',
                          'x-hcx-api_call_id',
                          'x-hcx-workflow_id',
                          'Content-Type',
                        ].includes(h.key)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="body">
                <div className="mb-8">
                  <div className="mb-2 font-medium">FHIR Bundle</div>
                  <textarea
                    className="w-full min-h-[250px] max-h-[400px] font-mono text-xs border rounded p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={
                      workflow === 'coverage-eligibility'
                        ? JSON.stringify(coverageEligibilityExample, null, 2)
                        : bodyText
                    }
                    readOnly={workflow === 'coverage-eligibility'}
                    onChange={
                      workflow === 'coverage-eligibility'
                        ? undefined
                        : (e) => setBodyText(e.target.value)
                    }
                    spellCheck={false}
                  />
                  {bodyError && bodyText && (
                    <span className="text-red-500 text-xs mt-1 block">{bodyError}</span>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <Button
              className="mt-4 mb-4 flex items-center gap-2"
              onClick={sendRequest}
              disabled={sending || !!bodyError}
            >
              <ArrowRight className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Request'}
            </Button>
            <div className="mb-8">
              <div className="mb-2 font-medium">Response</div>
              {response ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <Button
                      variant="default"
                      size="sm"
                      type="button"
                      onClick={() => setRawView(false)}
                      className="bg-black text-white"
                    >
                      Pretty
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      type="button"
                      onClick={() => setRawView(true)}
                      className="bg-black text-white"
                    >
                      Raw
                    </Button>
                  </div>
                  <div className="mb-2 font-medium">Status: {responseStatus}</div>
                  <pre className="bg-gray-100 p-2 rounded text-xs max-h-60 min-h-[180px] whitespace-pre-wrap break-all overflow-auto">
                    {rawView ? JSON.stringify(response) : JSON.stringify(response, null, 2)}
                  </pre>
                </>
              ) : (
                <div className="text-muted-foreground text-sm">No response yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default ApiTesting;
