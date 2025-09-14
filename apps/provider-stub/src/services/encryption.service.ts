import axios, { AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

export interface EncryptionRequest {
  resourceType: string;
  sender: string;
  receiver: string;
  payload: string | Record<string, any>;
}

export interface EncryptionResponse {
  encryptedPayload: string;
  correlationID: string;
  headers: {
    'x-hcx-sender_code': string;
    'x-hcx-recipient_code': string;
    'x-hcx-correlation_id': string;
    'x-hcx-timestamp': string;
    'x-hcx-status': string;
  };
  timestamp: string;
  senderCode: string;
  recipientCode: string;
}

export class EncryptionService {
  private encryptionServiceUrl: string;

  constructor(
    encryptionServiceUrl: string = process.env.ENCRYPTION_SERVICE_URL ||
      'http://localhost:9090/api',
  ) {
    this.encryptionServiceUrl = encryptionServiceUrl;
  }

  /**
   * Encrypts the payload using the external encryption service
   * @param request The encryption request containing sender, receiver and payload
   * @returns Promise with the encrypted payload string
   */
  async encryptPayload(request: EncryptionRequest): Promise<EncryptionResponse> {
    try {
      logger.info('Encrypting payload', {
        sender: request.sender,
        receiver: request.receiver,
        payloadType: typeof request.payload === 'string' ? 'string' : 'object',
      });

      const payloadToEncrypt =
        typeof request.payload === 'string' ? request.payload : JSON.stringify(request.payload);

      const response: AxiosResponse<EncryptionResponse> = await axios.post(
        `${this.encryptionServiceUrl}/encrypt`,
        {
          resourceType: request.resourceType,
          sender: request.sender,
          receiver: request.receiver,
          payload: payloadToEncrypt,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data?.encryptedPayload) {
        throw new Error('Invalid response from encryption service');
      }

      return response.data;
    } catch (error) {
      logger.error('Encryption service error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: `${this.encryptionServiceUrl}/encrypt`,
      });
      throw new Error(
        `Failed to encrypt payload: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
