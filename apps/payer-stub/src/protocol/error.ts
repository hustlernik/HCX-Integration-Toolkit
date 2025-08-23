import { NHCXProtocolHeaders } from '../types/nhcx';
import { config } from '../config';

export interface ProtocolErrorResponseBody {
  type: 'ProtocolResponse';
  'x-hcx-sender_code': string;
  'x-hcx-recipient_code': string;
  'x-hcx-api_call_id': string;
  'x-hcx-correlation_id': string;
  'x-hcx-debug_flag': 'Error';
  'x-hcx-status': 'response.error';
  'x-hcx-redirect_to': string;
  'x-hcx-error_details': {
    code: string;
    message: string;
    trace?: string;
  };
  'x-hcx-debug_details'?: {
    code: string;
    message: string;
    trace?: string;
  };
  'x-hcx-domain-header'?: Record<string, any>;
  'x-hcx-entity-type': string;
  'x-hcx-ben-abha-id'?: string;
}

export function buildProtocolErrorResponse(
  headers: NHCXProtocolHeaders,
  details: { code: string; message: string; trace?: string },
  entityType: string,
): ProtocolErrorResponseBody {
  return {
    type: 'ProtocolResponse',
    'x-hcx-sender_code': headers['x-hcx-recipient_code'] || config.payerCode || '',
    'x-hcx-recipient_code': headers['x-hcx-sender_code'] || config.providerCode || '',
    'x-hcx-api_call_id': headers['x-hcx-api_call_id'] || '',
    'x-hcx-correlation_id': headers['x-hcx-correlation_id'] || '',
    'x-hcx-debug_flag': 'Error',
    'x-hcx-status': 'response.error',
    'x-hcx-redirect_to': '',
    'x-hcx-error_details': {
      code: details.code,
      message: details.message,
      ...(details.trace ? { trace: details.trace } : {}),
    },
    'x-hcx-entity-type': entityType,
    'x-hcx-ben-abha-id': headers['x-hcx-ben-abha-id'] || config.benAbhaId || '',
  };
}
