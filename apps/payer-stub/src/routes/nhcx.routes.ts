import { Router } from 'express';
import { logger } from '../utils/logger';
import { InsurancePlanNHCXController } from '../controllers/insurancePlan.nhcx.controller';
import { CoverageEligibilityNHCXController } from '../controllers/coverageEligibility.nhcx.controller';
import { ClaimNHCXController } from '../controllers/claim.nhcx.controller';
import { CommunicationNHCXController } from '../controllers/communication.nhcx.controller';

const router = Router();
const insurancePlanController = new InsurancePlanNHCXController();
const coverageEligibilityController = new CoverageEligibilityNHCXController();
const claimController = new ClaimNHCXController();
const communicationController = new CommunicationNHCXController();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'payer-stub',
    timestamp: Math.floor(Date.now() / 1000).toString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * NHCX Insurance Plan Request Endpoint
 * POST /hcx/v1/insuranceplan/request
 */

router.post(
  '/hcx/v1/insuranceplan/request',

  (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request body. Expected JSON object.',
      });
    }
    next();
  },

  async (req, res) => {
    try {
      await insurancePlanController.handleInsurancePlanRequest(req, res);
    } catch (error) {
      logger.error('Error in insurance plan request handler', error);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error processing request',
        });
      }
    }
  },
);

/**
 * GET Communication by ID
 */

router.get('/api/communications/:id', async (req, res) => {
  await communicationController.getCommunicationById(req, res);
});

/**
 * NHCX Communication request
 * POST /hcx/v1/communication/request
 */

router.post('/hcx/v1/communication/request', async (req, res) => {
  await communicationController.handleCommunicationRequest(req, res);
});

/**
 * NHCX Communication on_request
 * POST /hcx/v1/communication/on_request
 */

router.post('/hcx/v1/communication/on_request', async (req, res) => {
  await communicationController.handleCommunicationOnRequest(req, res);
});

router.post('/v1/communication/on_request', async (req, res) => {
  await communicationController.handleCommunicationOnRequest(req, res);
});

/**
 * Communication listing/thread endpoints (for UI)
 */

router.get('/hcx/v1/communication/claim/:claimId', async (req, res) => {
  await communicationController.getCommunicationsByClaimId(req, res);
});

router.get('/hcx/v1/communication/thread/:communicationId', async (req, res) => {
  await communicationController.getCommunicationThread(req, res);
});

/**
 * NHCX Coverage Eligibility On Check Endpoint
 * POST /hcx/v1/coverageeligibility/on_check

 */

router.post('/hcx/v1/coverageeligibility/on_check', async (req, res) => {
  try {
    if (
      req.body &&
      typeof req.body === 'object' &&
      'correlationId' in req.body &&
      'responseForm' in req.body
    ) {
      return await coverageEligibilityController.handleCoverageEligibilityOnCheck(
        req as any,
        res as any,
      );
    }
    await coverageEligibilityController.handleCoverageEligibilityCheck(req, res);
  } catch (error) {
    logger.error('Error in coverage eligibility on_check handler', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error processing coverage eligibility on_check',
      });
    }
  }
});

