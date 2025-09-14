import { encryptFHIR } from '../utils/crypto';
import { NHCXService } from './nhcx.service';
import { EncryptionService } from './encryption.service';
import { logger } from '../utils/logger';
import axios, { AxiosResponse } from 'axios';

export class CoverageEligibilityService {
  private nhcx: NHCXService;
  private encryptionService: EncryptionService;

  constructor(nhcx = new NHCXService(), encryptionService = new EncryptionService()) {
    this.nhcx = nhcx;
    this.encryptionService = encryptionService;
  }

  /**
   * Send Coverage Eligibility request to NHCX
   */

  async sendRequest(payload: Record<string, any>): Promise<AxiosResponse<any>> {
    const encryptionResponse = await this.encryptionService.encryptPayload({
      resourceType: 'CoverageEligibilityRequest',
      sender: process.env.PROVIDER_CODE || '',
      receiver: process.env.PAYER_CODE || '',
      payload: payload,
    });

    const { encryptedPayload, correlationID } = encryptionResponse;

    const accessToken = await this.nhcx.getAccessToken();
    const url = `${this.nhcx.getBaseUrl()}/coverageeligibility/check`;
    const hostHeader = new URL(url).host;

    logger.info('[CoverageEligibilityService] POST /coverageeligibility/check', undefined, {
      url,
      sender: process.env.PROVIDER_CODE || '',
      recipient: process.env.PAYER_CODE || '',
      correlationId: correlationID,
      host: hostHeader,
    });

    try {
      const requestHeaders = {
        bearer_auth: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(hostHeader ? { Host: hostHeader } : {}),
      };

      logger.info('Sending encrypted coverage eligibility payload to NHCX', {
        url,
        headers: Object.keys(requestHeaders).filter((k) => k.toLowerCase() !== 'authorization'),
        payloadLength: encryptedPayload.length,
      });

      const response = await axios.post(
        url,
        { payload: encryptedPayload },
        {
          headers: requestHeaders,
          timeout: 15_000,
        },
      );

      logger.info(
        '[CoverageEligibilityService] Coverage eligibility request sent successfully',
        undefined,
        {
          status: response.status,
          correlationID,
          url,
          sender: '1000004178@hcx',
          recipient: '1000003538@hcx',
        },
      );
      return response;
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as { code?: string })?.code;
      const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
      const responseHeaders = axios.isAxiosError(error) ? error.response?.headers : undefined;

      logger.error(
        '[CoverageEligibilityService] Failed to send coverage eligibility request',
        undefined,
        {
          correlationID,
          url,
          status,
          error: errorMessage,
          code: errorCode,
          responseData,
          responseHeaders,
        },
      );
      throw error;
    }
  }
}
