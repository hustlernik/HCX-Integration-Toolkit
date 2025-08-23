import { Router } from 'express';
import {
  getAllInsurancePlans,
  getInsurancePlanById,
  createInsurancePlan,
  updateInsurancePlan,
  deleteInsurancePlan,
  searchInsurancePlans,
} from '../controllers/insurancePlan';

const router = Router();

router.get('/InsurancePlan', getAllInsurancePlans);
router.get('/InsurancePlan/:id', getInsurancePlanById);
router.post('/InsurancePlan', createInsurancePlan);
router.put('/InsurancePlan/:id', updateInsurancePlan);
router.delete('/InsurancePlan/:id', deleteInsurancePlan);

router.get('/InsurancePlan/_search', searchInsurancePlans);

router.get('/insurance-plans', getAllInsurancePlans);
router.get('/insurance-plans/:id', getInsurancePlanById);
router.post('/insurance-plans', createInsurancePlan);
router.put('/insurance-plans/:id', updateInsurancePlan);
router.delete('/insurance-plans/:id', deleteInsurancePlan);

export default router;
