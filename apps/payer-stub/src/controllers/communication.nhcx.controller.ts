import { Request, Response } from 'express';
import { NHCXService } from '../services/nhcx.service';
import { CommunicationService } from '../services/communication.service';
import { NHCXProtocolHeaders } from '../types/nhcx';
import { logger } from '../utils/logger';
import Claim from '../models/Claim';
import Communication from '../models/Communication';
import { decryptFHIR } from '../utils/crypto';
import { sendToWebSocket } from '../socket';
import { v4 as uuidv4 } from 'uuid';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';
import type { OnRequestBody } from '../types/dtos';

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
   * Handle NHCX Communication request (payer initiates request to provider)
   * POST /hcx/v1/communication/request
   */

  async handleCommunicationRequest(req: Request, res: Response): Promise<void> {
    try {
      const { claimCorrelationId, claimId, responseForm } = req.body as {
        claimCorrelationId?: string;
        claimId?: string;
        responseForm?: any;
      };

      logger.info('[Payer Communication] Initiating request');

      logger.debug('[Payer Communication] Incoming body', undefined, {
        claimCorrelationId,
        claimId,
        hasAttachments: Array.isArray(responseForm?.attachments)
          ? responseForm.attachments.length
          : 0,
      });

      if (!claimCorrelationId && !claimId) {
        logger.warn('[Payer Communication] Missing identifiers for request');
        res.status(400).json({ error: 'Missing claimCorrelationId or claimId' });
        return;
      }

      let claim = null as any;
      if (claimCorrelationId) {
        claim = await Claim.findOne({ correlationId: claimCorrelationId });
      } else if (claimId) {
        claim = await Claim.findOne({ claimId });
      }

      if (!claim) {
        logger.error('[Payer Communication] Claim not found', undefined, {
          claimCorrelationId,
          claimId,
        });
        res
          .status(404)
          .json({ error: 'Claim not found', details: { claimCorrelationId, claimId } });
        return;
      }

      const communicationId = uuidv4();

      const protectedHeaders = this.nhcxService.buildProtectedHeaders({
        entityType: 'communication',
        status: 'request.initiated',
      });

      const correlationId = protectedHeaders['x-hcx-correlation_id'];

      let bundle;

      try {
        bundle = await this.communicationService.processRequest({
          claim,
          responseForm,
          protectedHeaders,
          communicationId,
          correlationId,
          corrIdForBundle: claim.correlationId,
        });
      } catch (sendErr) {
        logger.error('[Payer Communication] Failed to send request to NHCX', sendErr as Error, {
          correlationId,
        });
      }

      try {
        await this.txnRepo.create({
          correlationId,
          protectedHeaders,
          rawRequestJWE: '',
          requestFHIR: bundle,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          workflow: 'Communication',
        });
      } catch (e) {
        logger.error('Error creating transaction log', e);
      }

      res.status(202).json({
        status: 'accepted',
        message: 'Communication request sent',
        communicationId,
        correlationId,
      });
    } catch (error) {
      logger.error('[Payer Communication] Internal error while handling request', error as Error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * Handle NHCX Communication on_request
   * POST /hcx/v1/communication/on_request
   */

  async handleCommunicationOnRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info('[Payer Communication] Received on_request');

      const { type, payload } = (req.body as OnRequestBody) || ({} as any);

      if (!payload || type !== 'JWEPayload') {
        logger.warn('Invalid communication response body', undefined, { path: req.path });
        res.status(400).json({ error: 'Invalid request body' });
        return;
      }

      const decryptedPayload = await decryptFHIR(payload);
      const protectedHeaders = ((decryptedPayload as any)?.protected || {}) as NHCXProtocolHeaders;

      let mainPayload: any = (decryptedPayload as any)?.payload ?? decryptedPayload;
      if (typeof mainPayload === 'string') {
        try {
          mainPayload = JSON.parse(mainPayload);
        } catch {}
      }

      const correlationId = protectedHeaders['x-hcx-correlation_id'];

      try {
        await this.txnRepo.updateByCorrelationId({
          correlationId,
          responseJWE: payload,
          responseFHIR: mainPayload,
          status: 'complete',
          workflow: 'communication',
          protectedHeaders,
        });

        sendToWebSocket('communication:response', { correlationId, payload: mainPayload });
        logger.info('Communication response processed successfully', undefined, { correlationId });
      } catch (e) {
        logger.warn(
          '[Payer Communication] Failed to update transaction log for response',
          e as Error,
          { correlationId },
        );
      }

      res.status(202).json(
        NHCXService.successResponse(protectedHeaders, {
          entity_type: 'communication',
          protocol_status: 'response.complete',
        }),
      );
    } catch (error) {
      console.error('Error processing communication response:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process communication response',
      });
    }
  }

  /**
   * Get all communications for a claim
   * GET /hcx/v1/communication/claim/:claimId
   */
  async getCommunicationsByClaimId(req: Request, res: Response): Promise<void> {
    try {
      const { claimId } = req.params;

      const communications = await Communication.find({
        'about.reference': `Claim/${claimId}`,
      }).sort({ createdAt: 1 });

      res.json({
        status: 'success',
        data: communications,
      });
    } catch (error) {
      console.error('Error fetching communications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get communication thread (request + responses)
   * GET /hcx/v1/communication/thread/:communicationId
   */
  async getCommunicationThread(req: Request, res: Response): Promise<void> {
    try {
      const { communicationId } = req.params;

      // Find the root communication (could be request or response)
      const rootComm = await Communication.findOne({ communicationId });
      if (!rootComm) {
        res.status(404).json({ error: 'Communication not found' });
        return;
      }

      const threadRootId = rootComm.parentCommunicationId || rootComm.communicationId;

      const thread = await Communication.find({
        $or: [{ communicationId: threadRootId }, { parentCommunicationId: threadRootId }],
      }).sort({ createdAt: 1 });

      res.json({
        status: 'success',
        data: {
          threadId: threadRootId,
          communications: thread,
        },
      });
    } catch (error) {
      console.error('Error fetching communication thread:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all communications for UI
   */
  async getAllCommunications(req: Request, res: Response): Promise<void> {
    try {
      const { status, claimId, limit = 50, offset = 0 } = req.query;

      const filter: any = {};
      if (status) filter.workflowStatus = status;

      if (claimId) filter['about.reference'] = `Claim/${claimId}`;

      const communications = await Communication.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(Number(offset));

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
      console.error('Error fetching communications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get communication by ID for UI
   */
  async getCommunicationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const communication = await Communication.findById(id);

      if (!communication) {
        res.status(404).json({ error: 'Communication not found' });
        return;
      }

      const threadCommunications = await Communication.find({
        correlationId: communication.correlationId,
      }).sort({ createdAt: 1 });

      res.status(200).json({
        communication,
        thread: threadCommunications,
      });
    } catch (error) {
      console.error('Error fetching communication:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
