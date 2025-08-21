export const config = {
  nhcxBaseUrl: process.env.NHCX_BASE_URL || 'https://apisbx.abdm.gov.in/hcx/v1',
  providerCode: process.env.PROVIDER_CODE || '1000004178@hcx',
  payerCode: process.env.PAYER_CODE || '1000004161@hcx',
  providerPrivateKeyPath: process.env.PROVIDER_PRIVATE_KEY_PATH || '',
  recipientPublicKeyPath: process.env.RECIPIENT_PUBLIC_KEY_PATH || '',
  nhcxApiKey: process.env.NHCX_API_KEY || '',
  abdmClientId: process.env.ABDM_CLIENT_ID || '',
  abdmClientSecret: process.env.ABDM_CLIENT_SECRET || '',
  abdmGrantType: process.env.ABDM_GRANT_TYPE,
  sessionApiUrl:
    process.env.SESSION_API_URL || 'https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions',
  hcxWorkflowId: process.env.HCX_WORKFLOW_ID || '1',
};
