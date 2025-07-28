import { v4 as uuidv4 } from 'uuid';
import { getISTTimestamp } from '@/utils/getISTTImestamp';

interface Header {
  key: string;
  value: string;
}

export const generateDefaultHeaders = (workflowId?: string): Header[] => [
  { key: 'x-hcx-api_call_id', value: uuidv4() },
  { key: 'x-hcx-workflow_id', value: workflowId || '1' },
  { key: 'x-hcx-request_id', value: uuidv4() },
  { key: 'x-hcx-status', value: 'request.initiated' },
  { key: 'x-hcx-timestamp', value: getISTTimestamp() },
  { key: 'x-hcx-sender_code', value: import.meta.env.VITE_HCX_SENDER_CODE || 'xxxxx@hcx' },
  { key: 'x-hcx-recipient_code', value: import.meta.env.VITE_HCX_RECIPIENT_CODE || 'xxx@hcx' },
  { key: 'x-hcx-correlation_id', value: uuidv4() },
  { key: 'x-hcx-ben-abha-id', value: import.meta.env.VITE_HCX_BEN_ABHA_ID || 'xxxxx' },
];
