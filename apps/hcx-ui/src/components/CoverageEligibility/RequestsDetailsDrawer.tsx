import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  X,
  User,
  Shield,
  Stethoscope,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Gavel,
} from 'lucide-react';
import { formatDate, hasDateField } from '@/utils/formatDate';
import AdjudicateForm from './AdjudicateForm';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { CATEGORY_OPTIONS, PRODUCT_OR_SERVICE_OPTIONS } from '@/constants/insurancePlanOptions';

interface CoverageEligibilityRequest {
  correlationId: string;
  fhirRefId: string;
  status: string;
  purpose: string[];
  patient: {
    id: string;
    name: string;
    dob: string;
    gender: string;
    identifier: string;
  };
  insurance: Array<{
    focal: boolean;
    coverage: {
      id: string;
      policyNumber: string;
      status: string;
      plan: string;
      payor: string;
    };
  }>;
  practitioner: {
    id: string;
    name: string;
    qualification: string;
    identifier: string;
  };
  organization: {
    id: string;
    name: string;
    type: string;
    contact: { phone: string; email: string };
  };
  serviced?: { date?: string; period?: { start: string; end: string } };
  items: Array<{
    category: { code: string; display: string };
    productOrService: { code: string; display: string };
    quantity?: { value: number; unit?: string };
    unitPrice?: { value?: number; currency?: string };
    diagnoses?: Array<any>;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface ResponseFormType {
  purpose: string[];
  disposition: string;
  servicedDate: string;
  servicedPeriod: { start: string; end: string };
  insurance: Array<{
    policyNumber: string;
    inforce: boolean;
    benefitPeriod: { start: string; end: string };
    items: Array<{
      category: { code: string; display: string };
      productOrService: { code: string; display: string };
      benefits: Array<{
        type: string;
        allowedMoney: { value: number; currency: string };
        allowedUnsignedInt?: number;
        allowedString?: string;
        usedUnsignedInt?: number;
        usedString?: string;
        usedMoney?: { value: number; currency: string };
      }>;
      excluded?: boolean;
      name?: string;
      description?: string;
      network?: string;
      unit?: string;
      term?: string;
      authorizationRequired?: boolean;
      authorizationSupporting?: Array<{ code: string; display: string }>;
      authorizationUrl?: string;
    }>;
  }>;
}

interface DetailDrawerProps {
  selectedRequest: CoverageEligibilityRequest | null;
  onClose: () => void;
  mapRequestToResponseForm: (req: CoverageEligibilityRequest) => ResponseFormType;
}

const DetailDrawer: React.FC<DetailDrawerProps> = ({
  selectedRequest,
  onClose,
  mapRequestToResponseForm,
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const [responseAction, setResponseAction] = useState<
    'approve' | 'reject' | 'query' | 'adjudicate' | null
  >(null);
  const [responseForm, setResponseForm] = useState<ResponseFormType>({
    purpose: [],
    disposition: '',
    servicedDate: '',
    servicedPeriod: { start: '', end: '' },
    insurance: [],
  });
  const [responseSubmitting, setResponseSubmitting] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [itemOpenStates, setItemOpenStates] = useState<boolean[]>([]);

  useEffect(() => {
    if (selectedRequest && selectedRequest.items) {
      setItemOpenStates(Array(selectedRequest.items.length).fill(false));
    }
  }, [selectedRequest]);

  const openResponseForm = (action: 'approve' | 'reject' | 'query' | 'adjudicate') => {
    setResponseAction(action);
    if (action === 'adjudicate' && selectedRequest) {
      setResponseForm(mapRequestToResponseForm(selectedRequest));
    } else {
      setResponseForm({
        purpose: [],
        disposition: '',
        servicedDate: '',
        servicedPeriod: { start: '', end: '' },
        insurance: [],
      });
    }
    setResponseSuccess(false);
  };

  const handleResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseSubmitting(true);
    setResponseSuccess(false);
    try {
      const correlationId = selectedRequest?.correlationId || '';
      console.log('correlationId:', correlationId);

      await axios.post(API_CONFIG.PAYER.ENDPOINTS.COVERAGE_ELIGIBILITY_CHECK, {
        correlationId,
        responseForm,
      });

      setResponseSubmitting(false);
      setResponseSuccess(true);
      setTimeout(() => {
        setResponseAction(null);
        setResponseSuccess(false);
      }, 1500);
    } catch (err) {
      setResponseSubmitting(false);
      alert('Failed to submit adjudication: ' + (err as Error).message);
    }
  };

  const handleClose = () => {
    setShowRaw(false);
    onClose();
  };

  if (!selectedRequest) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={handleClose} />
      <div className="relative ml-auto w-full max-w-4xl h-full bg-white shadow-xl p-8 overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={handleClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-6">Coverage Eligibility Request Details</h2>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            General Information
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Request ID:</span> {selectedRequest.fhirRefId || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <Badge variant={selectedRequest.status === 'active' ? 'default' : 'secondary'}>
                {selectedRequest.status}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Purpose:</span>{' '}
              {selectedRequest.purpose && selectedRequest.purpose.length > 0
                ? selectedRequest.purpose.map((p, i) => (
                    <Badge key={i} className="mr-1">
                      {p}
                    </Badge>
                  ))
                : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Created At:</span>{' '}
              {formatDate(selectedRequest.createdAt)}
            </div>
            <div>
              <span className="font-medium">Updated At:</span>{' '}
              {formatDate(selectedRequest.updatedAt)}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Patient Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="font-medium">ID:</span> {selectedRequest.patient?.id || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Name:</span> {selectedRequest.patient?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Gender:</span>{' '}
              {selectedRequest.patient?.gender ? (
                <Badge>{selectedRequest.patient.gender}</Badge>
              ) : (
                'N/A'
              )}
            </div>
            <div>
              <span className="font-medium">DOB:</span> {formatDate(selectedRequest.patient?.dob)}
            </div>
            <div>
              <span className="font-medium">Identifier:</span>{' '}
              {selectedRequest.patient?.identifier || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Stethoscope className="w-4 h-4 mr-2" />
            Practitioner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="font-medium">ID:</span> {selectedRequest.practitioner?.id || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Name:</span>{' '}
              {selectedRequest.practitioner?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Qualification:</span>{' '}
              {selectedRequest.practitioner?.qualification || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Identifier:</span>{' '}
              {selectedRequest.practitioner?.identifier || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Provider Organization
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="font-medium">ID:</span> {selectedRequest.organization?.id || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Name:</span>{' '}
              {selectedRequest.organization?.name || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Type:</span>{' '}
              {selectedRequest.organization?.type || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Contact Phone:</span>{' '}
              {selectedRequest.organization?.contact?.phone || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Contact Email:</span>{' '}
              {selectedRequest.organization?.contact?.email || 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Insurance
          </h3>
          {selectedRequest.insurance && selectedRequest.insurance.length > 0 ? (
            <div className="space-y-4">
              {selectedRequest.insurance.map((ins, idx) => (
                <Card key={idx} className="bg-white border shadow-sm">
                  <div className="p-4">
                    {selectedRequest.insurance.length > 1 && (
                      <div className="font-semibold mb-2 text-primary">Plan {idx + 1}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Focal:</span>
                        {ins.focal ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>}
                      </div>
                      <div>
                        <span className="font-medium">Coverage ID:</span>{' '}
                        {ins.coverage?.id || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Policy Number:</span>{' '}
                        {ins.coverage?.policyNumber || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        {ins.coverage?.status ? (
                          <Badge
                            variant={ins.coverage.status === 'active' ? 'default' : 'secondary'}
                          >
                            {ins.coverage.status}
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Plan:</span> {ins.coverage?.plan || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Payor:</span> {ins.coverage?.payor || 'N/A'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No insurance plans added yet.</div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Serviced
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Date:</span>
              {hasDateField(selectedRequest.serviced)
                ? formatDate(selectedRequest.serviced.date)
                : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Period:</span>{' '}
              {selectedRequest.serviced?.period &&
              typeof selectedRequest.serviced.period.start === 'string' &&
              typeof selectedRequest.serviced.period.end === 'string'
                ? `${formatDate(selectedRequest.serviced.period.start)} - ${formatDate(selectedRequest.serviced.period.end)}`
                : 'N/A'}
            </div>
          </div>
        </div>

        {selectedRequest.items && selectedRequest.items.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Items
            </h3>
            {selectedRequest.items.map((item, idx) => (
              <div key={idx} className="mb-3">
                <div
                  className="flex items-center justify-between cursor-pointer border rounded px-3 py-2 bg-white hover:bg-gray-50 transition"
                  onClick={() =>
                    setItemOpenStates((states) =>
                      states.map((open, i) => (i === idx ? !open : open)),
                    )
                  }
                >
                  <div className="font-medium text-base">
                    {item.productOrService?.display || 'Item'}{' '}
                    <span className="text-xs text-gray-500">
                      ({item.category?.display || 'N/A'})
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${itemOpenStates[idx] ? 'rotate-180' : ''}`}
                  />
                </div>
                {itemOpenStates[idx] && (
                  <div className="mt-3 bg-gray-50 border rounded-b px-4 py-3 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      <div>
                        <span className="font-medium">Quantity:</span>{' '}
                        {item.quantity?.value || 'N/A'}
                        {item.quantity && 'unit' in item.quantity && item.quantity.unit
                          ? ` ${item.quantity.unit}`
                          : ''}
                      </div>
                      <div>
                        <span className="font-medium">Unit Price:</span>{' '}
                        {item.unitPrice?.value
                          ? `${item.unitPrice.value} ${item.unitPrice.currency || ''}`
                          : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold flex items-center mb-2">
                        <Stethoscope className="w-4 h-4 mr-2" /> Diagnoses
                      </div>
                      {item.diagnoses && item.diagnoses.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          {item.diagnoses.map((diag, dIdx) => (
                            <Card key={dIdx} className="bg-white border shadow-sm">
                              <div className="p-4 space-y-2">
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {diag.code && <Badge variant="outline">Code: {diag.code}</Badge>}
                                  {diag.clinicalStatus && (
                                    <Badge variant="secondary">{diag.clinicalStatus}</Badge>
                                  )}
                                  {diag.severity && (
                                    <Badge variant="destructive">{diag.severity}</Badge>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-y-1 text-sm">
                                  {diag.description && (
                                    <div>
                                      <span className="font-medium">Description:</span>{' '}
                                      {diag.description}
                                    </div>
                                  )}
                                  {diag.verificationStatus && (
                                    <div>
                                      <span className="font-medium">Verification Status:</span>{' '}
                                      {diag.verificationStatus}
                                    </div>
                                  )}
                                  {diag.category && (
                                    <div>
                                      <span className="font-medium">Category:</span> {diag.category}
                                    </div>
                                  )}
                                  {diag.onsetDate && typeof diag.onsetDate === 'string' && (
                                    <div>
                                      <span className="font-medium">Onset:</span>{' '}
                                      {formatDate(diag.onsetDate)}
                                    </div>
                                  )}
                                  {diag.abatementDate && typeof diag.abatementDate === 'string' && (
                                    <div>
                                      <span className="font-medium">Abatement:</span>{' '}
                                      {formatDate(diag.abatementDate)}
                                    </div>
                                  )}
                                  {diag.bodySite && (
                                    <div>
                                      <span className="font-medium">Body Site:</span>{' '}
                                      {diag.bodySite}
                                    </div>
                                  )}
                                  {diag.notes && (
                                    <div className="text-muted-foreground">
                                      <span className="font-medium">Notes:</span> {diag.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">N/A</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Raw FHIR JSON
          </h3>
          <div className="space-y-2">
            <button
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              onClick={() => setShowRaw((v) => !v)}
            >
              {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showRaw ? 'Hide' : 'Show'} Raw FHIR JSON
            </button>
            {showRaw && (
              <pre className="mt-2 p-2 bg-white rounded border text-xs overflow-x-auto max-h-60">
                {JSON.stringify(selectedRequest, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <button
            className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            onClick={() => openResponseForm('adjudicate')}
          >
            <Gavel className="w-4 h-4 mr-2" />
            Adjudicate
          </button>
        </div>

        {responseAction === 'adjudicate' && (
          <div className="fixed inset-0 z-60 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40" onClick={() => setResponseAction(null)} />
            <div className="relative z-70 bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Adjudicate Coverage Eligibility Response</h3>
                <button
                  onClick={() => setResponseAction(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AdjudicateForm
                responseForm={responseForm}
                setResponseForm={setResponseForm}
                responseSubmitting={responseSubmitting}
                handleResponseSubmit={handleResponseSubmit}
                setResponseAction={setResponseAction}
                CATEGORY_OPTIONS={CATEGORY_OPTIONS}
                PRODUCT_OR_SERVICE_OPTIONS={PRODUCT_OR_SERVICE_OPTIONS}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailDrawer;
