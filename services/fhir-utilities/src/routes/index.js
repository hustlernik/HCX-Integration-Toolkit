import express from 'express';
import claimRoutes from './claim.routes.js';
import claimResponseRoutes from './claimResponse.routes.js';
import patientRoutes from './patient.routes.js';
import taskRoutes from './task.routes.js';
import paymentNoticeRoutes from './paymentNotice.routes.js';
import paymentReconciliationRoutes from './paymentReconciliation.routes.js';
import coverageEligibilityRequestRoutes from './coverageEligibilityRequest.routes.js';
import coverageEligibilityResponseRoutes from './coverageEligibilityResponse.routes.js';
import insurancePlanRoutes from './insurancePlan.routes.js';
import coverageRoutes from './coverage.routes.js';

const router = express.Router();

router.use('/claim', claimRoutes);
router.use('/claim-response', claimResponseRoutes);
router.use('/patient', patientRoutes);
router.use('/task', taskRoutes);
router.use('/payment-notice', paymentNoticeRoutes);
router.use('/payment-reconciliation', paymentReconciliationRoutes);
router.use('/coverage-eligibility-request', coverageEligibilityRequestRoutes);
router.use('/coverage-eligibility-response', coverageEligibilityResponseRoutes);
router.use('/insurance-plan', insurancePlanRoutes);
router.use('/coverage', coverageRoutes);

export default router;
