import { v4 as uuidv4 } from 'uuid';
import { getISTTimestamp } from '@/utils/getISTTImestamp';

interface Header {
  key: string;
  value: string;
}

export const DEFAULT_HEADERS: Header[] = [
  { key: 'x-hcx-api_call_id', value: uuidv4() },
  { key: 'x-hcx-workflow_id', value: '1' },
  { key: 'x-hcx-request_id', value: uuidv4() },
  { key: 'x-hcx-status', value: 'request.initiated' },
  { key: 'x-hcx-timestamp', value: getISTTimestamp() },
  { key: 'x-hcx-sender_code', value: 'xxxxx@hcx' },
  { key: 'x-hcx-recipient_code', value: 'xxx@hcx' },
  { key: 'x-hcx-correlation_id', value: uuidv4() },
  { key: 'x-hcx-ben-abha-id', value: 'xxxxx' },
];
