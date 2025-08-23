import { Request, Response } from 'express';
import { NHCXService } from '../services/nhcx.service';
import { InsurancePlanService } from '../services/insurancePlan.service';
import { logger } from '../utils/logger';
import type { OnRequestBody } from '../types/dtos';
import { TransactionLogRepository } from '../repositories/transactionLog.repository';
import { decryptFHIR } from '../utils/crypto';
import { sendToWebSocket } from '../socket';

export class InsurancePlanNHCXController {
  private nhcxService: NHCXService;
  private insurancePlanService: InsurancePlanService;
  private txnRepo: TransactionLogRepository;

  constructor() {
    this.nhcxService = new NHCXService();
    this.insurancePlanService = new InsurancePlanService();
    this.txnRepo = new TransactionLogRepository();
  }

  /**
   * Handle NHCX insurance plan request
   * POST /hcx/v1/insuranceplan/request
   */

  async handleInsurancePlanRequest(req: Request, res: Response): Promise<void> {
    try {
      const { payload } = req.body as any;

      if (!payload) {
        res.status(400).json({ error: 'Missing payload' });
        return;
      }

      const protectedHeaders: Record<string, any> = this.nhcxService.buildProtectedHeaders({
        entityType: 'insuranceplan',
        status: 'request.initiated',
      });

      const correlationId = protectedHeaders['x-hcx-correlation_id'];
      if (!correlationId) {
        logger.error('Missing x-hcx-correlation_id; aborting request', {
          endpoint: '/hcx/v1/insuranceplan/request',
        });
        res.status(500).json({ error: 'Failed to generate correlation id' });
        return;
      }
      try {
        await this.txnRepo.create({
          correlationId,
          protectedHeaders,
          rawRequestJWE: '',
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
        res.status(500).json({ error: 'Failed to create transaction log' });
        return;
      }

      await this.insurancePlanService.sendRequest(
        payload as Record<string, String>,
        protectedHeaders,
      );

      res
        .status(200)
        .json({ status: 'Insurance Plan requested from payer ', correlationId: correlationId });
      return;
    } catch (error: any) {
      logger.error('Error processing insurance plan request', error, {
        endpoint: '/hcx/v1/insuranceplan/request',
      });
      res.status(500).json({ error: error.message || 'Failed to process insurance plan request' });
      return;
    }
  }

  /**
   * Handle NHCX insurance plan response
   * POST /hcx/v1/insuranceplan/on_request
   */

  async handleInsurancePlanOnRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received NHCX insurance plan response', {
        endpoint: '/hcx/v1/insuranceplan/on_request',
      });

      const { type, payload: payload } = req.body as OnRequestBody;

      if (!payload || type !== 'JWEPayload') {
        logger.warn('Missing or invalid JWE payload on on_request', {
          endpoint: '/hcx/v1/insuranceplan/on_request',
        });
        res.status(400).json({ error: 'Missing JWE payload', expectedType: 'JWEPayload' });
        return;
      }

      const decryptedPayload = await decryptFHIR(payload);

      const protectedHeaders = decryptedPayload?.protected;

      res.status(202).json(NHCXService.successResponse(protectedHeaders));

      const mainPayload = decryptedPayload?.payload;
      const correlationId = protectedHeaders?.['x-hcx-correlation_id'] || '';

      if (!correlationId) {
        logger.warn('Missing x-hcx-correlation_id in protected headers; skipping txn update', {
          endpoint: '/hcx/v1/insuranceplan/on_request',
        });
        return;
      }

      try {
        await this.txnRepo.updateByCorrelationId({
          correlationId,
          responseFHIR: mainPayload,
          responseJWE: payload,
          status: 'complete',
          workflow: 'Insurance Plan',
        });
        sendToWebSocket('insurance-plan-response', mainPayload);
      } catch (bgErr) {
        logger.error('Failed to persist insurance plan response', bgErr, {
          endpoint: '/hcx/v1/insuranceplan/on_request',
          correlationId,
        });
      }

      return;
    } catch (error) {
      logger.error('Error processing NHCX insurance plan on_request', error, {
        endpoint: '/hcx/v1/insuranceplan/on_request',
      });
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process insurance plan response',
      });
      return;
    }
  }
}
