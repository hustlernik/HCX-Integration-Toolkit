import { Router } from 'express';
import { createBeneficiary, getBeneficiaries } from '../controllers/beneficiary.controller';

const router = Router();

router.post('/', createBeneficiary);
router.get('/', getBeneficiaries);

export default router;
