import { ProtectedHeader } from '../utils/jwe';

export type JWEPayloadType = 'JWEPayload';

export interface OnRequestBody {
  type: JWEPayloadType;
  payload: string;
}

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
      | 'response.complete'
      | 'response.partial'
      | 'response.error'
      | 'response.fail'
      | 'acknowledged';
  };
  error: { code: string; message: string };
}

export type { ProtectedHeader };
