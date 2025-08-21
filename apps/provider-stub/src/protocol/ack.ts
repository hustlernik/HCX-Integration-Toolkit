import { ProtectedHeader } from '../utils/jwe';

export interface ProtocolSuccessResponse {
  timestamp: number;
  apiCallId: string;
  correlationId: string;
  result: {
    senderCode: string;
    recipientCode: string;
    entityType: string;
    protocolStatus:
      | 'request.queued'
      | 'request.initiated'
      | 'request.dispatched'
      | 'request.stopped'
      | 'request.complete'
      | 'response.complete'
      | 'response.partial'
      | 'response.error'
      | 'response.fail'
      | 'acknowledged';
  };
  error: { code: string; message: string };
}
