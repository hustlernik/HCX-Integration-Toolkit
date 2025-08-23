import axios from 'axios';
import { logger } from '../utils/logger';
import { encryptFHIR } from '../utils/crypto';
import { NHCXService } from './nhcx.service';
import Communication from '../models/Communication';
import Claim from '../models/Claim';
import { prepareCommunicationRequestBundle } from '../utils/fhir-bundle';

export class CommunicationService {
  private nhcx: NHCXService;

  constructor(nhcx = new NHCXService()) {
    this.nhcx = nhcx;
  }

  /**
   * Send Communication request to NHCX
   */

  public async sendRequest(
    payload: Record<string, any>,
    protectedHeaders: Record<string, string>,
  ): Promise<void> {
    const correlationId = protectedHeaders['x-hcx-correlation_id'] as string;

    logger.debug('[Payer CommunicationService] Pre-encrypt headers', undefined, {
      protectedHeaders,
      correlationId,
    });

    const encryptedPayload = await encryptFHIR(payload, protectedHeaders, {});
    logger.debug('[Payer CommunicationService] Encrypted Communication JWE', undefined, {
      length: (encryptedPayload as string).length,
      correlationId,
    });

    const accessToken = await this.nhcx.getAccessToken();
    const url = `${this.nhcx.getBaseUrl()}/communication/request`;
    const hostHeader = new URL(url).host;

    logger.info('[Payer CommunicationService] POST /communication/request', undefined, {
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

    logger.info('[Payer CommunicationService] Communication request sent', undefined, {
      correlationId,
      status: response.status,
    });
    return;
  }

  /**
   * Build Communication entity, update Claim, build FHIR bundle and send to NHCX.
   * Keeps controller thin; controller still handles txn log and 202 response.
   */

  public async processRequest(params: {
    claim: any;
    responseForm: any;
    protectedHeaders: Record<string, string>;
    communicationId: string;
    correlationId: string;
    corrIdForBundle: string;
  }): Promise<{ bundle: any }> {
    const {
      claim,
      responseForm,
      protectedHeaders,
      communicationId,
      correlationId,
      corrIdForBundle,
    } = params;

    const payerInfo = claim.insurer || claim.payer || {};

    const communicationData = {
      communicationId,
      correlationId,
      status: 'in-progress',
      communicationType: 'request',
      priority: responseForm?.priority || 'routine',
      dueDate:
        responseForm?.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subject: {
        reference: `Patient/${claim.patient?.id}`,
        display: claim.patient?.name,
      },
      about: [
        {
          reference: `Claim/${claim.claimId}`,
          display: `Claim ${claim.claimId}`,
        },
      ],
      sender: {
        reference: `Organization/${payerInfo.id || 'unknown'}`,
        display: payerInfo.name || 'Unknown Payer',
        type: 'payer',
        payerId: payerInfo.id,
        payerName: payerInfo.name,
      },
      recipient: [
        {
          reference: `Organization/${claim.provider?.id || 'unknown'}`,
          display: claim.provider?.name || 'Unknown Provider',
          type: 'provider',
          providerId: claim.provider?.id,
          providerName: claim.provider?.name,
        },
      ],
      reasonCode: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason',
              code: responseForm?.reasonCode || 'MEDNEC',
              display: responseForm?.reasonDisplay || responseForm?.reasonCode,
            },
          ],
        },
      ],
      payload: [
        { contentString: responseForm?.message || 'Please provide additional information.' },
        ...(responseForm?.attachments || []).map((att: any) => ({
          contentAttachment: {
            title: att.title,
            contentType: att.contentType,
            data: att.data,
            url: att.url,
            language: att.language,
            creation: att.creation,
          },
        })),
      ],
      workflowStatus: 'pending',
      sent: new Date(),
    };

    await Communication.create(communicationData);

    await Claim.findByIdAndUpdate(claim._id, {
      $set: {
        communicationStatus: 'requested',
        lastCommunicationAt: new Date(),
      },
      $inc: { communicationCount: 1 },
      $push: {
        pendingCommunications: {
          communicationId,
          requestedAt: new Date(),
          dueDate: responseForm?.dueDate ? new Date(responseForm.dueDate) : undefined,
          status: 'pending',
        },
      },
    });

    const bundle = await prepareCommunicationRequestBundle(
      {
        reasonCode: responseForm?.reasonCode || 'MEDNEC',
        reasonDisplay: responseForm?.reasonDisplay,
        message: responseForm?.message || 'Please provide additional information.',
        dueDate: responseForm?.dueDate || undefined,
        priority: responseForm?.priority,
        category: responseForm?.category,
        medium: responseForm?.medium,
        attachments: responseForm?.attachments,
        correlationId: corrIdForBundle,
      },
      claim.fhirRefId,
      JSON.parse(JSON.stringify(claim.toObject ? claim.toObject() : claim)),
    );

    await this.sendRequest(bundle, protectedHeaders);

    return { bundle };
  }
}
