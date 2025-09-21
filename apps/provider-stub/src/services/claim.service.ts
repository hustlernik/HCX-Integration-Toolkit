import axios, { AxiosResponse } from 'axios';
import { NHCXService } from './nhcx.service';
import { EncryptionService } from './encryption.service';
import { logger } from '../utils/logger';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';

export class ClaimService {
  private nhcx: NHCXService;
  private txnRepo: TransactionLogRepository;
  private encryptionService: EncryptionService;

  constructor(
    nhcx = new NHCXService(),
    txnRepo = new TransactionLogRepository(),
    encryptionService = new EncryptionService(),
  ) {
    this.nhcx = nhcx;
    this.txnRepo = txnRepo;
    this.encryptionService = encryptionService;
  }

  /**
   * Send Claim submit request to NHCX
   **/

  async sendRequest(payload: Record<string, any>): Promise<AxiosResponse<any>> {
    const encryptionResponse = await this.encryptionService.encryptPayload({
      resourceType: 'ClaimSettleProvider',
      sender: process.env.PROVIDER_CODE || '',
      receiver: process.env.PAYER_CODE || '',
      payload: payload,
    });

    const { encryptedPayload, correlationID } = encryptionResponse;

    try {
      await this.txnRepo.create({
        correlationId: correlationID,
        rawRequestJWE: '',
        requestFHIR: payload,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        workflow: 'Claim',
      });
    } catch (error) {
      logger.error('Error creating transaction log', error, { endpoint: '/hcx/v1/claim/submit' });
      throw error;
    }

    const accessToken = await this.nhcx.getAccessToken();
    const url = `${this.nhcx.getBaseUrl()}/claim/submit`;
    const hostHeader = new URL(url).host;

    logger.info('[ClaimService] POST /claim/submit', undefined, {
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

      logger.info('Sending encrypted claim payload to NHCX', {
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

      if (process.env.PAYER_CODE === '1000003538@hcx') {
        try {
          const requestData = {
            action: 'Approve',
            method: 'Claim',
            correlationId: correlationID,
          };

          const requestConfig = {
            method: 'post',
            url: 'https://apisbx.abdm.gov.in/pmjay/sbxhcx/dummyhcxpayer/process/request',
            data: requestData,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              bearer_auth: `Bearer ${accessToken}`,
            },
            timeout: 15000,
            validateStatus: () => true,
          };

          const demoPayerResponse = await axios(requestConfig);

          logger.info('[ClaimService] Demo payer action successful', {
            status: demoPayerResponse.status,
            correlationId: correlationID,
            data: demoPayerResponse.data,
          });
        } catch (demoError) {
          const errorMessage = demoError instanceof Error ? demoError.message : 'Unknown error';
          const errorResponse = (demoError as any)?.response;
          const errorStatus = errorResponse?.status;

          logger.error('[ClaimService] Demo payer error details', {
            error: errorMessage,
            status: errorStatus,
            recipientCode: process.env.PAYER_CODE || '',
          });
        }
      } else {
        logger.info('[ClaimService] Skipping demo payer API call for recipient', {
          recipientCode: process.env.PAYER_CODE || '',
        });
      }

      logger.info('[ClaimService] Claim submit sent successfully', undefined, {
        status: response.status,
        correlationId: correlationID,
        url,
        sender: process.env.PROVIDER_CODE || '',
        recipient: process.env.PAYER_CODE || '',
      });
      return response;
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = (error as { code?: string })?.code;
      const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
      const responseHeaders = axios.isAxiosError(error) ? error.response?.headers : undefined;

      logger.error('[ClaimService] Failed to submit claim', undefined, {
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
