import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { X, Send, MessageSquare, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import { commonMimeTypes, commonLanguages } from '@/constants/communication';
import type { AttachmentItem, CommunicationResponseFormProps } from '@/interfaces/communication';

type ResponseAttachmentItem = AttachmentItem & { file?: File };

const CommunicationResponseForm: React.FC<CommunicationResponseFormProps> = ({
  communicationId,
  originalRequest,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<{
    message: string;
    status: 'completed' | 'partial';
    fhirStatus:
      | 'preparation'
      | 'in-progress'
      | 'completed'
      | 'on-hold'
      | 'stopped'
      | 'entered-in-error'
      | 'unknown';
    sentAt?: string;
  }>({
    message: '',
    status: 'completed',
    fhirStatus: 'completed',
    sentAt: new Date().toISOString().slice(0, 16),
  });

  const [attachments, setAttachments] = useState<ResponseAttachmentItem[]>([]);
  const [isSubmittingState, setIsSubmittingState] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingState(true);

    try {
      const endpoint = API_ENDPOINTS.PAYER.COMMUNICATION_RESPONSE;
      const headers = {
        'Content-Type': 'application/json',
        'x-hcx-api_call_id': `comm-resp-${Date.now()}`,
        'x-hcx-correlation_id': originalRequest.correlationId,
        'x-hcx-workflow_id': 'communication',
        'x-hcx-timestamp': new Date().toISOString(),
        'x-hcx-sender_code': 'provider-001',
        'x-hcx-recipient_code': originalRequest.payerName ? 'payer-001' : 'recipient-unknown',
      } as const;

      const preparedAttachments = await Promise.all(
        attachments.map(async (a) => ({
          title: a.title,
          contentType: a.contentType,
          language: a.language,
          creation: a.creation,
          data: a.mode === 'data' && a.file ? await readFileAsBase64(a.file) : undefined,
          url: a.mode === 'url' ? a.url : undefined,
        })),
      );

      const payload = {
        communicationId,
        claimId: originalRequest.claimId,
        message: formData.message,
        status: formData.status,
        fhirStatus: formData.fhirStatus,
        sentAt: formData.sentAt,
        attachments: preparedAttachments,
      };

      const res = await axios.post(endpoint, payload, { headers });
      const contentType = res.headers?.['content-type'] || '';
      if (contentType.includes('application/json') || typeof res.data === 'object') {
        console.log('Communication response sent successfully:', res.data);
      } else {
        console.warn('Communication response sent but received non-JSON response');
      }
      onSubmit({ ...formData, attachments });
    } catch (error) {
      console.error('Error sending communication response:', error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'An unexpected error occurred';
      alert(`Failed to send communication response: ${errorMessage}`);
    } finally {
      setIsSubmittingState(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newItems: ResponseAttachmentItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      mode: 'data',
      file,
      name: file.name,
      size: file.size,
      title: file.name,
      contentType: file.type || 'application/octet-stream',
    }));

    setAttachments((prev) => [...prev, ...newItems]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const addUrlAttachment = () => {
    setAttachments((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        mode: 'url',
        url: '',
        title: '',
        contentType: '',
        language: '',
        creation: '',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-60 bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary" />
              Send Communication Response
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Responding to: {originalRequest.claimId} • Patient: {originalRequest.patientName}
            </p>
          </div>
          <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onCancel}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <Card className="p-4 mb-6">
            <h4 className="font-medium mb-2">Communication Context</h4>
            <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <strong>Subject (Patient):</strong> {originalRequest.patientName}
              </div>
              <div>
                <strong>Sender (Provider):</strong> {originalRequest.providerName || '—'}
              </div>
              <div>
                <strong>Recipient (Payer):</strong> {originalRequest.payerName}
              </div>
            </div>
          </Card>

          <Card className="p-4 mb-6">
            <h4 className="font-medium mb-2">Original Request</h4>
            <div className="text-sm text-muted-foreground space-y-2">
              <div>
                <strong>Reason:</strong> {originalRequest.reasonCode}
              </div>
              <div>
                <strong>Message:</strong> {originalRequest.message}
              </div>
              {originalRequest.dueDate && (
                <div>
                  <strong>Due Date:</strong>{' '}
                  {new Date(originalRequest.dueDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(v: 'completed' | 'partial') =>
                  setFormData((prev) => ({ ...prev, status: v }))
                }
              >
                <SelectTrigger className="w-full max-w-xs bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Complete Response</SelectItem>
                  <SelectItem value="partial">Partial Response</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-600 mt-1">
                {formData.status === 'completed'
                  ? 'All requested information provided'
                  : 'Some information still pending'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FHIR Status (EventStatus) *
              </label>
              <Select
                value={formData.fhirStatus}
                onValueChange={(
                  v:
                    | 'preparation'
                    | 'in-progress'
                    | 'completed'
                    | 'on-hold'
                    | 'stopped'
                    | 'entered-in-error'
                    | 'unknown',
                ) => setFormData((prev) => ({ ...prev, fhirStatus: v }))}
              >
                <SelectTrigger className="w-full max-w-xs bg-white">
                  <SelectValue placeholder="Select FHIR status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparation">preparation</SelectItem>
                  <SelectItem value="in-progress">in-progress</SelectItem>
                  <SelectItem value="completed">completed</SelectItem>
                  <SelectItem value="on-hold">on-hold</SelectItem>
                  <SelectItem value="stopped">stopped</SelectItem>
                  <SelectItem value="entered-in-error">entered-in-error</SelectItem>
                  <SelectItem value="unknown">unknown</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-600 mt-1">
                Required by NRCES profile (ValueSet: event-status).
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Message *
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={4}
                placeholder="Please provide your response message explaining the information being provided..."
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sent At</label>
              <Input
                type="datetime-local"
                className="w-full max-w-xs"
                value={formData.sentAt || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, sentAt: e.target.value }))}
              />
              <div className="text-xs text-gray-600 mt-1">
                Optional timestamp indicating when the communication was sent.
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Attachments (optional)</label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add file
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={addUrlAttachment}
                  >
                    Add URL
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="text-sm font-medium text-gray-700">
                    Attachments ({attachments.length})
                  </div>
                  {attachments.map((a, index) => (
                    <Card key={a.id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Attachment {index + 1}</div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="uppercase">
                            {a.mode}
                          </Badge>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="px-0 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {a.mode === 'data' ? (
                          <>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Title</label>
                              <Input
                                placeholder="e.g., Discharge Summary"
                                value={a.title || ''}
                                onChange={(e) =>
                                  setAttachments((prev) =>
                                    prev.map((x) =>
                                      x.id === a.id ? { ...x, title: e.target.value } : x,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Content Type
                              </label>
                              <Select
                                value={a.contentType || ''}
                                onValueChange={(value) =>
                                  setAttachments((prev) =>
                                    prev.map((x) =>
                                      x.id === a.id ? { ...x, contentType: value } : x,
                                    ),
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {commonMimeTypes.map((mt) => (
                                    <SelectItem key={mt} value={mt}>
                                      {mt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="md:col-span-2">
                              <label className="block text-xs text-gray-600 mb-1">URL</label>
                              <Input
                                placeholder="https://..."
                                value={a.url || ''}
                                onChange={(e) =>
                                  setAttachments((prev) =>
                                    prev.map((x) =>
                                      x.id === a.id ? { ...x, url: e.target.value } : x,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Title</label>
                              <Input
                                placeholder="e.g., Discharge Summary"
                                value={a.title || ''}
                                onChange={(e) =>
                                  setAttachments((prev) =>
                                    prev.map((x) =>
                                      x.id === a.id ? { ...x, title: e.target.value } : x,
                                    ),
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                Content Type
                              </label>
                              <Select
                                value={a.contentType || ''}
                                onValueChange={(value) =>
                                  setAttachments((prev) =>
                                    prev.map((x) =>
                                      x.id === a.id ? { ...x, contentType: value } : x,
                                    ),
                                  )
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select content type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {commonMimeTypes.map((mt) => (
                                    <SelectItem key={mt} value={mt}>
                                      {mt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Language (BCP-47)
                          </label>
                          <Select
                            value={a.language || ''}
                            onValueChange={(value) =>
                              setAttachments((prev) =>
                                prev.map((x) => (x.id === a.id ? { ...x, language: value } : x)),
                              )
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {commonLanguages.map((l) => (
                                <SelectItem key={l.code} value={l.code}>
                                  {l.display}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Creation Date</label>
                          <Input
                            type="datetime-local"
                            value={a.creation || ''}
                            onChange={(e) =>
                              setAttachments((prev) =>
                                prev.map((x) =>
                                  x.id === a.id ? { ...x, creation: e.target.value } : x,
                                ),
                              )
                            }
                          />
                        </div>
                      </div>
                      {a.mode === 'data' && a.file && !a.contentType && (
                        <div className="text-xs text-red-600 mt-2">
                          contentType is recommended when a file is provided.
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Card className="p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Response Summary
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  <strong>Status:</strong>{' '}
                  {formData.status === 'completed' ? 'Complete Response' : 'Partial Response'}
                </div>
                <div>
                  <strong>Attachments:</strong> {attachments.length} item(s)
                </div>
                <div>
                  <strong>Total Size:</strong>{' '}
                  {formatFileSize(attachments.reduce((sum, a) => sum + (a.size || 0), 0))}
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmittingState}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center"
                disabled={isSubmittingState || !formData.message.trim()}
              >
                {isSubmittingState ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunicationResponseForm;
