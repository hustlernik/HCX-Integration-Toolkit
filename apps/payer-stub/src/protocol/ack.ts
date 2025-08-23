import { NHCXProtocolHeaders } from '../types/nhcx';

export interface Accepted202Body {
  timestamp: string;
  api_call_id: string;
  correlation_id: string;
  result: {
    sender_code: string;
    recipient_code: string;
    entity_type: string;
    protocol_status:
      | 'request.queued'
      | 'request.initiated'
      | 'request.dispatched'
      | 'request.stopped'
      | 'request.complete'
      | 'response.complete'
      | 'response.partial'
      | 'response.error'
      | 'response.fail';
  };
  error: {
    code: string;
    message: string;
  };
}

type AckOverrides = {
  entityType?: string;
  protocolStatus?:
    | 'request.queued'
    | 'request.initiated'
    | 'request.dispatched'
    | 'request.stopped'
    | 'request.complete'
    | 'response.complete'
    | 'response.partial'
    | 'response.error'
    | 'response.fail';
};

export function buildAccepted202(
  headers: NHCXProtocolHeaders,
  entityTypeOrOverrides: string | AckOverrides,
): Accepted202Body {
  const overrides: AckOverrides =
    typeof entityTypeOrOverrides === 'string'
      ? { entityType: entityTypeOrOverrides }
      : entityTypeOrOverrides || {};
  const entityType = overrides.entityType || 'protocol-response';
  const protocolStatus = overrides.protocolStatus || 'response.complete';
  return {
    timestamp: Math.floor(Date.now() / 1000).toString(),
    api_call_id: headers['x-hcx-api_call_id'] || '',
    correlation_id: headers['x-hcx-correlation_id'] || '',
    result: {
      sender_code: headers['x-hcx-recipient_code'] || 'payer-stub',
      recipient_code: headers['x-hcx-sender_code'] || 'hcx',
      entity_type: entityType,
      protocol_status: protocolStatus,
    },
    error: {
      code: '',
      message: '',
    },
  };
}
