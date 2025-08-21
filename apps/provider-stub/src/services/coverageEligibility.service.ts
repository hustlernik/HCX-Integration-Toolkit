import { encryptFHIR } from '../utils/crypto';
import { NHCXService } from './nhcx.service';
import { logger } from '../utils/logger';
import axios, { AxiosResponse } from 'axios';

export class CoverageEligibilityService {
  private nhcx: NHCXService;

  constructor(nhcx = new NHCXService()) {
    this.nhcx = nhcx;
  }

  /**
   * Send Coverage Eligibility request to NHCX
   */

  async sendRequest(
    payload: Record<string, any>,
    protectedHeaders: Record<string, string>,
  ): Promise<AxiosResponse<any>> {
    const correlationId = protectedHeaders['x-hcx-correlation_id'] as string;

    logger.debug('[CoverageEligibilityService] Pre-encrypt headers', undefined, {
      protectedHeaders,
      correlationId,
    });
    const encryptedPayload = await encryptFHIR(payload, protectedHeaders, {});
    logger.debug('[CoverageEligibilityService] Encrypted CoverageEligibility JWE', undefined, {
      length: (encryptedPayload as string).length,
      correlationId,
    });

    const accessToken = await this.nhcx.getAccessToken();
    const url = `${this.nhcx.getBaseUrl()}/coverageeligibility/check`;
    const hostHeader = new URL(url).host;

    logger.info('[CoverageEligibilityService] POST /coverageeligibility/check', undefined, {
      url,
      sender: protectedHeaders['x-hcx-sender_code'],
      recipient: protectedHeaders['x-hcx-recipient_code'],
      correlationId,
      host: hostHeader,
      auth: `Bearer ${accessToken}`,
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

    logger.info('[CoverageEligibilityService] Coverage eligibility request sent', undefined, {
      status: response.status,
      correlationId,
    });
    return response;
  }
}
