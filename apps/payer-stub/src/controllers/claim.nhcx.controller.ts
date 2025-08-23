import { Request, Response } from 'express';
import { decryptFHIR, encryptFHIR } from '../utils/crypto';
import { logger } from '../utils/logger';
import { NHCXService } from '../services/nhcx.service';
import { config } from '../config';
import { NHCXProtocolHeaders } from '../types/nhcx';
import { buildAccepted202 } from '../protocol/ack';
import { mapClaimBundleToModel } from '../utils/fhir-mapping';
import Claim from '../models/Claim';
import ClaimResponse from '../models/ClaimResponse';
import { prepareClaimResponseBundle } from '../utils/fhir-bundle';
import { sendToWebSocket } from '../socket';
import { v4 as uuidv4, v4 } from 'uuid';

export class ClaimNHCXController {
  private nhcxService: NHCXService;

  constructor() {
    this.nhcxService = new NHCXService();
  }
  /**
   * Receive claim submit
   * POST /hcx/v1/claim/submit
   */

  async handleClaimSubmit(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Payer received claim submit');

      const { payload: jweString } = req.body || {};
      if (!jweString) {
        logger.warn('Missing JWE in claim submit');
        res.status(400).json({ error: 'Missing JWE payload' });
        return;
      }

      const decrypted = await decryptFHIR(jweString);
      const protectedHeaders = (decrypted as any)?.protected || {};
      const correlationId = protectedHeaders['x-hcx-correlation_id'] || '';
      const apiCallId = protectedHeaders['x-hcx-api_call_id'] || '';
      const requestId = protectedHeaders['x-hcx-request_id'] || '';

      try {
        const payload = (decrypted as any)?.payload;
        const mapped =
          typeof payload === 'string'
            ? mapClaimBundleToModel(JSON.parse(payload))
            : mapClaimBundleToModel(payload);
        const saved = await Claim.findOneAndUpdate(
          { claimId: (mapped as any).claimId },
          { $set: { ...mapped, correlationId, apiCallId, requestId, raw: payload } },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        sendToWebSocket('claim:new', { id: (saved as any)?._id, correlationId });
      } catch (dbErr: any) {
        if (dbErr?.code === 11000) {
          logger.info('Duplicate claimId detected, treated as idempotent submit', undefined, {
            correlationId,
          });
        } else {
          logger.warn('Failed to map/persist claim', dbErr as any, { correlationId });
        }
      }

      const nhcxHeaders: NHCXProtocolHeaders = {
        'x-hcx-api_call_id': protectedHeaders['x-hcx-api_call_id'] || '',
        'x-hcx-correlation_id': protectedHeaders['x-hcx-correlation_id'] || correlationId,
        'x-hcx-timestamp': protectedHeaders['x-hcx-timestamp'] || Math.floor(Date.now() / 1000),
        'x-hcx-sender_code': protectedHeaders['x-hcx-sender_code'] || config.payerCode,
        'x-hcx-recipient_code': protectedHeaders['x-hcx-recipient_code'] || config.providerCode,
        'x-hcx-status': (protectedHeaders['x-hcx-status'] as any) || 'request.initiated',
        'x-hcx-ben-abha-id': protectedHeaders['x-hcx-ben-abha-id'] || config.benAbhaId,
      } as NHCXProtocolHeaders;

      const ack = buildAccepted202(nhcxHeaders, {
        entityType: 'claim',
        protocolStatus: 'request.queued',
      });
      res.status(202).json(ack);
    } catch (err: any) {
      logger.error('Error handling claim submit at payer', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * UI adjudication submit ->
   */

  async handleClaimAdjudicationSubmit(req: Request, res: Response): Promise<void> {
    try {
      const responseForm = req.body as any;
      if (!responseForm || !responseForm.correlationId) {
        res.status(400).json({ error: 'Missing correlationId or response payload' });
        return;
      }

      const reqDoc = await Claim.findOne({ correlationId: responseForm.correlationId });
      if (!reqDoc) {
        res.status(404).json({ error: 'Original Claim not found' });
        return;
      }

      const now = new Date();
      const responseToSave: any = {
        claimResponseId: uuidv4(),
        correlationId: reqDoc.correlationId,
        fhirRefId: (reqDoc as any).fhirRefId,
        status: responseForm.status || 'active',
        type: responseForm.type || (reqDoc as any).type,
        subType: responseForm.subType || (reqDoc as any).subType,
        use: responseForm.use || (reqDoc as any).use,
        patient: (reqDoc as any).patient,
        created: now,
        insurer: (reqDoc as any).insurer,
        claimId: (reqDoc as any).claimId,
        outcome: responseForm.outcome || 'complete',
        disposition: responseForm.disposition || '',
        preAuthRef: responseForm.preAuthRef || undefined,
        preAuthPeriod: responseForm.preAuthPeriod || undefined,
        payeeType: responseForm.payeeType || undefined,
        fundsReserve: responseForm.fundsReserve || undefined,
        adjudication: Array.isArray(responseForm.adjudication) ? responseForm.adjudication : [],
        item: Array.isArray(responseForm.item) ? responseForm.item : [],
        addItem: Array.isArray(responseForm.addItem) ? responseForm.addItem : [],
        processNote: Array.isArray(responseForm.processNote) ? responseForm.processNote : [],
        formCode: responseForm.formCode || undefined,
        payment: responseForm.payment || undefined,
        communicationRequestId:
          Array.isArray(responseForm.communicationRequest) &&
          responseForm.communicationRequest[0]?.reference
            ? responseForm.communicationRequest[0].reference
            : undefined,
        insurance: Array.isArray(responseForm.insurance)
          ? responseForm.insurance.map((ins: any) => ({
              focal: !!ins.focal,
              coverage: ins.coverage,
            }))
          : [],
        total: Array.isArray(responseForm.total) ? responseForm.total : [],
        error:
          Array.isArray(responseForm.error) && responseForm.error[0]?.code
            ? responseForm.error[0].code
            : typeof responseForm.error === 'string'
              ? responseForm.error
              : undefined,
      };

      const saved = await ClaimResponse.create(responseToSave);

      const plainResponse = JSON.parse(
        JSON.stringify({
          resourceType: 'ClaimResponse',
          id: (saved as any)._id.toString(),
          ...responseToSave,
          correlationId: (reqDoc as any).correlationId,
        }),
      );

      const plainReqDoc = JSON.parse(
        JSON.stringify((reqDoc as any).toObject ? (reqDoc as any).toObject() : reqDoc),
      );

      const bundle = await prepareClaimResponseBundle(
        plainResponse,
        (reqDoc as any).fhirRefId,
        plainReqDoc,
      );

      if ((bundle as any)?.id) {
        await ClaimResponse.findByIdAndUpdate((saved as any)._id, {
          fhirBundleId: (bundle as any).id,
        });
      }

      const responseHeaders: Record<string, any> = {
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        'x-hcx-sender_code': config.payerCode,
        'x-hcx-api_call_id': (reqDoc as any).apiCallId || (reqDoc as any).correlationId,
        'x-hcx-request_id': (reqDoc as any).requestId || undefined,
        'x-hcx-recipient_code': config.providerCode,
        'x-hcx-correlation_id': (reqDoc as any).correlationId,
        'x-hcx-timestamp': Math.floor(Date.now() / 1000).toString(),
        'x-hcx-ben-abha-id': config.benAbhaId,
        'x-hcx-status': 'response.complete',
        'x-hcx-workflow_id': config.hcxWorkflowId,
        'x-hcx-entity-type': 'claim',
      };
      if (!responseHeaders['x-hcx-request_id']) delete responseHeaders['x-hcx-request_id'];

      (async () => {
        try {
          logger.debug(
            '[Payer Claim] Outgoing on_submit (protected-headers) pre-encrypt',
            undefined,
            {
              protectedHeaders: responseHeaders,
              endpoint: '/claim/on_submit',
              correlationId: (reqDoc as any).correlationId,
            },
          );
          const encrypted = await encryptFHIR(bundle, responseHeaders as any);
          await this.nhcxService.sendClaimResponse(encrypted, '/claim/on_submit');
          logger.info('Claim adjudication response sent via NHCX');
        } catch (sendErr) {
          logger.error('Failed to send claim adjudication response via NHCX', sendErr as any);
        }
      })();

      res
        .status(202)
        .json({
          status: 'success',
          message: 'ClaimResponse accepted for processing',
          bundleId: (bundle as any)?.id,
        });
    } catch (err) {
      logger.error('Error in claim adjudication submit', err as any);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /hcx/v1/claim/requests
   */
  async getAllClaim(req: Request, res: Response): Promise<void> {
    try {
      const requests = await Claim.find().sort({ createdAt: -1 });
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch claim requests' });
    }
  }
}
