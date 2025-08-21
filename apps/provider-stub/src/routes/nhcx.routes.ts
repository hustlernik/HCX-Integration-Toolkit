import { Router } from 'express';
import { logger } from '../utils/logger';
import { InsurancePlanNHCXController } from '../controllers/insurancePlan.nhcx.controller';
import { CoverageEligibilityNHCXController } from '../controllers/coverageEligibility.nhcx.contoller';
import { ClaimNHCXController } from '../controllers/claim.nhcx.controller';
import { CommunicationNHCXController } from '../controllers/communication.nhcx.controller';
import TransactionLog from '../models/TransactionLog';
import multer from 'multer';

const router = Router();

const insurancePlanController = new InsurancePlanNHCXController();
const coverageEligibilityController = new CoverageEligibilityNHCXController();
const claimController = new ClaimNHCXController();
const communicationController = new CommunicationNHCXController();
const upload = multer();

/**
 * NHCX Insurance Plan request (provider initiates request to NHCX)
 * POST /hcx/v1/insuranceplan/request
 */

router.post('/hcx/v1/insuranceplan/request', async (req, res) => {
  await insurancePlanController.handleInsurancePlanRequest(req, res);
});

/**
 * NHCX Insurance Plan on_request (receives responses from NHCX)
 * POST /hcx/v1/insuranceplan/on_request
 */

const handleInsurancePlanOnRequest = async (req: any, res: any) => {
  try {
    logger.info('Received NHCX response on insuranceplan/on_request', {
      path: req.path,
      correlationId: req.headers['x-hcx-correlation_id'],
      sender: req.headers['x-hcx-sender_code'],
      recipient: req.headers['x-hcx-recipient_code'],
    });
    await insurancePlanController.handleInsurancePlanOnRequest(req, res);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error handling insuranceplan/on_request', { path: req.path, error: errMsg });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * NHCX Insurance Plan on_request
 * POST /v1/insuranceplan/on_request
 */

router.post('/v1/insuranceplan/on_request', handleInsurancePlanOnRequest);

/**
 * NHCX Coverage Eligibility request (provider initiates request to NHCX)
 * POST /hcx/v1/coverageeligibility/request
 */

router.post('/hcx/v1/coverageeligibility/request', async (req, res) => {
  await coverageEligibilityController.handleCoverageEligibilityCheck(req, res);
});

router.post('/hcx/v1/coverageeligibility/check', async (req, res) => {
  await coverageEligibilityController.handleCoverageEligibilityCheck(req, res);
});

/**
 * Claim submit and on_submit
 */
router.post('/hcx/v1/claim/submit', async (req, res) => {
  await claimController.handleClaimSubmit(req, res);
});

router.post('/hcx/v1/claim/on_submit', async (req, res) => {
  await claimController.handleClaimOnSubmit(req, res);
});

router.post('/v1/claim/on_submit', async (req, res) => {
  await claimController.handleClaimOnSubmit(req, res);
});

/**
 * NHCX Communication on_request )
 * POST /hcx/v1/communication/on_request
 */

router.post('/hcx/v1/communication/on_request', async (req, res) => {
  await communicationController.handleCommunicationOnRequest(req, res);
});

/**
 * Provider Communication inbox (provider UI fetches stored requests)
 * GET /hcx/v1/communication/inbox
 */

router.get('/hcx/v1/communication/inbox', async (req, res) => {
  await communicationController.getCommunicationInbox(req, res);
});

/**
 * NHCX Communication request (provider responds to payer communication)
 * POST /hcx/v1/communication/request
 */

router.post('/hcx/v1/communication/request', async (req, res) => {
  await communicationController.handleCommunicationRequest(req, res);
});

router.post('/v1/communication/request', async (req, res) => {
  await communicationController.handleCommunicationRequest(req, res);
});

/**
 * NHCX Communication respond (provider sends response to payer)
 * POST /hcx/v1/communication/respond
 */

router.post('/hcx/v1/communication/respond', upload.any(), async (req, res) => {
  await communicationController.handleCommunicationOnRequest(req, res);
});

/**
 * GET all Communication Requests
 */

router.get('/api/communications', async (req, res) => {
  await communicationController.getAllCommunications(req, res);
});

/**
 * GET Communication by ID
 */

router.get('/api/communications/:id', async (req, res) => {
  await communicationController.getCommunicationById(req, res);
});

/**
 * NHCX Coverage Eligibility on_check
 */

const handleCoverageEligibilityOnCheck = async (req: any, res: any) => {
  try {
    logger.info('Received NHCX response on coverageeligibility/on_check', {
      path: req.path,
      correlationId: req.headers['x-hcx-correlation_id'],
      sender: req.headers['x-hcx-sender_code'],
      recipient: req.headers['x-hcx-recipient_code'],
    });
    await coverageEligibilityController.handleCoverageEligibilityOnCheck(req, res);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error('Error handling coverageeligibility/on_check', { path: req.path, error: errMsg });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

router.post('/v1/coverageeligibility/on_check', handleCoverageEligibilityOnCheck);

router.post('/hcx/v1/coverageeligibility/on_check', handleCoverageEligibilityOnCheck);

/**
 * GET all NHCX Transactions
 */

router.get('/hcx/v1/transactions', async (req, res) => {
  try {
    const { workflow, status, limit = 100 } = req.query;

    const filter: any = {};
    if (workflow) filter.workflow = workflow;
    if (status) filter.status = status;

    const txs = await TransactionLog.find(filter).sort({ createdAt: -1 }).limit(Number(limit));

    res.json({
      transactions: txs,
      message: txs.length === 0 ? 'No transactions found.' : 'Success',
      filters: { workflow, status, limit },
      total: txs.length,
    });
  } catch (err) {
    const message =
      err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
    res.status(500).json({ error: 'Failed to fetch transactions', details: message });
  }
});

export default router;
