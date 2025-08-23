export const config = {
  nhcxBaseUrl: process.env.NHCX_BASE_URL || 'https://apisbx.abdm.gov.in/hcx/v1',
  sessionApiUrl:
    process.env.SESSION_API_URL || 'https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions',
  payerCode: process.env.HCX_SENDER_CODE?.trim() || '1000004161@hcx',
  providerCode: process.env.HCX_RECIPIENT_CODE?.trim() || '1000004178@hcx',
  benAbhaId: process.env.HCX_BEN_ABHA_ID || process.env.BEN_ABHA_ID,
  nhcxApiKey: process.env.NHCX_API_KEY || '',
  abdmClientId: process.env.ABDM_CLIENT_ID,
  abdmClientSecret: process.env.ABDM_CLIENT_SECRET,
  abdmGrantType: process.env.ABDM_GRANT_TYPE || 'client_credentials',
  hcxWorkflowId: process.env.HCX_WORKFLOW_ID || '1',
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
};
