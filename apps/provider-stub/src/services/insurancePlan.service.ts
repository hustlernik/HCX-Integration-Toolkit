import { TransactionLogRepository } from '../repositories/transactionLog.repository';
import { NHCXService } from './nhcx.service';
import { EncryptionService } from './encryption.service';
import { logger } from '../utils/logger';
import axios, { AxiosResponse } from 'axios';

export class InsurancePlanService {
  private txnRepo: TransactionLogRepository;
  private nhcx: NHCXService;
  private encryptionService: EncryptionService;

  constructor(
    txnRepo = new TransactionLogRepository(),
    nhcx = new NHCXService(),
    encryptionService = new EncryptionService(),
  ) {
    this.txnRepo = txnRepo;
    this.nhcx = nhcx;
    this.encryptionService = encryptionService;
  }

  /**
   * Send Insurance Plan request to NHCX
   */

  async sendRequest(payload: Record<string, any>): Promise<AxiosResponse<any>> {
    const encryptionResponse = await this.encryptionService.encryptPayload({
      resourceType: 'InsurancePlanRequest',
      sender: process.env.PROVIDER_CODE || '',
      receiver: process.env.PAYER_CODE || '',
      payload: payload,
    });

    const { encryptedPayload, correlationID } = encryptionResponse;

    const accessToken = await this.nhcx.getAccessToken();

    const url = `${this.nhcx.getBaseUrl()}/insuranceplan/request`;
    const hostHeader = (() => {
      try {
        return new URL(url).host;
      } catch {
        return undefined as any;
      }
    })();

    try {
      const requestHeaders = {
        bearer_auth: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(hostHeader ? { Host: hostHeader } : {}),
      };

      const response = await axios.post(
        url,
        { payload: encryptedPayload },
        {
          headers: requestHeaders,
          timeout: 15_000,
        },
      );

      try {
        await this.txnRepo.create({
          correlationId: correlationID,
          rawRequestJWE: encryptedPayload,
          requestFHIR: payload,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          workflow: 'Insurance Plan',
        });
      } catch (error) {
        logger.error('Error creating transaction log', error, {
          endpoint: '/hcx/v1/insuranceplan/request',
        });
      }

      logger.info('[InsurancePlanService] Insurance Plan request sent successfully', undefined, {
        status: response.status,
        correlationID,
        url,
        sender: process.env.SENDER_CODE,
        recipient: process.env.RECEIVER_CODE,
      });
      return response;
    } catch (error: unknown) {
      const status =
        error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError
          ? (error as any).response?.status
          : undefined;

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code?: string }).code
          : undefined;

      const responseData =
        error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError
          ? (error as any).response?.data
          : undefined;

      const responseHeaders =
        error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError
          ? (error as any).response?.headers
          : undefined;

      logger.error('[InsurancePlanService] Failed to send insurance plan request', undefined, {
        correlationID,
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
