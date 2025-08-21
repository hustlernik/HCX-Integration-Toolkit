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

    logger.debug('[ClaimService] Pre-encrypt headers', undefined, {
      protectedHeaders,
      correlationId,
    });
    const encryptedPayload = await encryptFHIR(payload, protectedHeaders, {});
    logger.debug('[ClaimService] Encrypted Claim JWE', undefined, {
      length: (encryptedPayload as string).length,
      correlationId,
    });

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
      },
    );

    logger.info('[ClaimService] Claim submit sent', undefined, {
      status: response.status,
      correlationId,
    });
    return response;
  }
}