router.post('/v1/coverageeligibility/on_check', async (req, res) => {
  try {
    await coverageEligibilityController.handleCoverageEligibilityCheck(req, res);
  } catch (error) {
    logger.error('Error in alias route /v1/coverageeligibility/on_check', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.post('/v1/coverageeligibility/check', async (req, res) => {
  try {
    await coverageEligibilityController.handleCoverageEligibilityCheck(req, res);
  } catch (error) {
    logger.error('Error in alias route /v1/coverageeligibility/check', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

/**
 * Claim list endpoints (for UI)
 */

router.get('/hcx/v1/claim/requests', async (req, res) => {
  try {
    await claimController.getAllClaim(req, res);
  } catch (error) {
    logger.error('Error in GET /hcx/v1/claim/requests', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.get('/v1/claim/requests', async (req, res) => {
  try {
    await claimController.getAllClaim(req, res);
  } catch (error) {
    logger.error('Error in GET /v1/claim/requests', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.get('/api/claims', async (req, res) => {
  try {
    await claimController.getAllClaim(req, res);
  } catch (error) {
    logger.error('Error in GET /api/claims', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.get('/api/communications', async (req, res) => {
  try {
    await communicationController.getAllCommunications(req, res);
  } catch (error) {
    logger.error('Error in GET /api/communications', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

/**
 * NHCX Claim Submit Endpoint
 * POST /hcx/v1/claim/submit
 */

router.post(
  '/hcx/v1/claim/submit',
  (req, res, next) => {
    const body = req.body;
    const isJWEPayloadWrapper =
      body &&
      typeof body === 'object' &&
      ((body.type === 'JWEPayload' && typeof body.payload === 'string') ||
        typeof body.payload === 'string');
    const isRawString = typeof body === 'string';
    if (!isJWEPayloadWrapper && !isRawString) {
      return res.status(400).json({
        timestamp: Math.floor(Date.now() / 1000).toString(),
        api_call_id: req.headers['x-hcx-api_call_id'] || '',
        correlation_id: req.headers['x-hcx-correlation_id'] || '',
        result: {
          sender_code: req.headers['x-hcx-recipient_code'] || process.env.HCX_SENDER_CODE,
          recipient_code: req.headers['x-hcx-sender_code'] || process.env.HCX_RECIPIENT_CODE,
          entity_type: 'claim',
          protocol_status: 'request.error',
        },
        error: {
          code: 'INVALID_PAYLOAD',
          message:
            'Missing or invalid payload. Expected JWEPayload wrapper, { payload }, or raw JWE string.',
        },
      });
    }
    return next();
  },
  async (req, res) => {
    try {
      await claimController.handleClaimSubmit(req, res);
    } catch (error) {
      logger.error('Error in claim submit handler', error);
      if (!res.headersSent) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
      }
    }
  },
);

router.post(
  '/v1/claim/submit',
  (req, res, next) => {
    const body = req.body;
    const isJWEPayloadWrapper =
      body &&
      typeof body === 'object' &&
      ((body.type === 'JWEPayload' && typeof body.payload === 'string') ||
        typeof body.payload === 'string');
    const isRawString = typeof body === 'string';
    if (!isJWEPayloadWrapper && !isRawString) {
      return res.status(400).json({
        timestamp: Math.floor(Date.now() / 1000).toString(),
        api_call_id: req.headers['x-hcx-api_call_id'] || '',
        correlation_id: req.headers['x-hcx-correlation_id'] || '',
        result: {
          sender_code: req.headers['x-hcx-recipient_code'] || process.env.HCX_SENDER_CODE,
          recipient_code: req.headers['x-hcx-sender_code'] || process.env.HCX_RECIPIENT_CODE,
          entity_type: 'claim',
          protocol_status: 'request.error',
        },
        error: {
          code: 'INVALID_PAYLOAD',
          message:
            'Missing or invalid payload. Expected JWEPayload wrapper, { payload }, or raw JWE string.',
        },
      });
    }
    return next();
  },
  async (req, res) => {
    try {
      await claimController.handleClaimSubmit(req, res);
    } catch (error) {
      logger.error('Error in alias route /v1/claim/submit', error);
      if (!res.headersSent) {
        res.status(500).json({ status: 'error', message: 'Internal server error' });
      }
    }
  },
);

/**
 * Payer Claim adjudication submit
 * POST /hcx/v1/claim/adjudication/submit
 */

router.post('/hcx/v1/claim/adjudication/submit', async (req, res) => {
  try {
    await claimController.handleClaimAdjudicationSubmit(req, res);
  } catch (error) {
    logger.error('Error in claim adjudication submit handler', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.post('/hcx/v1/claim/adjudicate', async (req, res) => {
  try {
    await claimController.handleClaimAdjudicationSubmit(req, res);
  } catch (error) {
    logger.error('Error in POST /hcx/v1/claim/adjudicate', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.post('/v1/claim/adjudicate', async (req, res) => {
  try {
    await claimController.handleClaimAdjudicationSubmit(req, res);
  } catch (error) {
    logger.error('Error in POST /v1/claim/adjudicate', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

/**
 * List stored claim requests
 * GET /hcx/v1/claim/requests
 */

router.get('/hcx/v1/claim/requests', async (req, res) => {
  try {
    await claimController.getAllClaim(req, res);
  } catch (error) {
    logger.error('Error in GET /hcx/v1/claim/requests', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.get('/hcx/v1/coverageeligibility/requests', async (req, res) => {
  try {
    logger.debug('GET /hcx/v1/coverageeligibility/requests');
    await coverageEligibilityController.getAllCoverageEligibilityRequests(req, res);
  } catch (error) {
    logger.error('Error in GET /hcx/v1/coverageeligibility/requests', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

router.get('/v1/coverageeligibility/requests', async (req, res) => {
  try {
    await coverageEligibilityController.getAllCoverageEligibilityRequests(req, res);
  } catch (error) {
    logger.error('Error in GET /v1/coverageeligibility/requests', error);
    if (!res.headersSent) {
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  }
});

/**
 * NHCX Error API Endpoint
 * POST /v1/error
 */

router.post('/v1/error', async (req, res) => {
  try {
    const timestamp = new Date();
    const formattedTimestamp = `${timestamp.getDate().toString().padStart(2, '0')}/${(timestamp.getMonth() + 1).toString().padStart(2, '0')}/${timestamp.getFullYear()} ${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')}:${timestamp.getMilliseconds().toString().padStart(3, '0')}`;

    const entityType = (req.headers['x-hcx-entity-type'] as string) || 'coverageeligibility';
    const errorAckResponse = {
      timestamp: formattedTimestamp,
      api_call_id: req.headers['x-hcx-api_call_id'] || '',
      correlation_id: req.headers['x-hcx-correlation_id'] || '',
      result: {
        sender_code: req.headers['x-hcx-recipient_code'] || process.env.HCX_SENDER_CODE,
        recipient_code: req.headers['x-hcx-sender_code'] || 'nhcx',
        entity_type: entityType,
        protocol_status: 'request.queued',
      },
      error: {
        code: '',
        message: '',
      },
    };

    res.status(202).json(errorAckResponse);
  } catch (error) {
    logger.error('Error handling NHCX error notification', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process error notification',
    });
  }
});

/**
 * POST /v1/insuranceplan/request
 */

router.post(
  '/v1/insuranceplan/request',

  (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        timestamp: Math.floor(Date.now() / 1000).toString(),
        api_call_id: req.headers['x-hcx-api_call_id'] || '',
        correlation_id: req.headers['x-hcx-correlation_id'] || '',
        result: {
          sender_code: req.headers['x-hcx-recipient_code'] || process.env.HCX_SENDER_CODE,
          recipient_code: req.headers['x-hcx-sender_code'] || process.env.HCX_RECIPIENT_CODE,
          entity_type: 'insuranceplan',
          protocol_status: 'request.error',
        },
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Invalid request body. Expected JWEPayload format.',
        },
      });
    }

    if (!req.body.payload || typeof req.body.payload !== 'string') {
      return res.status(400).json({
        timestamp: Math.floor(Date.now() / 1000).toString(),
        api_call_id: req.headers['x-hcx-api_call_id'] || '',
        correlation_id: req.headers['x-hcx-correlation_id'] || '',
        result: {
          sender_code: req.headers['x-hcx-recipient_code'] || process.env.HCX_SENDER_CODE,
          recipient_code: req.headers['x-hcx-sender_code'] || process.env.HCX_RECIPIENT_CODE,
          entity_type: 'insuranceplan',
          protocol_status: 'request.error',
        },
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Missing or invalid payload field. Expected JWE token string.',
        },
      });
    }

    next();
  },

  async (req, res) => {
    try {
      await insurancePlanController.handleInsurancePlanRequest(req, res);
    } catch (error) {
      console.error('Error in v1 insurance plan request handler:', error);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Internal server error processing request',
        });
      }
    }
  },
);

/**
 * NHCX Protocol Error Response Endpoint
 * POST /v1/error/response
 */

router.post('/v1/error/response', (req, res) => {
  const { body, headers } = req;
  const correlationId =
    headers['x-hcx-correlation_id'] || body?.['x-hcx-correlation_id'] || 'unknown';

  logger.warn('Received NHCX protocol error response', {
    correlationId,
    errorCode: headers['x-hcx-error_code'] || body?.['x-hcx-error_details']?.code,
    errorMessage: headers['x-hcx-error_message'] || body?.['x-hcx-error_details']?.message,
    sender: headers['x-hcx-sender_code'] || body?.['x-hcx-sender_code'],
    recipient: headers['x-hcx-recipient_code'] || body?.['x-hcx-recipient_code'],
  });

  const responseHeaders = {
    'x-hcx-sender_code':
      headers['x-hcx-recipient_code'] || body?.['x-hcx-recipient_code'] || 'payer-stub',
    'x-hcx-recipient_code': headers['x-hcx-sender_code'] || body?.['x-hcx-sender_code'] || 'hcx',
    'x-hcx-api_call_id':
      headers['x-hcx-api_call_id'] || body?.['x-hcx-api_call_id'] || `api_${Date.now()}`,
    'x-hcx-correlation_id': correlationId,
    'x-hcx-timestamp': Math.floor(Date.now() / 1000).toString(),
    'x-hcx-entity-type': 'protocol-response',
  };

  res
    .status(202)
    .set(responseHeaders)
    .json({
      type: 'ProtocolResponse',
      timestamp: Math.floor(Date.now() / 1000).toString(),
      status: 'ACKNOWLEDGED',
      correlation_id: correlationId,
    });
});

/**
 * Health check endpoint for NHCX
 * GET /hcx/v1/health
 */

router.get('/hcx/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'payer-stub',
    timestamp: Math.floor(Date.now() / 1000).toString(),
    environment: process.env.NODE_ENV || 'development',
    nhcx: {
      role: 'responder',
      endpoints: {
        insurancePlanRequest: '/hcx/v1/insuranceplan/request',
        insurancePlanRequestV1: '/v1/insuranceplan/request',
        claimSubmit: '/hcx/v1/claim/submit',
        claimSubmitV1: '/v1/claim/submit',
        errorResponseV1: '/v1/error/response',
      },
      status: {
        encryption: 'ok',
        database: 'ok',
        nhcx_connectivity: 'ok',
      },
    },
  });
});

export default router;
