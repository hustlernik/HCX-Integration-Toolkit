import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { sendToWebSocket } from '../socket';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';
import { encryptFHIR } from '../utils/crypto';
import { NHCXService } from './nhcx.service';
import axios from 'axios';
import { formatHcxTimestamp } from '../utils/time';
import Communication from '../models/Communication';

export class CommunicationService {
  private txnRepo: TransactionLogRepository;
  private nhcxService: NHCXService;

  constructor() {
    this.txnRepo = new TransactionLogRepository();
    this.nhcxService = new NHCXService();
  }

  /**
   * Process outbound response
   */

  public async processOutboundResponse(params: {
    communicationRequest: any;
    correlationId: string;
    headers: Record<string, any>;
    bundle: any;
    attachments: any[];
  }): Promise<{ responseCommId: string } | void> {
    const { communicationRequest, correlationId, headers, bundle, attachments } = params;
    try {
      const responseCommId = uuidv4();
      const responseDoc: any = {
        communicationId: responseCommId,
        correlationId,
        parentCommunicationId: communicationRequest.communicationId,
        status: 'completed',
        communicationType: 'response',
        subject: communicationRequest.subject,
        about: communicationRequest.about,
        sender: communicationRequest.recipient?.[0],
        recipient: communicationRequest.sender ? [communicationRequest.sender] : [],
        payload: (bundle.entry || [])
          .filter((e: any) => e.resource?.resourceType === 'Communication')
          .map((e: any) => e.resource.payload || [])
          .flat(),
        workflowStatus: 'completed',
        receivedAt: new Date(),
        protectedHeaders: headers,
        responseAttachments: Array.isArray(attachments) ? attachments : [],
      };
      try {
        await Communication.create(responseDoc);
        logger.info('[Provider CommunicationService] Persisted response Communication', undefined, {
          correlationId,
        });
      } catch (e) {
        logger.warn(
          '[Provider CommunicationService] Failed to persist response Communication before send',
          e as any,
          { correlationId },
        );
      }

      try {
        await this.txnRepo.updateByCorrelationId({
          correlationId,
          protectedHeaders: headers,
          requestFHIR: bundle,
          status: 'pending',
          workflow: 'Communication',
        });
        logger.info(
          '[Provider CommunicationService] Updated transaction log for response (pending)',
          undefined,
          { correlationId },
        );
      } catch (e) {
        logger.warn(
          '[Provider CommunicationService] Failed to update transaction log for response',
          e as any,
          { correlationId },
        );
      }

      return { responseCommId };
    } catch (err) {
      logger.error(
        '[Provider CommunicationService] Error during persistResponseGeneration',
        err as any,
        { correlationId },
      );
    }
  }

  /**
   * Process inbound communication request
   */

