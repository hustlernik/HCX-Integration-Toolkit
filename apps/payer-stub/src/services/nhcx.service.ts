import axios from 'axios';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export class NHCXService {
  private nhcxBaseUrl: string;
  private apiKey: string;

  constructor() {
    this.nhcxBaseUrl = config.nhcxBaseUrl;
    this.apiKey = config.nhcxApiKey;

    logger.info('[Payer NHCXService] Init', undefined, {
      nhcxBaseUrl: this.nhcxBaseUrl,
      hasStaticApiKey: Boolean(this.apiKey),
    });
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
      'communication';
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

  /**
   * Build server-side protected headers for payer-initiated requests.
   */

  public buildProtectedHeaders(params?: {
    entityType?: string;
    status?: string;
    benAbhaId?: string;
  }): Record<string, any> {
    const entityType = params?.entityType || 'communication';
    const status = params?.status || 'request.initiated';
    const benAbhaId = params?.benAbhaId || config.benAbhaId;

    const headers: Record<string, any> = {
      'x-hcx-api_call_id': uuidv4(),
      'x-hcx-correlation_id': uuidv4(),
      'x-hcx-timestamp': Math.floor(Date.now() / 1000).toString(),
      'x-hcx-sender_code': String(config.payerCode).trim(),
      'x-hcx-recipient_code': String(config.providerCode).trim(),
      'x-hcx-status': status,
      'x-hcx-entity-type': entityType,
      'x-hcx-workflow_id': String(config.hcxWorkflowId),
      'x-hcx-request_id': uuidv4(),
      'x-hcx-ben-abha-id': benAbhaId || '',
    };
    return headers;
  }

  /**
   * Send Claim response to NHCX gateway
   */

  public async sendClaimResponse(
    encryptedResponse: string,
    endpoint: string = '/claim/on_submit',
  ): Promise<void> {
    try {
      const isAbsolute = typeof endpoint === 'string' && endpoint.startsWith('http');
      const requestUrl = isAbsolute ? endpoint : `${this.nhcxBaseUrl}${endpoint}`;

      const bearer = await this.getAccessToken();
      const requestHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        bearer_auth: `Bearer ${bearer}`,
      };

      try {
        const urlObj = new URL(requestUrl);
        requestHeaders['Host'] = urlObj.host;
      } catch {}

      const requestPayload = {
        type: 'JWEPayload',
        payload: encryptedResponse,
      };

      let protectedHeaderSummary: any = undefined;
      try {
        const parts = encryptedResponse.split('.');
        const b64 = parts[0];
        const pad = '='.repeat((4 - (b64.length % 4)) % 4);
        const json = Buffer.from(b64 + pad, 'base64').toString('utf8');
        const hdr = JSON.parse(json);
        protectedHeaderSummary = {
          alg: hdr.alg,
          enc: hdr.enc,
          'x-hcx-sender_code': hdr['x-hcx-sender_code'],
          'x-hcx-recipient_code': hdr['x-hcx-recipient_code'],
          'x-hcx-api_call_id': hdr['x-hcx-api_call_id'],
          'x-hcx-correlation_id': hdr['x-hcx-correlation_id'],
          'x-hcx-workflow_id': hdr['x-hcx-workflow_id'],
          'x-hcx-timestamp': hdr['x-hcx-timestamp'],
          'x-hcx-status': hdr['x-hcx-status'],
          'x-hcx-entity-type': hdr['x-hcx-entity-type'],
          'x-hcx-ben-abha-id': hdr['x-hcx-ben-abha-id'],
        };
      } catch {}

      logger.info('[Payer NHCXService] Sending Claim response to NHCX', undefined, {
        requestUrl,
        endpoint,
        headers: Object.keys(requestHeaders),
        payloadType: typeof encryptedResponse,
        payloadLength: encryptedResponse.length,
        protectedHeaderSummary,
      });
      logger.debug('[Payer NHCXService] Request body (claim/on_submit)', undefined, {
        requestPayload,
      });

      const response = await axios.post(requestUrl, requestPayload, {
        headers: requestHeaders,
        timeout: 30000,
      });

      try {
        const respText =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const respPreview = respText ? respText.substring(0, 500) : '';
        logger.info('[Payer NHCXService] Claim response sent to NHCX successfully', undefined, {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          dataPreview: respPreview,
          responseHeaders: response.headers ? Object.keys(response.headers) : [],
        });
      } catch (_) {
        logger.info(
          '[Payer NHCXService] Claim response sent to NHCX successfully (no preview)',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
            endpoint,
          },
        );
      }
    } catch (error) {
      const err: any = error;
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      const data = err?.response?.data;
      const code = err?.code;

      let preview = '';
      try {
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        preview = text ? text.substring(0, 500) : '';
      } catch {}

      const safeError = {
        name: err?.name,
        message: err?.message,
        code,
        stack: err?.stack,
      };
      logger.error('[Payer NHCXService] Error sending claim response to NHCX', err, {
        status,
        statusText,
        code,
        endpoint,
        url:
          typeof endpoint === 'string' && endpoint.startsWith('http')
            ? endpoint
            : `${this.nhcxBaseUrl}${endpoint}`,
        preview,
        safeError,
      });

      if (status === 400) {
        throw new Error(
          `Bad Request to NHCX: ${statusText || 'Invalid payload format or headers'}`,
        );
      } else if (status === 401) {
        throw new Error(`Unauthorized NHCX request: ${statusText || 'Invalid or expired token'}`);
      } else if (status === 403) {
        throw new Error(`Forbidden NHCX request: ${statusText || 'Insufficient permissions'}`);
      } else if (status === 404) {
        throw new Error(`NHCX endpoint not found: ${endpoint}`);
      } else if (status >= 500) {
        throw new Error(`NHCX server error: ${statusText || 'Internal server error'}`);
      } else {
        throw new Error(
          `Failed to send claim response to NHCX: ${err?.message || 'Unknown error'}`,
        );
      }
    }
  }

  /**
   * Send CoverageEligibility response to NHCX gateway
   */

  public async sendCoverageEligibilityResponse(
    encryptedResponse: string,
    endpoint: string = '/coverageeligibility/on_check',
  ): Promise<void> {
    try {
      const isAbsolute = typeof endpoint === 'string' && endpoint.startsWith('http');
      const requestUrl = isAbsolute ? endpoint : `${this.nhcxBaseUrl}${endpoint}`;

      const bearer = await this.getAccessToken();
      const requestHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        bearer_auth: `Bearer ${bearer}`,
      };

      try {
        const urlObj = new URL(requestUrl);
        requestHeaders['Host'] = urlObj.host;
      } catch {}

      const requestPayload = {
        type: 'JWEPayload',
        payload: encryptedResponse,
      };

      let protectedHeaderSummary: any = undefined;
      try {
        const parts = encryptedResponse.split('.');
        const b64 = parts[0];
        const pad = '='.repeat((4 - (b64.length % 4)) % 4);
        const json = Buffer.from(b64 + pad, 'base64').toString('utf8');
        const hdr = JSON.parse(json);
        protectedHeaderSummary = {
          alg: hdr.alg,
          enc: hdr.enc,
          'x-hcx-sender_code': hdr['x-hcx-sender_code'],
          'x-hcx-recipient_code': hdr['x-hcx-recipient_code'],
          'x-hcx-api_call_id': hdr['x-hcx-api_call_id'],
          'x-hcx-request_id': hdr['x-hcx-request_id'],
          'x-hcx-correlation_id': hdr['x-hcx-correlation_id'],
          'x-hcx-workflow_id': hdr['x-hcx-workflow_id'],
          'x-hcx-timestamp': hdr['x-hcx-timestamp'],
          'x-hcx-timestamp_typeof': typeof hdr['x-hcx-timestamp'],
          'x-hcx-status': hdr['x-hcx-status'],
          'x-hcx-entity-type': hdr['x-hcx-entity-type'],
          'x-hcx-ben-abha-id': hdr['x-hcx-ben-abha-id'],
        };
      } catch {}

      logger.info('[Payer NHCXService] Sending CoverageEligibility response to NHCX', undefined, {
        requestUrl,
        endpoint,
        headers: Object.keys(requestHeaders),
        payloadType: typeof encryptedResponse,
        payloadLength: encryptedResponse.length,
        protectedHeaderSummary,
      });
      logger.debug('[Payer NHCXService] Request body (coverageeligibility/on_check)', undefined, {
        requestPayload,
      });

      const response = await axios.post(requestUrl, requestPayload, {
        headers: requestHeaders,
        timeout: 30000,
      });

      try {
        const respText =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const respPreview = respText ? respText.substring(0, 500) : '';
        logger.info(
          '[Payer NHCXService] CoverageEligibility response sent to NHCX successfully',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
            endpoint,
            dataPreview: respPreview,
            responseHeaders: response.headers ? Object.keys(response.headers) : [],
          },
        );
      } catch (_) {
        logger.info(
          '[Payer NHCXService] CoverageEligibility response sent to NHCX successfully (no preview)',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
            endpoint,
          },
        );
      }
    } catch (error) {
      const err: any = error;
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      const data = err?.response?.data;
      const code = err?.code;

      let preview = '';
      try {
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        preview = text ? text.substring(0, 500) : '';
      } catch {}

      logger.error('[Payer NHCXService] Error sending CoverageEligibility response to NHCX', err, {
        status,
        statusText,
        code,
        endpoint,
        url:
          typeof endpoint === 'string' && endpoint.startsWith('http')
            ? endpoint
            : `${this.nhcxBaseUrl}${endpoint}`,
        preview,
      });

      if (status === 400) {
        throw new Error(
          `Bad Request to NHCX: ${statusText || 'Invalid payload format or headers'}`,
        );
      } else if (status === 401) {
        throw new Error(`Unauthorized NHCX request: ${statusText || 'Invalid or expired token'}`);
      } else if (status === 403) {
        throw new Error(`Forbidden NHCX request: ${statusText || 'Insufficient permissions'}`);
      } else if (status === 404) {
        throw new Error(`NHCX endpoint not found: ${endpoint}`);
      } else if (status >= 500) {
        throw new Error(`NHCX server error: ${statusText || 'Internal server error'}`);
      } else {
        throw new Error(`Failed to send response to NHCX: ${err?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Send Communication request to NHCX gateway (payer initiator)
   */

  public async sendCommunicationRequest(
    encryptedRequest: string,
    endpoint: string = '/communication/request',
  ): Promise<void> {
    try {
      const isAbsolute = typeof endpoint === 'string' && endpoint.startsWith('http');
      const requestUrl = isAbsolute ? endpoint : `${this.nhcxBaseUrl}${endpoint}`;

      const bearer = await this.getAccessToken();
      const requestHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        bearer_auth: `Bearer ${bearer}`,
      };

      try {
        const urlObj = new URL(requestUrl);
        requestHeaders['Host'] = urlObj.host;
      } catch {}

      const requestPayload = { payload: encryptedRequest };

      let protectedHeaderSummary: any = undefined;
      try {
        const parts = encryptedRequest.split('.');
        const b64 = parts[0];
        const pad = '='.repeat((4 - (b64.length % 4)) % 4);
        const json = Buffer.from(b64 + pad, 'base64').toString('utf8');
        const hdr = JSON.parse(json);
        protectedHeaderSummary = {
          alg: hdr.alg,
          enc: hdr.enc,
          'x-hcx-sender_code': hdr['x-hcx-sender_code'],
          'x-hcx-recipient_code': hdr['x-hcx-recipient_code'],
          'x-hcx-api_call_id': hdr['x-hcx-api_call_id'],
          'x-hcx-correlation_id': hdr['x-hcx-correlation_id'],
          'x-hcx-timestamp': hdr['x-hcx-timestamp'],
          'x-hcx-status': hdr['x-hcx-status'],
          'x-hcx-entity-type': hdr['x-hcx-entity-type'],
        };
      } catch {}

      logger.info('[Payer NHCXService] Sending Communication request to NHCX', undefined, {
        requestUrl,
        endpoint,
        headers: Object.keys(requestHeaders),
        payloadType: typeof encryptedRequest,
        payloadLength: encryptedRequest.length,
        protectedHeaderSummary,
      });

      const response = await axios.post(requestUrl, requestPayload, {
        headers: requestHeaders,
        timeout: 30000,
      });

      logger.info(
        '[Payer NHCXService] Communication request sent to NHCX successfully',
        undefined,
        {
          status: response.status,
          statusText: response.statusText,
          endpoint,
        },
      );
    } catch (error) {
      const err: any = error;
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      const data = err?.response?.data;
      const code = err?.code;

      let preview = '';
      try {
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        preview = text ? text.substring(0, 500) : '';
      } catch {}

      logger.error('[Payer NHCXService] Error sending Communication request to NHCX', err, {
        status,
        statusText,
        code,
        endpoint,
        url:
          typeof endpoint === 'string' && endpoint.startsWith('http')
            ? endpoint
            : `${this.nhcxBaseUrl}${endpoint}`,
        preview,
      });

      if (status === 400) {
        throw new Error(
          `Bad Request to NHCX: ${statusText || 'Invalid payload format or headers'}`,
        );
      } else if (status === 401) {
        throw new Error(`Unauthorized NHCX request: ${statusText || 'Invalid or expired token'}`);
      } else if (status === 403) {
        throw new Error(`Forbidden NHCX request: ${statusText || 'Insufficient permissions'}`);
      } else if (status === 404) {
        throw new Error(`NHCX endpoint not found: ${endpoint}`);
      } else if (status >= 500) {
        throw new Error(`NHCX server error: ${statusText || 'Internal server error'}`);
      } else {
        throw new Error(
          `Failed to send communication request to NHCX: ${err?.message || 'Unknown error'}`,
        );
      }
    }
  }

  /**
   * Send InsurancePlan response to NHCX gateway
   */
  public async sendInsurancePlanResponse(
    encryptedResponse: string,
    endpoint: string = '/insuranceplan/on_request',
  ): Promise<void> {
    try {
      const isAbsolute = typeof endpoint === 'string' && endpoint.startsWith('http');
      const requestUrl = isAbsolute ? endpoint : `${this.nhcxBaseUrl}${endpoint}`;

      const bearer = await this.getAccessToken();
      const requestHeaders: Record<string, string> = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        bearer_auth: `Bearer ${bearer}`,
      };

      try {
        const urlObj = new URL(requestUrl);
        requestHeaders['Host'] = urlObj.host;
      } catch {}

      const requestPayload = {
        type: 'JWEPayload',
        payload: encryptedResponse,
      };

      let protectedHeaderSummary: any = undefined;
      try {
        const parts = encryptedResponse.split('.');
        const b64 = parts[0];
        const pad = '='.repeat((4 - (b64.length % 4)) % 4);
        const json = Buffer.from(b64 + pad, 'base64').toString('utf8');
        const hdr = JSON.parse(json);
        protectedHeaderSummary = {
          alg: hdr.alg,
          enc: hdr.enc,
          'x-hcx-sender_code': hdr['x-hcx-sender_code'],
          'x-hcx-recipient_code': hdr['x-hcx-recipient_code'],
          'x-hcx-api_call_id': hdr['x-hcx-api_call_id'],
          'x-hcx-request_id': hdr['x-hcx-request_id'],
          'x-hcx-correlation_id': hdr['x-hcx-correlation_id'],
          'x-hcx-workflow_id': hdr['x-hcx-workflow_id'],
          'x-hcx-timestamp': hdr['x-hcx-timestamp'],
          'x-hcx-status': hdr['x-hcx-status'],
          'x-hcx-entity-type': hdr['x-hcx-entity-type'],
          'x-hcx-ben-abha-id': hdr['x-hcx-ben-abha-id'],
        };
      } catch {}

      logger.info('[Payer NHCXService] Sending response to NHCX', undefined, {
        requestUrl,
        endpoint,
        headers: Object.keys(requestHeaders),
        payloadType: typeof encryptedResponse,
        payloadLength: encryptedResponse.length,
        protectedHeaderSummary,
      });
      logger.debug('[Payer NHCXService] Request body (on_request)', undefined, { requestPayload });

      const response = await axios.post(requestUrl, requestPayload, {
        headers: requestHeaders,
        timeout: 30000,
      });

      try {
        const respText =
          typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const respPreview = respText ? respText.substring(0, 500) : '';
        logger.info('[Payer NHCXService] Response sent to NHCX successfully', undefined, {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          dataPreview: respPreview,
          responseHeaders: response.headers ? Object.keys(response.headers) : [],
        });
      } catch (_) {
        logger.info(
          '[Payer NHCXService] Response sent to NHCX successfully (no preview)',
          undefined,
          {
            status: response.status,
            statusText: response.statusText,
            endpoint,
          },
        );
      }
    } catch (error) {
      const err: any = error;
      const status = err?.response?.status;
      const statusText = err?.response?.statusText;
      const data = err?.response?.data;
      const code = err?.code;

      let preview = '';
      try {
        const text = typeof data === 'string' ? data : JSON.stringify(data);
        preview = text ? text.substring(0, 500) : '';
      } catch {}

      const safeError = {
        name: err?.name,
        message: err?.message,
        code,
        stack: err?.stack,
      };
      logger.error('[Payer NHCXService] Error sending response to NHCX', err, {
        status,
        statusText,
        code,
        endpoint,
        url:
          typeof endpoint === 'string' && endpoint.startsWith('http')
            ? endpoint
            : `${this.nhcxBaseUrl}${endpoint}`,
        preview,
      });

      if (status === 400) {
        throw new Error(
          `Bad Request to NHCX: ${statusText || 'Invalid payload format or headers'}`,
        );
      } else if (status === 401) {
        throw new Error(`Unauthorized NHCX request: ${statusText || 'Invalid or expired token'}`);
      } else if (status === 403) {
        throw new Error(`Forbidden NHCX request: ${statusText || 'Insufficient permissions'}`);
      } else if (status === 404) {
        throw new Error(`NHCX endpoint not found: ${endpoint}`);
      } else if (status >= 500) {
        throw new Error(`NHCX server error: ${statusText || 'Internal server error'}`);
      } else {
        throw new Error(`Failed to send response to NHCX: ${err?.message || 'Unknown error'}`);
      }
    }
  }
  /**
   * Get access token.
   */
  public async getAccessToken(): Promise<string> {
    try {
      const sessionUrl = config.sessionApiUrl;

      const clientId = config.abdmClientId;
      const clientSecret = config.abdmClientSecret;
      const grantType = config.abdmGrantType || 'client_credentials';

      const maskedClient = clientId ? clientId.slice(0, 4) + '***' : 'none';
      logger.info('[Payer NHCXService] Requesting ABDM session token', undefined, {
        url: sessionUrl,
        clientId: maskedClient,
        grantType,
      });

      const requestId =
        (globalThis as any)?.crypto?.randomUUID?.() ||
        `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const timestamp = new Date().toISOString();
      const hostHeader = (() => {
        try {
          return new URL(sessionUrl).host;
        } catch {
          return undefined as any;
        }
      })();

      const response = await axios.post(
        sessionUrl,
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
        },
      );
      const token = response.data?.accessToken as string;
      logger.info('[Payer NHCXService] Obtained ABDM access token from Session API');
      return token;
    } catch (e: any) {
      logger.error('[Payer NHCXService] Failed to obtain ABDM token from Session API', e);
      if (this.apiKey) {
        logger.warn('[Payer NHCXService] Falling back to static API key for Authorization header');
        return this.apiKey;
      }
      throw new Error('Unable to obtain ABDM access token');
    }
  }
}
