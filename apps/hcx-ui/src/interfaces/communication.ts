export interface CodedDoc {
  code: string;
  display: string;
  system: string;
}

export type AttachmentItem = {
  id: string;
  mode: 'data' | 'url';
  title?: string;
  contentType?: string;
  language?: string;
  creation?: string;
  name?: string;
  size?: number;
  file?: File;
  data?: string;
  url?: string;
};

export interface CommunicationRequestData {
  reasonCode: string;
  reasonDisplay: string;
  message: string;
  priority: 'routine' | 'urgent' | 'asap' | 'stat';
  dueDate?: string;
  category?: { code: string; display: string; system: string };
  medium?: { code: string; display: string; system: string }[];
  attachments?: AttachmentItem[];
}

export interface CommunicationResponseData {
  message: string;
  attachments: AttachmentItem[];
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
}

export interface CommunicationOriginalRequest {
  claimId: string;
  patientName: string;
  payerName: string;
  correlationId: string;
  reasonCode: string;
  message: string;
  requestedDocs: string[];
  dueDate?: string;
  providerName?: string;
}

export type OriginalRequest = Omit<CommunicationOriginalRequest, 'providerName'> & {
  communicationId: string;
  correlationId: string;
};

export interface CommunicationResponseFormProps {
  communicationId: string;
  originalRequest: CommunicationOriginalRequest;
  onSubmit: (data: CommunicationResponseData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export type CommunicationType = 'request' | 'response';
export type CommunicationPriority = 'routine' | 'urgent' | 'asap' | 'stat';
export type CommunicationWorkflowStatus =
  | 'pending'
  | 'acknowledged'
  | 'in-review'
  | 'responded'
  | 'completed';

export interface CommunicationEntityRef {
  reference: string;
  display: string;
}

export interface CommunicationPayload {
  contentString?: string;
  contentCodeableConcept?: {
    coding: Array<{
      system?: string;
      code: string;
      display: string;
    }>;
  };
  contentAttachment?: AttachmentItem;
}

export interface RequestedDocument {
  type: string;
  description: string;
  required: boolean;
}

export interface Communication {
  communicationId: string;
  correlationId: string;
  parentCommunicationId?: string;
  status: string;
  communicationType: CommunicationType;
  priority: CommunicationPriority;
  subject: CommunicationEntityRef;
  about: CommunicationEntityRef[];
  sender: CommunicationEntityRef;
  recipient: CommunicationEntityRef[];
  reasonCode: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  payload: CommunicationPayload[];
  workflowStatus: CommunicationWorkflowStatus;
  sent?: string;
  received?: string;
  dueDate?: string;
  requestedDocuments?: RequestedDocument[];
  responseAttachments?: AttachmentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunicationThreadProps {
  claimId: string;
  communications: Communication[];
  onReply?: (communicationId: string) => void;
  onDownloadAttachment?: (attachment: AttachmentItem) => void;
  isProvider?: boolean;
}

export interface ProviderInboxCommunication {
  id: string;
  correlationId: string;
  claimId: string;
  patientName: string;
  payerName: string;
  reasonCode: string;
  reasonDisplay: string;
  message: string;
  requestedDocs: string[];
  priority: 'routine' | 'urgent' | 'asap' | 'stat';
  dueDate?: string;
  receivedAt: string;
  status: 'received' | 'acknowledged' | 'in-review' | 'responded';
  workflowStatus: 'pending' | 'acknowledged' | 'in-review' | 'responded' | 'completed';
}

export interface ClaimSummary {
  claimId: string;
  correlationId: string;
  patientName: string;
  providerName: string;
  payerName: string;
  status: string;
  communicationStatus: 'none' | 'requested' | 'in-progress' | 'responded' | 'completed';
  communicationCount: number;
  lastCommunicationAt?: string;
  pendingCommunications: Array<{
    communicationId: string;
    requestedAt: string;
    dueDate?: string;
    status: 'pending' | 'responded' | 'overdue';
  }>;
}
