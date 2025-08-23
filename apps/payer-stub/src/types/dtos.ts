import { NHCXProtocolHeaders } from './nhcx';

export interface OnRequestBody {
  type: 'JWEPayload';
  payload: string;
}

export interface ProtocolSuccessResponse {
  timestamp: string;
  api_call_id: string;
  correlation_id: string;
  result: {
    sender_code: string;
    recipient_code: string;
    entity_type: string;
    protocol_status:
      | 'request.initiated'
      | 'request.queued'
      | 'request.dispatched'
      | 'request.stopped'
      | 'request.complete'
      | 'response.complete'
      | 'response.partial'
      | 'response.error'
      | 'response.fail'
      | 'acknowledged';
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ProtectedHeaderSummary {
  alg?: string;
  enc?: string;
  'x-hcx-sender_code'?: string;
  'x-hcx-recipient_code'?: string;
  'x-hcx-api_call_id'?: string;
  'x-hcx-request_id'?: string;
  'x-hcx-correlation_id'?: string;
  'x-hcx-workflow_id'?: string;
  'x-hcx-timestamp'?: string | number;
  'x-hcx-status'?: string;
  'x-hcx-entity-type'?: string;
  'x-hcx-ben-abha-id'?: string;
}
