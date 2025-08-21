import axios, { AxiosResponse } from 'axios';
import { encryptFHIR } from '../utils/crypto';
import { NHCXService } from './nhcx.service';
import { logger } from '../utils/logger';

export class ClaimService {
  private nhcx: NHCXService;

  constructor(nhcx = new NHCXService()) {
    this.nhcx = nhcx;
  }

  /**
   * Send Claim submit request to NHCX
   **/

  async sendRequest(
    payload: Record<string, any>,
    protectedHeaders: Record<string, string>,
  ): Promise<AxiosResponse<any>> {
    const correlationId = protectedHeaders['x-hcx-correlation_id'] as string;

    const encryptedPayload = await encryptFHIR(payload, protectedHeaders, {});

    const accessToken = await this.nhcx.getAccessToken();
    const url = `${this.nhcx.getBaseUrl()}/claim/submit`;
    const hostHeader = new URL(url).host;

    logger.info('[ClaimService] POST /claim/submit', undefined, {
      url,
      sender: protectedHeaders['x-hcx-sender_code'],
      recipient: protectedHeaders['x-hcx-recipient_code'],
      correlationId,
      host: hostHeader,
    });

    try {
      const response = await axios.post(
        url,
        { payload: encryptedPayload },
        {
          headers: {
            bearer_auth: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Host: hostHeader,
          },
          timeout: 15_000,
        },
      );

      logger.info('[ClaimService] Claim submit sent successfully', undefined, {
        status: response.status,
        correlationId,
        url,
        sender: protectedHeaders['x-hcx-sender_code'],
        recipient: protectedHeaders['x-hcx-recipient_code'],
      });
      return response;
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as { code?: string })?.code;
      const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
      const responseHeaders = axios.isAxiosError(error) ? error.response?.headers : undefined;

      logger.error('[ClaimService] Failed to submit claim', undefined, {
        correlationId,
        url,
        status,
        error: errorMessage,
        code: errorCode,
        responseData,
        responseHeaders,
      });
      throw error;
    }
  }
}
