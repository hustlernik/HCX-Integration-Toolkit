export interface NHCXProtocolHeaders {
  'x-hcx-sender_code': string | undefined;
  'x-hcx-api_call_id': string | undefined;
  'x-hcx-recipient_code': string | undefined;
  'x-hcx-request_id'?: string | undefined;
  'x-hcx-correlation_id': string | undefined;
  'x-hcx-workflow_id'?: string | undefined;
  'x-hcx-timestamp': string | number;
  'x-hcx-debug_flag'?: 'Error' | 'Info' | 'Debug' | undefined;
  'x-hcx-ben-abha-id': string;
  'x-hcx-entity-type'?: string | undefined;
  'x-hcx-status':
    | 'request.initiated'
    | 'request.queued'
    | 'request.dispatched'
    | 'request.stopped'
    | 'response.complete'
    | 'response.partial'
    | 'response.error';
  'x-hcx-error_details'?: {
    code: string;
    message: string;
    trace: string;
  };

  'x-hcx-debug_details'?: {
    code: string;
    message: string;
    trace: string;
  };
}

export interface NHCXDomainHeaders {
  [key: string]: any;
}

export interface NHCXMessage {
  protectedHeaders: {
    alg: string;
    enc: string;
    typ: string;
  } & NHCXProtocolHeaders &
    NHCXDomainHeaders;
  payload: string;
}

export interface NHCXInsurancePlanRequest {
  requestId: string;
  beneficiaryId: string;
  planId?: string;
  planType?: string;
}

export interface NHCXInsurancePlanResponse {
  requestId: string;
  correlationId: string;
  plans: Array<{
    id: string;
    name: string;
    type: string;
    planType?: string;
    status: string;
  }>;
  status: 'success' | 'error';
  errorDetails?: {
    code: string;
    message: string;
  };
}

export interface NHCXErrorResponse {
  error: {
    code: string;
    message: string;
    trace?: string;
  };
}
