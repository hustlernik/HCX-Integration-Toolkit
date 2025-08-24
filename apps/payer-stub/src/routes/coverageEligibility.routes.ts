import express from 'express';
import {
  handleOnRequest,
  handleEligibilityCheck,
  handleSubmitResponse,
  handleGetTransactionById,
} from '../controllers/coverageEligibility';

const router = express.Router();

router.post('/on_request', handleOnRequest);

router.get('/check/:correlationId', handleEligibilityCheck);

router.post('/respond', handleSubmitResponse);

router.get('/:correlationId', handleGetTransactionById);

export default router;
