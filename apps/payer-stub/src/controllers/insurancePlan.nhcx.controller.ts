import { Request, Response } from 'express';
import { NHCXService } from '../services/nhcx.service';
import { NHCXProtocolHeaders } from '../types/nhcx';
import { encryptFHIR, decryptFHIR } from '../utils/crypto';
import { logger } from '../utils/logger';
import { buildAccepted202 } from '../protocol/ack';
import { InsurancePlanDomainService } from '../services/insurancePlan.service';
import { buildProtocolErrorResponse } from '../protocol/error';
import { config } from '../config';
import { Bundle } from 'fhir/r4';
import { buildInsurancePlanTaskBundle } from '../fhir/task-bundle';

export class InsurancePlanNHCXController {
  private nhcxService: NHCXService = new NHCXService();
  private recipientPublicKeyPath: string = process.env.RECIPIENT_PUBLIC_KEY_PATH || '';
  private domainService: InsurancePlanDomainService = new InsurancePlanDomainService();

  private formatHcxTimestamp(date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMin);
    const tzh = pad(Math.floor(abs / 60));
    const tzm = pad(abs % 60);
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${sign}${tzh}${tzm}`;
  }

  private parseFHIRBundle(payload: unknown): Bundle {
    if (typeof payload === 'string') {
      logger.debug('DEBUG: Payload is a string, parsing as JSON');
      return JSON.parse(payload);
    }
    logger.debug('DEBUG: Payload is already an object');
    return payload as Bundle;
  }

  private buildResponseHeaders(
    original: NHCXProtocolHeaders,
    status: 'response.complete' | 'response.error',
    errorDetails?: { code: string; message: string; trace?: string },
  ): NHCXProtocolHeaders {
    const timestamp = this.formatHcxTimestamp();
    const headers: any = {
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM',
      'x-hcx-sender_code': original['x-hcx-recipient_code'] || config.payerCode,
      'x-hcx-recipient_code': original['x-hcx-sender_code'] || config.providerCode,
      'x-hcx-api_call_id': original['x-hcx-api_call_id'] || `api_${Date.now()}`,
      'x-hcx-correlation_id': original['x-hcx-correlation_id'] || `corr_${Date.now()}`,
      'x-hcx-timestamp': timestamp,
      'x-hcx-status': status === 'response.error' ? 'response.error' : 'response.complete',
      'x-hcx-workflow_id': original['x-hcx-workflow_id'] || `wfl_${Date.now()}`,
      'x-hcx-request_id': original['x-hcx-request_id'] || `req_${Date.now()}`,
      'x-hcx-ben-abha-id': original['x-hcx-ben-abha-id'] || config.benAbhaId,
      'x-hcx-entity-type': 'insuranceplan',
    };
    if (status === 'response.error' && errorDetails) {
      headers['x-hcx-error_details'] = {
        code: errorDetails.code,
        message: errorDetails.message,
        ...(errorDetails.trace ? { trace: errorDetails.trace } : {}),
      } as any;
    }
    return headers as NHCXProtocolHeaders;
  }

  /**
   * Handle NHCX insurance plan request
   * POST /hcx/v1/insuranceplan/request
   */

  async handleInsurancePlanRequest(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Received NHCX insurance plan request');
      const { payload: jweString } = req.body;

      if (!jweString) {
        logger.error('No JWE payload found in request');
        res.status(400).json({ error: 'Missing JWE payload' });
        return;
      }

      const decrypted = await decryptFHIR(jweString, process.env.PAYER_PRIVATE_KEY_PATH);
      let payload: any = decrypted.payload;
      const ph: any = decrypted.protected || {};
      const nhcxHeaders: NHCXProtocolHeaders = {
        'x-hcx-sender_code': ph['x-hcx-sender_code'] || '',
        'x-hcx-api_call_id': ph['x-hcx-api_call_id'] || '',
        'x-hcx-recipient_code': ph['x-hcx-recipient_code'] || '',
        'x-hcx-correlation_id': ph['x-hcx-correlation_id'] || '',
        'x-hcx-timestamp': ph['x-hcx-timestamp'] || Math.floor(Date.now() / 1000),
        'x-hcx-ben-abha-id': ph['x-hcx-ben-abha-id'] || '',
        'x-hcx-status': ph['x-hcx-status'] || 'request.initiated',
        ...(ph['x-hcx-request_id'] ? { 'x-hcx-request_id': ph['x-hcx-request_id'] } : {}),
        ...(ph['x-hcx-workflow_id'] ? { 'x-hcx-workflow_id': ph['x-hcx-workflow_id'] } : {}),
        ...(ph['x-hcx-debug_flag'] ? ({ 'x-hcx-debug_flag': ph['x-hcx-debug_flag'] } as any) : {}),
      };

      logger.info('Decrypted NHCX request message', {
        sender: nhcxHeaders['x-hcx-sender_code'],
        recipient: nhcxHeaders['x-hcx-recipient_code'],
        correlationId: nhcxHeaders['x-hcx-correlation_id'],
        status: nhcxHeaders['x-hcx-status'],
      });

      if (nhcxHeaders['x-hcx-status'] !== 'request.initiated') {
        logger.error('Invalid request status', new Error(String(nhcxHeaders['x-hcx-status'])));
        await this.sendErrorResponseToNHCX(
          nhcxHeaders,
          'INVALID_STATUS',
          'Request status must be request.initiated',
        );
        res.status(200).json({ status: 'error_response_sent' });
        return;
      }

      const fhirBundle = this.parseFHIRBundle(payload);
      logger.debug('DEBUG: Parsed FHIR Bundle structure', { fhirBundle });
      const taskInputs = InsurancePlanDomainService.extractTaskInputs(fhirBundle);

      if (!taskInputs) {
        logger.error('Failed to extract task inputs from bundle', undefined, { fhirBundle });
        await this.sendErrorResponseToNHCX(
          nhcxHeaders,
          'INVALID_PAYLOAD',
          'Failed to extract task inputs',
        );
        res.status(200).json({ status: 'error_response_sent' });
        return;
      }

      logger.info('Processing insurance plan request', {
        policyNumber: taskInputs.policyNumber,
        providerId: taskInputs.providerId,
        correlationId: nhcxHeaders['x-hcx-correlation_id'],
      });

      const nhcxResponse = buildAccepted202(nhcxHeaders, 'insuranceplan');
      res.status(202).json(nhcxResponse);

      this.processInsurancePLanRequest(taskInputs, nhcxHeaders);
    } catch (error) {
      logger.error('Error handling insurance plan request', error);

      if (!res.headersSent) {
        const nhcxHeaders = req.headers as unknown as NHCXProtocolHeaders;
        const protocolErrorResponse = buildProtocolErrorResponse(
          nhcxHeaders,
          {
            code: 'PROCESSING_ERROR',
            message: error instanceof Error ? error.message : 'Internal server error',
          },
          'insuranceplan',
        );
        res.status(202).json(protocolErrorResponse);
      }
    }
  }

  /**
   * Process insurance plan request
   */
  private async processInsurancePLanRequest(
    taskInputs: { policyNumber: string; providerId: string },
    headers: NHCXProtocolHeaders,
  ): Promise<void> {
    try {
      logger.info('Processing insurance plan request asynchronously', { taskInputs });

      const correlationId = headers['x-hcx-correlation_id'] || '';
      let response: {
        status: 'success' | 'error';
        data?: any;
        errorDetails?: { code: string; message: string; trace?: string };
      };
      try {
        logger.info('Processing insurance plan request', { taskInputs, correlationId });
        const result = await this.domainService.processInsurancePlanRequest(
          taskInputs,
          correlationId,
        );
        if (result.status === 'success') {
          logger.debug('Generated insurance plan response bundle', {
            bundleId: result.data?.responseBundle?.id,
            planCount: result.data?.responseBundle?.entry?.length || 0,
          });
        }
        response = result;
      } catch (err) {
        logger.error('Error processing insurance plan request', err);
        response = {
          status: 'error',
          errorDetails: {
            code: 'PROCESSING_ERROR',
            message: 'An error occurred while processing the insurance plan request',
          },
        };
      }

      const responseHeaders = this.buildResponseHeaders(
        headers,
        response.status === 'error' ? 'response.error' : 'response.complete',
        response.status === 'error' ? response.errorDetails : undefined,
      );

      if (response.status === 'error' && response.errorDetails) {
        await this.sendErrorResponseToNHCX(
          headers,
          response.errorDetails.code || 'NHCX-5001',
          response.errorDetails.message || 'Internal server error',
        );
        return;
      }

      const taskBundle = buildInsurancePlanTaskBundle({
        responseBundle: response.data?.responseBundle,
      });

      logger.debug('DEBUG: Created TaskBundle structure', { taskBundle });

      await this.sendInsurancePlanResponse(taskBundle, responseHeaders);
    } catch (error) {
      logger.error('Error in async processing', error);
    }
  }

  /**
   * Send InsurancePlanBundle response back via NHCX gateway
   */

  private async sendInsurancePlanResponse(
    insurancePlanBundle: any,
    responseHeaders: NHCXProtocolHeaders,
  ): Promise<void> {
    try {
      logger.info('Sending InsurancePlanBundle response via NHCX gateway', {
        bundleId: insurancePlanBundle?.id,
        correlationId: responseHeaders['x-hcx-correlation_id'],
        senderCode: responseHeaders['x-hcx-sender_code'],
        recipientCode: responseHeaders['x-hcx-recipient_code'],
      });

      const encryptedResponse = await encryptFHIR(
        insurancePlanBundle,
        responseHeaders,
        {},
        this.recipientPublicKeyPath,
      );

      logger.debug('Prepared encrypted InsurancePlanBundle for NHCX', {
        payloadLength: encryptedResponse.length,
        correlationId: responseHeaders['x-hcx-correlation_id'],
      });

      await this.nhcxService.sendInsurancePlanResponse(
        encryptedResponse,
        `${config.nhcxBaseUrl}/insuranceplan/on_request`,
      );

      logger.info('Successfully sent InsurancePlanBundle response via NHCX gateway');
    } catch (error) {
      logger.error('Failed to send InsurancePlanBundle response via NHCX', error);
      throw error;
    }
  }

  /**
   * Send error response to NHCX
   */

  private async sendErrorResponseToNHCX(
    originalHeaders: NHCXProtocolHeaders,
    errorCode: string,
    errorMessage: string,
  ): Promise<void> {
    try {
      const timestamp = this.formatHcxTimestamp();
      const errorResponse = {
        resourceType: 'OperationOutcome',
        issue: [
          {
            severity: 'error',
            code: 'processing',
            details: {
              text: errorMessage,
            },
          },
        ],
      };

      const responseHeaders: any = {
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        'x-hcx-sender_code': originalHeaders['x-hcx-recipient_code'] || config.payerCode,
        'x-hcx-recipient_code': originalHeaders['x-hcx-sender_code'] || config.providerCode,
        'x-hcx-api_call_id': originalHeaders['x-hcx-api_call_id'] || `api_${Date.now()}`,
        'x-hcx-correlation_id': originalHeaders['x-hcx-correlation_id'] || `corr_${Date.now()}`,
        'x-hcx-timestamp': timestamp,
        'x-hcx-status': 'response.error',
        'x-hcx-entity-type': 'insuranceplan',
        'x-hcx-workflow_id': originalHeaders['x-hcx-workflow_id'] || `wfl_${Date.now()}`,
        'x-hcx-request_id': originalHeaders['x-hcx-request_id'] || `req_${Date.now()}`,
        'x-hcx-ben-abha-id': originalHeaders['x-hcx-ben-abha-id'] || config.benAbhaId,
        'x-hcx-error_details': {
          code: errorCode,
          message: errorMessage,
          trace: '',
        },
      };
      if (!responseHeaders['x-hcx-request_id']) responseHeaders['x-hcx-request_id'] = '';

      const encryptedResponse = await encryptFHIR(
        errorResponse,
        responseHeaders as NHCXProtocolHeaders,
        {},
        this.recipientPublicKeyPath,
      );

      await this.nhcxService.sendInsurancePlanResponse(
        encryptedResponse,
        `${config.nhcxBaseUrl}/insuranceplan/on_request`,
      );
      logger.info('Sent error OperationOutcome via NHCX', { errorCode });
    } catch (error) {
      logger.error('Failed to send error response to NHCX', error);
    }
  }
}
