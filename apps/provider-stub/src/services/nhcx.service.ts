import axios from 'axios';
import { logger } from '../utils/logger';
import { formatHcxTimestamp } from '../utils/time';
import { v4 as uuidv4 } from 'uuid';

export class NHCXService {
  private nhcxBaseUrl!: string;
  private apiKey!: string;

  constructor() {
    this.nhcxBaseUrl = process.env.NHCX_BASE_URL || 'https://apisbx.abdm.gov.in/hcx/v1';
    this.apiKey = process.env.NHCX_API_KEY || '';

    logger.info('[Provider NHCXService] Init', undefined, {
      nhcxBaseUrl: this.nhcxBaseUrl,
      hasStaticApiKey: Boolean(this.apiKey),
    });
  }

  /**
   * Build  protected headers.
   */

  public buildProtectedHeaders(params?: {
    entityType?: string;
    status?: string;
    benAbhaId?: string;
  }): Record<string, string | undefined> {
    const entityType = params?.entityType || 'insuranceplan';
    const status = params?.status || 'request.initiated';
    const benAbhaId = params?.benAbhaId || process.env.BEN_ABHA_ID;

    const headers: Record<string, string | undefined> = {
      'x-hcx-api_call_id': uuidv4(),
      'x-hcx-correlation_id': uuidv4(),
      'x-hcx-timestamp': formatHcxTimestamp(),
      'x-hcx-sender_code': process.env.PROVIDER_CODE?.trim(),
      'x-hcx-recipient_code': process.env.PAYER_CODE?.trim(),
      'x-hcx-status': status,
      'x-hcx-entity-type': entityType,
      'x-hcx-workflow_id': process.env.HCX_WORKFLOW_ID?.trim(),
      'x-hcx-request_id': uuidv4(),
      'x-hcx-ben-abha-id': benAbhaId || '',
    };
    return headers;
  }

  public static successResponse(
    protectedHeaders: Record<string, any> | null,
    overrides: {
      entity_type?: string;
      protocol_status?:
        | 'request.queued'
        | 'request.initiated'
        | 'request.dispatched'
        | 'request.stopped'
        | 'request.complete'
        | 'response.complete'
        | 'response.partial'
        | 'response.error'
        | 'response.fail'
        | 'acknowledged';
    } = {},
  ) {
    const correlation_id = (protectedHeaders?.['x-hcx-correlation_id'] as string) || '';
    const sender_code = (protectedHeaders?.['x-hcx-sender_code'] as string) || '';
    const recipient_code = (protectedHeaders?.['x-hcx-recipient_code'] as string) || '';
    const entity_type =
      overrides.entity_type ||
      (protectedHeaders?.['x-hcx-entity-type'] as string) ||
      'insuranceplan';
    const api_call_id = (protectedHeaders?.['x-hcx-api_call_id'] as string) || `ack_${Date.now()}`;
    const headerStatus = protectedHeaders?.['x-hcx-status'] as string as
      | typeof overrides.protocol_status
      | undefined;
    const protocol_status = overrides.protocol_status || headerStatus || 'request.queued';

    return {
      timestamp: Math.floor(Date.now() / 1000),
      api_call_id,
      correlation_id,
      result: {
        sender_code,
        recipient_code,
        entity_type,
        protocol_status,
      },
      error: { code: '', message: '' },
    };
  }

  public getBaseUrl(): string {
    return this.nhcxBaseUrl;
  }

  public async getAccessToken(): Promise<string> {
    try {
      const clientId = process.env.ABDM_CLIENT_ID;
      const clientSecret = process.env.ABDM_CLIENT_SECRET;
      const grantType = process.env.ABDM_GRANT_TYPE || 'client_credentials';

      logger.info('[Provider NHCXService] Requesting ABDM session token', undefined, {
        url: process.env.SESSION_API_URL,
        grantType,
      });

      const requestId =
        (globalThis as any)?.crypto?.randomUUID?.() ||
        `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const timestamp = new Date().toISOString();
      const hostHeader = (() => {
        try {
          return new URL('https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions').host;
        } catch {
          return undefined as any;
        }
      })();

      try {
        const response = await axios.post(
          'https://dev.abdm.gov.in/api/hiecm/gateway/v3/sessions',
          {
            clientId,
            clientSecret,
            grantType,
          },
          {
            headers: {
              Accept: '*/*',
              'Content-Type': 'application/json',
              'REQUEST-ID': requestId,
              TIMESTAMP: timestamp,
              'X-CM-ID': 'sbx',
              ...(hostHeader ? { Host: hostHeader } : {}),
            },
            timeout: 15_000,
          },
        );

        const token = response.data?.accessToken as string;
        logger.info(
          '[Provider NHCXService] Obtained ABDM access token from Session API',
          undefined,
          {
            url: process.env.SESSION_API_URL,
            requestId,
            status: response.status,
          },
        );
        return token;
      } catch (error: unknown) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as { code?: string })?.code;
        const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
        const responseHeaders = axios.isAxiosError(error) ? error.response?.headers : undefined;

        logger.error('[Provider NHCXService] Failed to obtain ABDM access token', undefined, {
          url: process.env.SESSION_API_URL,
          requestId,
          status,
          error: errorMessage,
          code: errorCode,
          responseData,
          responseHeaders,
        });
        throw error;
      }
    } catch (e) {
      logger.error('[Provider NHCXService] Failed to obtain ABDM token from Session API', e);
      if (this.apiKey) {
        logger.warn(
          '[Provider NHCXService] Falling back to static API key for Authorization header.',
        );
        return this.apiKey;
      }
      throw new Error('Unable to obtain ABDM access token (provider)');
    }
  }
}
