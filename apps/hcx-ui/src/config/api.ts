export const API_CONFIG = {
  PROVIDER: {
    BASE_URL: import.meta.env.VITE_PROVIDER_API_BASE_URL || 'http://localhost:4001',
    ENDPOINTS: {
      TRANSACTIONS: '/hcx/v1/transactions',
      PREAUTH: '/api/send-preauth',
      CLAIM: '/api/send-claim',
      PAYMENT_NOTICE: '/api/send-payment-notice',
      PREDETERMINATION: '/api/send-predetermination',
      INSURANCE_PLAN: '/hcx/v1/insuranceplan/request',
      COVERAGE_ELIGIBILITY: '/hcx/v1/coverageeligibility/check',
    },
  },
  PAYER: {
    BASE_URL: import.meta.env.VITE_PAYER_API_BASE_URL || 'http://localhost:3001',
    ENDPOINTS: {},
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
    CLAIM: getProviderApiUrl('/api/send-claim'),
    PAYMENT_NOTICE: getProviderApiUrl('/api/send-payment-notice'),
    PREDETERMINATION: getProviderApiUrl('/api/send-predetermination'),
    INSURANCE_PLAN: getProviderApiUrl('/hcx/v1/insuranceplan/request'),
    COVERAGE_ELIGIBILITY: getProviderApiUrl('/hcx/v1/coverageeligibility/check'),
  },
  PAYER: {},
} as const;
