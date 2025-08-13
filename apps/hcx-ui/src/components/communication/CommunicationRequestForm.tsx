import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Calendar, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/api';
import { CommunicationRequestData, AttachmentItem } from '@/interfaces/communication';
import {
  reasonCodes,
  categories,
  mediums,
  commonMimeTypes,
  commonLanguages,
} from '@/constants/communication';

interface CommunicationRequestFormProps {
  claimId: string;
  correlationId: string;
  patientName: string;
  providerName: string;
  onSubmit: (data: CommunicationRequestData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CommunicationRequestForm: React.FC<CommunicationRequestFormProps> = ({
  claimId,
  correlationId,
  patientName,
  providerName,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CommunicationRequestData>({
    reasonCode: '',
    reasonDisplay: '',
    message: '',
    priority: 'routine',
    dueDate: '',
    category: categories[0],
    medium: [mediums[0]],
  });
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isSubmittingState, setIsSubmitting] = useState(false);
  const submitting = isSubmitting || isSubmittingState;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = API_ENDPOINTS.PAYER.COMMUNICATION_REQUEST;
      const headers = {
        'Content-Type': 'application/json',
        'x-hcx-api_call_id': `comm-req-${Date.now()}`,
        'x-hcx-correlation_id': correlationId,
        'x-hcx-workflow_id': 'communication',
        'x-hcx-timestamp': new Date().toISOString(),
        'x-hcx-sender_code': 'payer-001',
        'x-hcx-recipient_code': 'provider-001',
      } as const;

      const payload = {
        correlationId,
        claimId,
        reasonCode: formData.reasonCode,
        reasonDisplay: formData.reasonDisplay,
        message: formData.message,
        priority: formData.priority,
        dueDate: formData.dueDate,
        category: formData.category,
        medium: formData.medium,
        attachments: attachments.map((a) => ({
          title: a.title,
          contentType: a.contentType,
          language: a.language,
          creation: a.creation,
          data: a.mode === 'data' ? a.data : undefined,
          url: a.mode === 'url' ? a.url : undefined,
        })),
      };

      const invalidData = attachments.some((a) => a.mode === 'data' && (!a.data || !a.contentType));
      if (invalidData) {
        alert('Please set contentType for all uploaded files.');
        setIsSubmitting(false);
        return;
      }

      const res = await axios.post(endpoint, payload, { headers });
      const contentType = res.headers?.['content-type'] || '';
      if (contentType.includes('application/json') || typeof res.data === 'object') {
        console.log('Communication request sent successfully:', res.data);
      } else {
        console.warn('Communication request sent but received non-JSON response');
      }
      onSubmit({ ...formData, attachments });
      alert('Communication request sent successfully!');
    } catch (error) {
      console.error('Error sending communication request:', error);
      alert('Failed to send communication request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReason = reasonCodes.find((r) => r.code === formData.reasonCode);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Request Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Request additional information from provider for claim adjudication
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select
              value={formData.category?.code}
              onValueChange={(value) => {
                const selected = categories.find((c) => c.code === value) || categories[0];
                setFormData((prev) => ({ ...prev, category: selected }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medium</label>
            <Select
              value={formData.medium && formData.medium[0]?.code}
              onValueChange={(value) => {
                const selected = mediums.find((m) => m.code === value) || mediums[0];
                setFormData((prev) => ({ ...prev, medium: [selected] }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select medium" />
              </SelectTrigger>
              <SelectContent>
                {mediums.map((m) => (
                  <SelectItem key={m.code} value={m.code}>
                    {m.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Request <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.reasonCode}
              onValueChange={(value) => {
                const selectedReason = reasonCodes.find((r) => r.code === value);
                setFormData({
                  ...formData,
                  reasonCode: value,
                  reasonDisplay: selectedReason?.display || '',
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select reason for information request" />
              </SelectTrigger>
              <SelectContent>
                {reasonCodes.map((reason) => (
                  <SelectItem key={reason.code} value={reason.code}>
                    {reason.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, priority: value as any }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="asap">ASAP</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder={`Please provide ${selectedReason?.display?.toLowerCase() || 'additional information'} for the submitted claim. This information is required to complete the adjudication process.`}
            value={formData.message}
            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Attachments (optional)
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const el = document.createElement('input');
                  el.type = 'file';
                  el.multiple = true;
                  el.onchange = async () => {
                    const fileList = el.files;
                    if (!fileList) return;
                    const toBase64 = (file: File) =>
                      new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () =>
                          resolve((reader.result as string).split(',')[1] || '');
                        reader.onerror = (err) => reject(err);
                        reader.readAsDataURL(file);
                      });
                    const newItems: AttachmentItem[] = [];
                    for (const f of Array.from(fileList)) {
                      const data = await toBase64(f);
                      newItems.push({
                        id: `${Date.now()}-${Math.random()}`,
                        mode: 'data',
                        name: f.name,
                        title: f.name,
                        contentType: f.type || 'application/octet-stream',
                        size: f.size,
                        data,
                      });
                    }
                    setAttachments((prev) => [...prev, ...newItems]);
                  };
                  el.click();
                }}
              >
                Add file
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setAttachments((prev) => [
                    ...prev,
                    {
                      id: `${Date.now()}-${Math.random()}`,
                      mode: 'url',
                      title: '',
                      url: '',
                      contentType: '',
                      language: '',
                      creation: '',
                    },
                  ])
                }
              >
                Add URL
              </Button>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="space-y-3">
              {attachments.map((a, idx) => (
                <div key={a.id} className="border rounded p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Attachment {idx + 1}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 align-middle">
                        {a.mode.toUpperCase()}
                      </span>
                      {a.mode === 'data' && a.name && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {a.name} {a.size ? `(${Math.round((a.size || 0) / 1024)} KB)` : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttachments((prev) => prev.filter((x) => x.id !== a.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {a.mode === 'url' && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">URL</label>
                        <Input
                          placeholder="https://..."
                          value={a.url || ''}
                          onChange={(e) =>
                            setAttachments((prev) =>
                              prev.map((x) => (x.id === a.id ? { ...x, url: e.target.value } : x)),
                            )
                          }
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Title</label>
                      <Input
                        placeholder="e.g., Discharge Summary"
                        value={a.title || ''}
                        onChange={(e) =>
                          setAttachments((prev) =>
                            prev.map((x) => (x.id === a.id ? { ...x, title: e.target.value } : x)),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Content Type</label>
                      <Select
                        value={a.contentType || ''}
                        onValueChange={(value) =>
                          setAttachments((prev) =>
                            prev.map((x) => (x.id === a.id ? { ...x, contentType: value } : x)),
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select MIME type" />
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
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Language (BCP-47)</label>
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
                  {a.mode === 'data' && a.data && !a.contentType && (
                    <div className="text-xs text-red-600">
                      contentType is required when data is provided.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Due Date (Optional)
          </label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <Card className="p-4">
          <h4 className="font-medium mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Communication Summary
          </h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              <strong>Patient:</strong> {patientName}
            </div>
            <div>
              <strong>Provider:</strong> {providerName}
            </div>
            <div>
              <strong>Reason:</strong> {selectedReason?.display}
            </div>
            <div>
              <strong>Category:</strong> {formData.category?.display}
            </div>
            <div>
              <strong>Medium:</strong>{' '}
              {(formData.medium || []).map((m) => m.display).join(', ') || '—'}
            </div>
            <div>
              <strong>Priority:</strong> {formData.priority.toUpperCase()}
            </div>
            {formData.dueDate && (
              <div>
                <strong>Due Date:</strong> {new Date(formData.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !formData.reasonCode || !formData.message}
            className="flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CommunicationRequestForm;
