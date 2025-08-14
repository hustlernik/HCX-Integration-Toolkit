export const API_CONFIG = {
  PROVIDER: {
    BASE_URL: import.meta.env.VITE_PROVIDER_API_BASE_URL || 'http://localhost:4001',
    ENDPOINTS: {
      TRANSACTIONS: '/hcx/v1/transactions',
      PREAUTH: '/api/send-preauth',
      CLAIM: '/hcx/v1/claim/submit',
      PAYMENT_NOTICE: '/api/send-payment-notice',
      PREDETERMINATION: '/api/send-predetermination',
      INSURANCE_PLAN: '/hcx/v1/insuranceplan/request',
      COVERAGE_ELIGIBILITY: '/hcx/v1/coverageeligibility/check',
      COMMUNICATION_INBOX: '/hcx/v1/communication/inbox',
    },
  },
  PAYER: {
    BASE_URL: import.meta.env.VITE_PAYER_API_BASE_URL || 'http://localhost:3001',
    ENDPOINTS: {
      INSURANCE_PLAN: '/api/insurance-plans',
      BENEFICIARY: '/api/beneficiary',
      POLICIES: '/api/policies',
      COVERAGE_ELIGIBILITY_REQUEST: '/hcx/v1/coverageeligibility/requests',
      COVERAGE_ELIGIBILITY_CHECK: '/hcx/v1/coverageeligibility/on_check',
      CLAIMS: '/api/claims',
      CLAIM_ADJUDICATE: '/hcx/v1/claim/adjudicate',
      COMMUNICATIONS: '/api/communications',
      COMMUNICATION_REQUEST: '/hcx/v1/communication/request',
      COMMUNICATION_RESPONSE: '/hcx/v1/communication/response',
    },
  },
  FHIR: {
    SERVER_URL: import.meta.env.VITE_FHIR_SERVER_URL || 'http://hapi.fhir.org/baseR4',
  },
} as const;

export const getProviderApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.PROVIDER.BASE_URL}${endpoint}`;
};

export const getPayerApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.PAYER.BASE_URL}${endpoint}`;
};

export const API_ENDPOINTS = {
  PROVIDER: {
    TRANSACTIONS: getProviderApiUrl('/hcx/v1/transactions'),
    PREAUTH: getProviderApiUrl('/api/send-preauth'),
    CLAIM: getProviderApiUrl('/hcx/v1/claim/submit'),
    PAYMENT_NOTICE: getProviderApiUrl('/api/send-payment-notice'),
    PREDETERMINATION: getProviderApiUrl('/api/send-predetermination'),
    INSURANCE_PLAN: getProviderApiUrl('/hcx/v1/insuranceplan/request'),
    COVERAGE_ELIGIBILITY: getProviderApiUrl('/hcx/v1/coverageeligibility/check'),
    COMMUNICATION_INBOX: getProviderApiUrl('/hcx/v1/communication/inbox'),
  },
  PAYER: {
    INSURANCE_PLAN: getPayerApiUrl('/api/insurance-plans'),
    BENEFICIARY: getPayerApiUrl('/api/beneficiary'),
    POLICIES: getPayerApiUrl('/api/policies'),
    COVERAGE_ELIGIBILITY_REQUEST: getPayerApiUrl('/hcx/v1/coverageeligibility/requests'),
    COVERAGE_ELIGIBILITY_CHECK: getPayerApiUrl('/hcx/v1/coverageeligibility/on_check'),
    CLAIMS: getPayerApiUrl('/api/claims'),
    CLAIM_ADJUDICATE: getPayerApiUrl('/hcx/v1/claim/adjudicate'),
    COMMUNICATIONS: getPayerApiUrl('/api/communications'),
    COMMUNICATION_REQUEST: getPayerApiUrl('/hcx/v1/communication/request'),
    COMMUNICATION_RESPONSE: getPayerApiUrl('/hcx/v1/communication/response'),
  },
} as const;
