import { Request, Response } from 'express';
import { NHCXService } from '../services/nhcx.service';
import { decryptFHIR } from '../utils/crypto';
import { sendToWebSocket } from '../socket';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';
import { logger } from '../utils/logger';
import type { OnRequestBody } from '../types/dtos';
import { CoverageEligibilityService } from '../services/coverageEligibility.service';

export class CoverageEligibilityNHCXController {
  private nhcxService: NHCXService;
  private txnRepo: TransactionLogRepository;
  private coverageEligibilityService: CoverageEligibilityService;

  constructor() {
    this.nhcxService = new NHCXService();
    this.txnRepo = new TransactionLogRepository();
    this.coverageEligibilityService = new CoverageEligibilityService();
  }

  /**
   * Provider initiates coverage eligibility check via NHCX
   * POST /hcx/v1/coverageeligibility/request
   */

  async handleCoverageEligibilityCheck(req: Request, res: Response): Promise<void> {
    try {
      const { payload } = req.body as any;
      if (!payload) {
        res.status(400).json({ error: 'Missing payload' });
        return;
      }
      logger.debug('Provider coverage eligibility request received', undefined, {
        hasPayload: Boolean(payload),
      });

      const protectedHeaders: Record<string, any> = this.nhcxService.buildProtectedHeaders({
        entityType: 'coverageeligibility',
        status: 'request.initiated',
      });

      const correlationId = protectedHeaders['x-hcx-correlation_id'];

      try {
        if (!correlationId) {
          logger.warn('Missing x-hcx-correlation_id; skipping txn update', undefined, {
            path: req.path,
          });
          return;
        }
        await this.txnRepo.create({
          correlationId,
          protectedHeaders,
          rawRequestJWE: '',
          requestFHIR: payload,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          workflow: 'Coverage Eligibility',
        });
      } catch (e) {
        logger.error('Error creating transaction log (coverage eligibility)', e);
        res.status(500).json({ error: 'Failed to create transaction log' });
        return;
      }

      await this.coverageEligibilityService.sendRequest(
        payload,
        protectedHeaders as Record<string, string>,
      );

      res.status(200).json({ status: 'Coverage eligibility requested from payer', correlationId });
      return;
    } catch (error: any) {
      logger.error('Error processing coverage eligibility request', error, {
        endpoint: '/hcx/v1/coverageeligibility/request',
      });
      res
        .status(500)
        .json({ error: error.message || 'Failed to process coverage eligibility request' });
      return;
    }
  }

  /**
   * Provider receives coverage eligibility response from NHCX
   * POST /hcx/v1/coverageeligibility/on_check
   */

  async handleCoverageEligibilityOnCheck(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received coverage eligibility response from NHCX', undefined, {
        path: req.path,
      });

      const { type, payload: payload } = (req.body as OnRequestBody) || ({} as any);
      if (!payload || type !== 'JWEPayload') {
        logger.warn('Invalid coverage eligibility response body', undefined, { path: req.path });
        res.status(400).json({ error: 'Invalid request body' });
        return;
      }

      const decryptedPayload = await decryptFHIR(payload);
      const protectedHeaders = (decryptedPayload as any)?.protected || {};
      const mainPayload = (decryptedPayload as any)?.payload ?? decryptedPayload;

      res.status(202).json(
        NHCXService.successResponse(protectedHeaders, {
          entity_type: 'coverageeligibility',
          protocol_status: 'request.complete',
        }),
      );

      try {
        const correlationId = protectedHeaders['x-hcx-correlation_id'];

        await this.txnRepo.updateByCorrelationId({
          correlationId,
          responseFHIR: mainPayload,
          responseJWE: payload,
          status: 'complete',
          workflow: 'Coverage Eligibility',
        });

        sendToWebSocket('coverage-eligibility-response', mainPayload);
        logger.info('Coverage eligibility response processed successfully', undefined, {
          correlationId,
        });
      } catch (e) {
        logger.error('Error processing coverage eligibility response asynchronously', e as any);
      }

      return;
    } catch (error) {
      logger.error('Error processing coverage eligibility response from NHCX', error as any, {
        path: req.path,
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process coverage eligibility response',
      });
      return;
    }
  }
}
