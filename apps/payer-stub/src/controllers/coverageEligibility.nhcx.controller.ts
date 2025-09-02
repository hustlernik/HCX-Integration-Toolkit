import { Request, Response } from 'express';
import { NHCXService } from '../services/nhcx.service';
import { NHCXProtocolHeaders } from '../types/nhcx';
import { decryptFHIR, encryptFHIR } from '../utils/crypto';
import { logger } from '../utils/logger';
import { buildAccepted202 } from '../protocol/ack';
import CoverageEligibilityRequest from '../models/CoverageEligibilityRequest';
import { sendToWebSocket } from '../socket';
import { mapCoverageEligibilityRequestBundleToModel } from '../utils/fhir-mapping';
import CoverageEligibilityResponse from '../models/CoverageEligibilityResponse';
import { prepareCoverageEligibilityResponseBundle } from '../utils/fhir-bundle';

export class CoverageEligibilityNHCXController {
  private nhcxService: NHCXService;

  constructor() {
    this.nhcxService = new NHCXService();
  }

  /**
   * Handle NHCX Coverage Eligibility on_check (receives requests from NHCX)
   * POST /hcx/v1/coverageeligibility/on_check
   */

  async handleCoverageEligibilityCheck(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received NHCX coverage eligibility check request');

      let jweString: string | undefined;

      if (typeof req.body === 'string') {
        jweString = req.body;
      } else if (req.body && typeof req.body === 'object') {
        const b: any = req.body;
        if (typeof b.payload === 'string') jweString = b.payload;
      }

      if (!jweString) {
        logger.warn('Invalid body for coverage eligibility check', undefined, {
          contentType: req.headers['content-type'],
        });
        res.status(400).json({ error: 'Invalid request body' });
        return;
      }

      const decrypted = await decryptFHIR(jweString);

      const protectedHeaders = decrypted?.protected || {};

      const nhcxHeaders: NHCXProtocolHeaders = {
        'x-hcx-api_call_id': protectedHeaders['x-hcx-api_call_id'] || '',
        'x-hcx-correlation_id': protectedHeaders['x-hcx-correlation_id'] || '',
        'x-hcx-timestamp':
          protectedHeaders['x-hcx-timestamp'] || Math.floor(Date.now() / 1000).toString(),
        'x-hcx-sender_code': protectedHeaders['x-hcx-sender_code'] || process.env.HCX_SENDER_CODE,
        'x-hcx-recipient_code':
          protectedHeaders['x-hcx-recipient_code'] || process.env.HCX_RECIPIENT_CODE,
        'x-hcx-ben-abha-id': protectedHeaders['x-hcx-ben-abha-id'] || process.env.HCX_BEN_ABHA_ID,
        'x-hcx-status': (protectedHeaders['x-hcx-status'] as any) || 'request.initiated',
        'x-hcx-entity-type': 'coverageeligibility',
      } as any;

      const ack = buildAccepted202(nhcxHeaders, {
        entityType: 'coverageeligibility',
        protocolStatus: 'request.queued',
      });
      res.status(202).json(ack);

      (async () => {
        try {
          let payload: any = decrypted.payload || decrypted;
          if (typeof payload === 'string') {
            try {
              payload = JSON.parse(payload);
            } catch (e: any) {
              logger.error('Failed to parse payload JSON', e);
              return;
            }
          }
          if (!payload || payload.resourceType !== 'Bundle') {
            logger.warn('Invalid payload: expected FHIR Bundle');
            return;
          }

          try {
            const mappedRequest = mapCoverageEligibilityRequestBundleToModel(payload);
            const savedRequest = await CoverageEligibilityRequest.create({
              ...mappedRequest,
              correlationId: nhcxHeaders['x-hcx-correlation_id'],
            });
            logger.info('CoverageEligibilityRequest saved', undefined, {
              id: String(savedRequest._id),
              correlationId: nhcxHeaders['x-hcx-correlation_id'],
            });
            sendToWebSocket('coverage-eligibility-request:new', {
              id: savedRequest._id,
              fhir: savedRequest,
              correlationId: nhcxHeaders['x-hcx-correlation_id'],
            });

            (payload as any).__savedRequestFhirId = savedRequest.fhirRefId;
          } catch (dbError) {
            logger.error('Failed to save CoverageEligibilityRequest', dbError as any);
          }

          logger.info('CoverageEligibilityCheck persisted; awaiting adjudication');
        } catch (e) {
          logger.error('Error in async coverage eligibility processing', e as any);
        }
      })();
    } catch (error) {
      logger.error('Error processing NHCX coverage eligibility request', error as any);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process coverage eligibility request',
      });
    }
  }

  async handleCoverageEligibilityOnCheck(req: Request, res: Response): Promise<void> {
    try {
      const { correlationId, responseForm } = req.body;
      if (!correlationId || !responseForm) {
        logger.warn('Missing correlationId or responseForm');
        res.status(400).json({ error: 'Missing correlationId or responseForm' });
        return;
      }

      const since = new Date(Date.now() - 5 * 60 * 1000);
      const recentReq = await CoverageEligibilityRequest.findOne({
        createdAt: { $gte: since },
      }).sort({ _id: -1 });
      const latestReq = recentReq || (await CoverageEligibilityRequest.findOne().sort({ _id: -1 }));
      const reqDoc = latestReq as any;
      if (!latestReq) {
        logger.warn('No CoverageEligibilityRequest found to adjudicate', undefined, {
          uiCorrelationId: correlationId,
        });
      } else if (latestReq.correlationId !== correlationId) {
        logger.info('Overriding UI correlationId with latest request', undefined, {
          uiCorrelationId: correlationId,
          selectedCorrelationId: latestReq.correlationId,
        });
      }
      logger.info('Loaded request doc for adjudication', undefined, {
        found: Boolean(reqDoc),
        fhirRefId: reqDoc?.fhirRefId,
        selectedCorrelationId: reqDoc?.correlationId,
      });
      if (!reqDoc) {
        res.status(404).json({ error: 'Original CoverageEligibilityRequest not found' });
        return;
      }

      const now = new Date();
      const responseToSave = {
        requestId: reqDoc.fhirRefId,
        status: 'active',
      } as any;

      logger.debug?.('Built initial CE response object', undefined, {
        requestId: responseToSave.requestId,
      });
      responseToSave.purpose = responseForm.purpose || reqDoc.purpose || [];
      responseToSave.outcome = 'complete';
      responseToSave.disposition = responseForm.disposition || '';
      responseToSave.patientId = reqDoc.patient?.id || '';
      responseToSave.insurerId = reqDoc.organization?.id || '';
      responseToSave.servicedDate = responseForm.servicedDate
        ? new Date(responseForm.servicedDate)
        : undefined;
      responseToSave.servicedPeriod = responseForm.servicedPeriod || {};
      responseToSave.created = now;
      responseToSave.insurance = responseForm.insurance || [];

      logger.debug('[CoverageEligibilityOnCheck] Final response object', undefined, {
        requestId: responseToSave.requestId,
        purpose: responseToSave.purpose,
        outcome: responseToSave.outcome,
        disposition: responseToSave.disposition,
        patientId: responseToSave.patientId,
        insurerId: responseToSave.insurerId,
        servicedDate: responseToSave.servicedDate,
        servicedPeriod: responseToSave.servicedPeriod,
        created: responseToSave.created,
        insurance: responseToSave.insurance,
      });

      const currentCorrelationId = (reqDoc as any).correlationId || correlationId;
      const saved = await CoverageEligibilityResponse.create(responseToSave);

      logger.info('Adjudication stored', undefined, { correlationId: currentCorrelationId });

      const storedCorrelationId = (reqDoc as any).correlationId || correlationId;
      if (storedCorrelationId !== correlationId) {
        console.warn(
          '[CoverageEligibilityOnCheck] CorrelationId mismatch: UI payload vs stored request',
          {
            uiCorrelationId: correlationId,
            storedCorrelationId,
          },
        );
      }

      const bundle = await prepareCoverageEligibilityResponseBundle(
        {
          resourceType: 'CoverageEligibilityResponse',
          id: saved._id,
          ...responseToSave,
          correlationId: storedCorrelationId,
        },
        reqDoc.fhirRefId,
      );

      await CoverageEligibilityResponse.findByIdAndUpdate(saved._id, { fhirBundleId: bundle.id });

      const responseHeaders: Record<string, any> = {
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        'x-hcx-sender_code': process.env.HCX_SENDER_CODE,
        'x-hcx-recipient_code': process.env.HCX_RECIPIENT_CODE,
        'x-hcx-api_call_id': (reqDoc as any).apiCallId || (reqDoc as any).correlationId,
        'x-hcx-request_id': (reqDoc as any).requestId || undefined,
        'x-hcx-correlation_id': (reqDoc as any).correlationId,
        'x-hcx-timestamp': Math.floor(Date.now() / 1000).toString(),
        'x-hcx-ben-abha-id': process.env.HCX_BEN_ABHA_ID || '',
        'x-hcx-status': 'response.complete',
        'x-hcx-entity-type': 'coverageeligibility',
      };
      if (!responseHeaders['x-hcx-request_id']) delete responseHeaders['x-hcx-request_id'];

      logger.debug('[CoverageEligibilityOnCheck] Using response protected headers', undefined, {
        sender: responseHeaders['x-hcx-sender_code'],
        recipient: responseHeaders['x-hcx-recipient_code'],
        correlationId: responseHeaders['x-hcx-correlation_id'],
        entityType: (responseHeaders as any)['x-hcx-entity-type'],
      });
      const encrypted = await encryptFHIR(bundle, responseHeaders);

      res.status(202).json({
        status: 'success',
        message: 'Adjudication queued for send via NHCX',
        bundleId: bundle.id,
      });

      setImmediate(async () => {
        try {
          await this.nhcxService.sendCoverageEligibilityResponse(
            encrypted,
            '/coverageeligibility/on_check',
          );
          logger.info('Sent coverage eligibility response via NHCX');
        } catch (sendErr) {
          const oneLine = (v: any) => (v ? String(v).replace(/\s+/g, ' ').slice(0, 500) : '');
          const safeErr = {
            name: (sendErr as any)?.name,
            message: oneLine((sendErr as any)?.message),
            code: (sendErr as any)?.code || '',
          };
          const errJson = JSON.stringify(safeErr).replace(/\s+/g, ' ').slice(0, 500);
          logger.error('Coverage eligibility response send failed', new Error(safeErr.message), {
            endpoint: '/coverageeligibility/on_check',
            error: errJson,
          });
        }
      });
    } catch (err) {
      const oneLine = (v: any) => (v ? String(v).replace(/\s+/g, ' ').slice(0, 500) : '');
      const safeErr = {
        name: (err as any)?.name,
        message: oneLine((err as any)?.message),
        code: (err as any)?.code || '',
      };
      const errJson = JSON.stringify(safeErr).replace(/\s+/g, ' ').slice(0, 500);
      logger.error('Coverage eligibility adjudication error', new Error(safeErr.message), {
        error: errJson,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /hcx/v1/coverageeligibility/requests
   * Returns all CoverageEligibilityRequest documents
   */

  async getAllCoverageEligibilityRequests(req: Request, res: Response): Promise<void> {
    try {
      const requests = await CoverageEligibilityRequest.find().sort({ createdAt: -1 });
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch coverage eligibility requests' });
    }
  }
}