  async processInboundRequest(params: {
    decryptedPayload: any;
    protectedHeaders: Record<string, any>;
  }): Promise<{ communicationId: string; correlationId: string } | null> {
    const { decryptedPayload, protectedHeaders } = params;
    const correlationId = protectedHeaders['x-hcx-correlation_id'];

    try {
      let bundle: any = (decryptedPayload as any)?.payload || decryptedPayload;
      if (typeof bundle === 'string') {
        try {
          bundle = JSON.parse(bundle);
        } catch (e) {
          logger.error('Failed to parse decrypted communication bundle (service)', e, {
            correlationId,
          });
          await this.txnRepo.updateByCorrelationId({
            correlationId,
            status: 'pending',
            workflow: 'Communication',
          });
          return null;
        }
      }

      const communicationRequest = (bundle.entry || []).find(
        (entry: any) => entry.resource?.resourceType === 'CommunicationRequest',
      )?.resource;

      if (!communicationRequest) {
        logger.warn('No CommunicationRequest found in bundle', { correlationId });
        return null;
      }

      const communicationId = uuidv4();

      const dueDate =
        communicationRequest.occurrenceDateTime ||
        communicationRequest.occurrencePeriod?.start ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const sender = communicationRequest.sender || {};
      const payerInfo = {
        payerId: sender.reference?.split('/')[1] || 'unknown',
        payerName: sender.display || 'Unknown Payer',
      };

      const recipient = (communicationRequest.recipient || [])[0] || {};
      const providerInfo = {
        providerId: recipient.reference?.split('/')[1] || 'unknown',
        providerName: recipient.display || 'Unknown Provider',
      };

      const requestedDocuments = (communicationRequest.payload || [])
        .filter((p: any) => p.contentCodeableConcept)
        .map((p: any) => ({
          type: p.contentCodeableConcept?.coding?.[0]?.code,
          description: p.contentCodeableConcept?.coding?.[0]?.display,
          required: true,
        }));

      const toSave: any = {
        communicationId,
        correlationId,
        fhirRefId: communicationRequest.id,
        status: 'in-progress',
        category: communicationRequest.category,
        priority: communicationRequest.priority || 'routine',
        subject: communicationRequest.subject,
        about: communicationRequest.about,
        sender: {
          ...(communicationRequest.sender || {}),
          type: 'payer',
          payerId: payerInfo.payerId,
          payerName: payerInfo.payerName,
        },
        recipient: [
          {
            ...(recipient || {}),
            type: 'provider',
            providerId: providerInfo.providerId,
            providerName: providerInfo.providerName,
          },
        ],
        reasonCode: communicationRequest.reasonCode,
        payload: communicationRequest.payload,
        sentAt: communicationRequest.authoredOn
          ? new Date(communicationRequest.authoredOn)
          : undefined,
        receivedAt: new Date(),
        communicationType: 'request',
        workflowStatus: 'pending',
        dueDate: new Date(dueDate),
        requestedDocuments,
        metadata: {
          payerId: payerInfo.payerId,
          payerName: payerInfo.payerName,
          providerId: providerInfo.providerId,
          providerName: providerInfo.providerName,
          dueDate: new Date(dueDate),
          priority: communicationRequest.priority || 'routine',
        },
      };

      const saved = await Communication.create(toSave);
      logger.info('Communication request saved', undefined, { id: saved._id, correlationId });

      await this.txnRepo.updateByCorrelationId({
        correlationId,
        protectedHeaders,
        requestFHIR: bundle,
        status: 'pending',
        workflow: 'Communication',
      });

      sendToWebSocket('communication-request', {
        correlationId,
        communicationId,
        payload: communicationRequest,
      });

      return { communicationId, correlationId };
    } catch (error) {
      logger.error('Error processing inbound communication request', error, { correlationId });
      try {
        await this.txnRepo.updateByCorrelationId({
          correlationId,
          status: 'pending',
          workflow: 'Communication',
        });
      } catch {}
      return null;
    }
  }

  /**
   * Send outbound communication response via NHCX
   */

  async sendResponse(params: {
    fhirBundle: any;
    protectedHeaders: Record<string, any>;
  }): Promise<string> {
    const { fhirBundle, protectedHeaders } = params;
    const correlationId = protectedHeaders['x-hcx-correlation_id'];
    try {
      logger.debug('[Provider CommunicationService] Outgoing on_request pre-encrypt', undefined, {
        protectedHeaders,
        endpoint: '/communication/on_request',
        correlationId,
      });

      const encryptedPayload = await encryptFHIR(fhirBundle, protectedHeaders, {});
      const url = `${this.nhcxService.getBaseUrl()}/communication/on_request`;
      const hostHeader = new URL(url).host;
      const accessToken = await this.nhcxService.getAccessToken();

      logger.info('[Provider CommunicationService] POST (communication/on_request)', undefined, {
        url,
        sender: String(protectedHeaders['x-hcx-sender_code'] || '').trim(),
        recipient: String(protectedHeaders['x-hcx-recipient_code'] || '').trim(),
        correlationId,
        host: hostHeader,
      });

      let response;
      try {
        response = await axios.post(
          url,
          { type: 'JWEPayload', payload: encryptedPayload },
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

        logger.info(
          '[Provider CommunicationService] Communication on_request sent successfully',
          undefined,
          {
            status: response.status,
            correlationId,
            url,
            sender: String(protectedHeaders['x-hcx-sender_code'] || '').trim(),
            recipient: String(protectedHeaders['x-hcx-recipient_code'] || '').trim(),
          },
        );
      } catch (error: unknown) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorCode = (error as { code?: string })?.code;
        const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
        const responseHeaders = axios.isAxiosError(error) ? error.response?.headers : undefined;

        logger.error(
          '[Provider CommunicationService] Failed to send communication on_request',
          undefined,
          {
            correlationId,
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

      try {
        await this.txnRepo.updateByCorrelationId({
          correlationId,
          status: 'complete',
          responseFHIR: fhirBundle,
          workflow: 'Communication',
        });
      } catch (e) {
        logger.warn(
          '[Provider CommunicationService] Failed to update transaction to complete',
          e as any,
          { correlationId },
        );
      }
      return correlationId;
    } catch (error: any) {
      logger.error(
        '[Provider CommunicationService] Error sending communication on_request',
        error,
        {
          code: error?.code,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          responseBody: error?.response?.data ? JSON.stringify(error.response.data) : undefined,
          responseHeaders: error?.response?.headers,
          axiosError: error.toJSON ? error.toJSON() : undefined,
        },
      );
      throw error;
    }
  }
}
