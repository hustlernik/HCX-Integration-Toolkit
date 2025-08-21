import { decryptFHIR, encryptFHIR } from '../utils/crypto';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';
import { sendToWebSocket } from '../socket';
import { NHCXService } from './nhcx.service';
import { logger } from '../utils/logger';
import axios, { AxiosResponse } from 'axios';

export class InsurancePlanService {
  private repo: TransactionLogRepository;
  private nhcx: NHCXService;

  constructor(repo = new TransactionLogRepository(), nhcx = new NHCXService()) {
    this.repo = repo;
    this.nhcx = nhcx;
  }

  /**
   * Send Insurance Plan request to NHCX
   */

  async sendRequest(
    payload: Record<string, any>,
    protectedHeaders: Record<string, string>,
  ): Promise<AxiosResponse<any>> {
    const correlationId = protectedHeaders['x-hcx-correlation_id'] as string;

    logger.debug('[InsurancePlanService] Pre-encrypt headers', undefined, {
      protectedHeaders,
      correlationId,
    });
    const encryptedPayload = await encryptFHIR(payload, protectedHeaders, {});
    logger.debug('[InsurancePlanService] Encrypted InsurancePlan JWE', undefined, {
      length: encryptedPayload.length,
      correlationId,
    });

    const accessToken = await this.nhcx.getAccessToken();

    const url = `${this.nhcx.getBaseUrl()}/insuranceplan/request`;
    const hostHeader = new URL(url).host;

    logger.info('[InsurancePlanService] POST /insuranceplan/request', undefined, {
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

    logger.info('[InsurancePlanService] Insurance Plan request sent', undefined, {
      status: response.status,
      correlationId,
    });
    return response;
  }
}
