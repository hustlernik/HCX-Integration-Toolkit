import { Request, Response } from 'express';
import { NHCXService } from '../services/nhcx.service';
import { NHCXProtocolHeaders } from '../types/nhcx';
import { decryptFHIR } from '../utils/crypto';
import { prepareCommunicationResponseBundle } from '../utils/fhir-bundle';
import Communication from '../models/Communication';
import { logger } from '../utils/logger';
import { CommunicationService } from '../services/communication.service';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';

export class CommunicationNHCXController {
  private nhcxService: NHCXService;
  private communicationService: CommunicationService;
  private txnRepo: TransactionLogRepository;

  constructor() {
    this.nhcxService = new NHCXService();
    this.communicationService = new CommunicationService();
    this.txnRepo = new TransactionLogRepository();
  }

  /**
   * Handle NHCX communication request
   * POST /hcx/v1/communication/request
   */

  async handleCommunicationRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received NHCX communication request', {
        endpoint: '/hcx/v1/communication/request',
      });

      const { payload } = req.body as any;

      if (!payload) {
        logger.warn('Missing or invalid JWE payload on communication/request', {
          endpoint: '/hcx/v1/communication/request',
        });
        res.status(400).json({ error: 'Missing JWE payload' });
        return;
      }

      const decryptedPayload = await decryptFHIR(payload);
      logger.debug('Decrypted communication request', undefined, {
        hasPayload: Boolean((decryptedPayload as any)?.payload),
      });

      const protectedHeaders = decryptedPayload?.protected;
      const mainPayload = decryptedPayload?.payload;
      const correlationId = protectedHeaders?.['x-hcx-correlation_id'] || '';

      const communicationRequest = mainPayload.entry?.find(
        (entry: any) => entry.resource?.resourceType === 'CommunicationRequest',
      )?.resource;

      if (!communicationRequest) {
        logger.warn('No CommunicationRequest found in payload', undefined, { correlationId });
        res.status(400).json({ error: 'Invalid communication request payload' });
        return;
      }

      res.status(202).json(
        NHCXService.successResponse(protectedHeaders, {
          entity_type: 'communication',
          protocol_status: 'request.complete',
        }),
      );

      this.communicationService
        .processInboundRequest({ decryptedPayload, protectedHeaders })
        .catch((e) => logger.error('Error in background processing (communication request)', e));
    } catch (error) {
      logger.error('Error processing NHCX communication request', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process communication',
      });
    }
  }

  /**
   * Send communication response back to payer via NHCX
   * POST /hcx/v1/communication/on_request
   */

  async handleCommunicationOnRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[Provider Communication] Initiate on_request (send response)');

      const { correlationId, claimId, responseForm } = req.body || {};

      if (!correlationId) {
        res.status(400).json({ error: 'correlationId is required' });
        return;
      }

      const communicationRequest = await Communication.findOne({ correlationId }).lean({
        virtuals: true,
      });
      if (!communicationRequest) {
        res.status(404).json({ error: 'Communication request not found' });
        return;
      }

      let requestProtectedHeaders: any = {};

      try {
        const txn = await this.txnRepo.getByCorrelationId(correlationId);
        if (txn?.protectedHeaders) requestProtectedHeaders = txn.protectedHeaders;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.debug('Failed to fetch transaction by correlation ID:', errorMessage);
      }
      if (!requestProtectedHeaders || Object.keys(requestProtectedHeaders).length === 0) {
        requestProtectedHeaders = {};
      }
      const protectedHeaders: NHCXProtocolHeaders = { ...(requestProtectedHeaders as any) } as any;
      protectedHeaders['x-hcx-correlation_id'] =
        requestProtectedHeaders['x-hcx-correlation_id'] || correlationId;
      protectedHeaders['x-hcx-api_call_id'] = requestProtectedHeaders['x-hcx-api_call_id'];
      protectedHeaders['x-hcx-request_id'] = requestProtectedHeaders['x-hcx-request_id'];
      protectedHeaders['x-hcx-status'] = 'response.complete';
      protectedHeaders['x-hcx-sender_code'] = process.env.PROVIDER_CODE?.trim() || '';
      protectedHeaders['x-hcx-recipient_code'] = process.env.PAYER_CODE?.trim() || '';
      protectedHeaders['x-hcx-timestamp'] = Math.floor(Date.now() / 1000);
      protectedHeaders['x-hcx-ben-abha-id'] = requestProtectedHeaders['x-hcx-ben-abha-id'] || '';
      protectedHeaders['x-hcx-workflow_id'] = process.env.HCX_WORKFLOW_ID?.trim();
      protectedHeaders['x-hcx-entity-type'] = 'communication';

      const bundle = await prepareCommunicationResponseBundle(
        {
          message: responseForm?.message,
          responseToRequestId: communicationRequest.fhirRefId || '',
          status: responseForm?.status,
          attachments: Array.isArray(responseForm?.attachments) ? responseForm.attachments : [],
        },
        claimId,
      );

      try {
        await this.communicationService.processOutboundResponse({
          communicationRequest,
          correlationId,
          headers: protectedHeaders,
          bundle,
          attachments: Array.isArray(responseForm?.attachments) ? responseForm.attachments : [],
        });
      } catch (e) {
        logger.warn('[Provider] Failed to persist response info (service)', e as any, {
          correlationId,
        });
      }

      try {
        await this.communicationService.sendResponse({ fhirBundle: bundle, protectedHeaders });
        logger.info('[Provider] Communication response sent to NHCX successfully', undefined, {
          correlationId,
        });
      } catch (sendErr) {
        logger.error('[Provider] Failed to send communication response to NHCX', sendErr as any, {
          correlationId,
        });
      }

      res.status(202).json(
        NHCXService.successResponse(protectedHeaders as any, {
          entity_type: 'communication',
          protocol_status: 'response.complete',
        }),
      );
    } catch (error) {
      logger.error('Error sending communication response', error as any);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all received communications for provider review
   * GET /hcx/v1/communication/inbox
   */

  async getCommunicationInbox(req: Request, res: Response): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `${Date.now()}`);

      const docs = await Communication.find({ communicationType: 'request' })
        .sort({ receivedAt: -1 })
        .lean({ virtuals: true });

      const communications = (docs || []).map((d: any) => {
        const reason = d?.reasonCode?.[0]?.coding?.[0] || {};
        const firstPayload = Array.isArray(d?.payload) && d.payload.length > 0 ? d.payload[0] : {};
        const requestedDocsFromPayload = (Array.isArray(d?.payload) ? d.payload : [])
          .filter((p: any) => p?.contentCodeableConcept?.coding?.[0]?.code)
          .map((p: any) => ({
            code: p.contentCodeableConcept.coding[0].code,
            display:
              p.contentCodeableConcept.coding[0].display || p.contentCodeableConcept.text || '',
          }));
        const claimRef = d?.about?.[0]?.reference || '';
        const claimId = claimRef?.startsWith('Claim/')
          ? claimRef.replace('Claim/', '')
          : claimRef || '';
        const subjectDisplay = d?.subject?.display;
        const subjectRef = d?.subject?.reference || '';
        const patientName =
          subjectDisplay ||
          (subjectRef.includes('/') ? subjectRef.split('/').pop() : subjectRef) ||
          '';
        const sender = d?.sender || {};
        const payerName = sender.display || d?.metadata?.payerName || '';
        const payerId = (sender.reference || '').split('/').pop() || d?.metadata?.payerId || '';
        const message =
          firstPayload?.contentString ||
          firstPayload?.contentCodeableConcept?.coding?.[0]?.display ||
          firstPayload?.contentCodeableConcept?.text ||
          '';
        const dueDate = d.dueDate
          ? new Date(d.dueDate).toISOString()
          : d.metadata?.dueDate
            ? new Date(d.metadata.dueDate).toISOString()
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default to 7 days from now
        const receivedAt = d.receivedAt
          ? new Date(d.receivedAt).toISOString()
          : d.createdAt
            ? new Date(d.createdAt).toISOString()
            : new Date().toISOString();

        return {
          id: d.communicationId || d._id?.toString(),
          correlationId: d.correlationId || '',
          fhirRefId: d.fhirRefId || '',
          claimId,
          patientName,
          payerId,
          payerName,
          reasonCode: reason.code || '',
          reasonDisplay: reason.display || 'Information Request',
          message,
          requestedDocs: requestedDocsFromPayload,
          priority: d.priority || d.metadata?.priority || 'routine',
          dueDate,
          receivedAt,
          sentAt: d.sentAt ? new Date(d.sentAt).toISOString() : undefined,
          status: d.workflowStatus || d.status || 'pending',
          workflowStatus: d.workflowStatus || 'pending',
          category: d.category || [],
          communicationType: d.communicationType || 'request',
        };
      });

      res.status(200).json({
        success: true,
        data: communications,
      });
    } catch (error) {
      logger.error('Error fetching communications', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all communications
   */
  async getAllCommunications(req: Request, res: Response): Promise<void> {
    try {
      const { status, priority, limit = 50, offset = 0 } = req.query as any;
      const filter: any = {};
      if (status) filter.workflowStatus = status;
      if (priority) filter.priority = priority;

      const docs = await Communication.find(filter)
        .lean({ virtuals: true })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset))
        .lean();

      const communications = (docs || []).map((d: any) => {
        const reason = d?.reasonCode?.[0]?.coding?.[0] || {};
        const firstPayload = d?.payload?.[0] || {};
        const claimRef = d?.about?.[0]?.reference || '';
        const claimId = claimRef?.startsWith('Claim/')
          ? claimRef.replace('Claim/', '')
          : claimRef || '';
        const subjectDisplay = d?.subject?.display;
        const subjectRef = d?.subject?.reference || '';
        const patientName =
          subjectDisplay ||
          (subjectRef.includes('/') ? subjectRef.split('/').pop() : subjectRef) ||
          '';
        const senderDisplay = d?.sender?.display;
        const senderRef = d?.sender?.reference || '';
        const payerName = senderDisplay || senderRef || '';
        const message =
          firstPayload?.contentString ||
          firstPayload?.contentCodeableConcept?.coding?.[0]?.display ||
          '';
        return {
          id: d.communicationId,
          correlationId: d.correlationId,
          claimId,
          patientName,
          payerName,
          reasonCode: reason.code || '',
          reasonDisplay: reason.display || 'Information Request',
          message,
          priority: d.priority || 'routine',
          receivedAt: d.receivedAt
            ? new Date(d.receivedAt).toISOString()
            : new Date(d.createdAt).toISOString(),
          status: (d.workflowStatus as any) || 'pending',
          workflowStatus: d.workflowStatus || 'pending',
        };
      });

      const total = await Communication.countDocuments(filter);

      res.status(200).json({
        communications,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total,
        },
      });
    } catch (error) {
      logger.error('Error fetching all communications', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get communication by ID for provider UI
   */
  async getCommunicationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const communication = await Communication.findById(id).lean({ virtuals: true });

      if (!communication) {
        res.status(404).json({ error: 'Communication not found' });
        return;
      }

      res.status(200).json({
        communication,
      });
    } catch (error) {
      logger.error('Error fetching communication by id', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
