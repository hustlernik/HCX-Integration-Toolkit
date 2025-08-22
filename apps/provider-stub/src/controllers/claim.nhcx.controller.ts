import { Request, Response } from 'express';
import { NHCXService } from '../services/nhcx.service';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';
import { decryptFHIR } from '../utils/crypto';
import { sendToWebSocket } from '../socket';
import { logger } from '../utils/logger';
import { ClaimService } from '../services/claim.service';
import type { OnRequestBody } from '../types/dtos';

export class ClaimNHCXController {
  private nhcxService: NHCXService;
  private txnRepo: TransactionLogRepository;
  private claimService: ClaimService;

  constructor() {
    this.nhcxService = new NHCXService();
    this.txnRepo = new TransactionLogRepository();
    this.claimService = new ClaimService(this.nhcxService);
  }

  /**
   * Handle claim submit
   * POST /hcx/v1/claim/submit
   */

  async handleClaimSubmit(req: Request, res: Response): Promise<void> {
    try {
      const { payload } = req.body as any;

      if (!payload) {
        res.status(400).json({ error: 'Missing payload' });
        return;
      }
      logger.debug('Provider claim submit request received', undefined, {
        hasPayload: Boolean(payload),
      });

      const protectedHeaders: Record<string, any> = this.nhcxService.buildProtectedHeaders({
        entityType: 'claim',
        status: 'request.initiated',
      });

      const correlationId = protectedHeaders['x-hcx-correlation_id'];

      try {
        await this.txnRepo.create({
          correlationId,
          protectedHeaders,
          rawRequestJWE: '',
          requestFHIR: payload,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          workflow: 'Claim',
        });
      } catch (error) {
        logger.error('Error creating transaction log', error, { endpoint: '/hcx/v1/claim/submit' });
        res.status(500).json({ error: 'Failed to create transaction log' });
        return;
      }

      await this.claimService.sendRequest(payload, protectedHeaders as Record<string, string>);

      res.status(200).json({ status: 'Claim submitted to payer ', correlationId: correlationId });
      return;
    } catch (error: any) {
      logger.error('Error processing claim submit', error);
      res.status(500).json({ error: error?.message || 'Failed to process claim request' });

      return;
    }
  }

  /**
   * Handle claim response from payer
   * POST /hcx/v1/claim/on_submit
   */

  async handleClaimOnSubmit(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received NHCX claim response', { endpoint: '/hcx/v1/claim/on_submit' });

      const { type, payload } = req.body as OnRequestBody;
      if (!payload || type !== 'JWEPayload') {
        logger.warn('Missing or invalid JWE payload on on_submit', {
          endpoint: '/hcx/v1/claim/on_submit',
        });
        res.status(400).json({ error: 'Missing JWE payload', expectedType: 'JWEPayload' });
        return;
      }

      const decryptedPayload = await decryptFHIR(payload);

      logger.debug('Decrypted claim response received', undefined, {
        hasPayload: Boolean((decryptedPayload as any)?.payload),
      });

      const protectedHeaders = (decryptedPayload as any)?.protected;
      res.status(202).json(NHCXService.successResponse(protectedHeaders));

      const mainPayload = (decryptedPayload as any)?.payload;
      const correlationId = (protectedHeaders as any)?.['x-hcx-correlation_id'] || '';

      try {
        await this.txnRepo.updateByCorrelationId({
          correlationId,
          responseFHIR: mainPayload,
          responseJWE: payload,
          status: 'complete',
          workflow: 'Claim',
        });

        sendToWebSocket('claim-response', mainPayload);
      } catch (bgErr) {
        logger.error('Failed to persist claim response', bgErr as any, {
          endpoint: '/hcx/v1/claim/on_submit',
          correlationId,
        });
      }

      return;
    } catch (error: any) {
      logger.error('Error processing NHCX claim on_submit', error, {
        endpoint: '/hcx/v1/claim/on_submit',
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process claim response',
      });
    }
  }
}
