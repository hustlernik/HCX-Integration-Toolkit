import { encryptFHIR } from '../utils/crypto';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';
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

    const encryptedPayload = await encryptFHIR(payload, protectedHeaders, {});

    const accessToken = await this.nhcx.getAccessToken();

    const url = `${this.nhcx.getBaseUrl()}/insuranceplan/request`;
    const hostHeader = (() => {
      try {
        return new URL(url).host;
      } catch {
        return undefined as any;
      }
    })();

    logger.info('[InsurancePlanService] POST /insuranceplan/request', undefined, {
      url,
      sender: protectedHeaders['x-hcx-sender_code'],
      recipient: protectedHeaders['x-hcx-recipient_code'],
      correlationId,
      host: hostHeader,
    });

    const responsePayload = JSON.stringify({ payload: encryptedPayload });

    try {
      const response = await axios.post(url, responsePayload, {
        headers: {
          bearer_auth: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(hostHeader ? { Host: hostHeader } : {}),
        },
        timeout: 15_000,
      });

      logger.info('[InsurancePlanService] Insurance Plan request sent successfully', undefined, {
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

      logger.error('[InsurancePlanService] Failed to send insurance plan request', undefined, {
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
