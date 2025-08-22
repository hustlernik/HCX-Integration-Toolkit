import { Buffer } from 'buffer';

export interface ProtectedHeader {
  alg?: string;
  enc?: string;
  'x-hcx-api_call_id'?: string;
  'x-hcx-workflow_id'?: string | number;
  'x-hcx-request_id'?: string;
  'x-hcx-status'?: string;
  'x-hcx-timestamp'?: string | number;
  'x-hcx-sender_code'?: string;
  'x-hcx-recipient_code'?: string;
  'x-hcx-correlation_id'?: string;
  'x-hcx-entity-type'?: string;
  'x-hcx-ben-abha-id'?: string;
  [k: string]: any;
}

export function decodeProtectedHeader(jwe: string): ProtectedHeader | null {
  try {
    const protectedPart = String(jwe).split('.')[0] || '';
    if (!protectedPart) return null;
    const b64 = protectedPart.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(b64 + pad, 'base64').toString('utf8');
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? (parsed as ProtectedHeader) : null;
  } catch {
    return null;
  }
}
