import express from 'express';
import InsurancePlan from '../controllers/InsurancePlan.js';

const router = express.Router();
const insurancePlan = new InsurancePlan();

router.post('/', (req, res) => {
  try {
    const result = insurancePlan.createInsurancePlan(req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('InsurancePlan creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: [error.message],
    });
  }
});

router.get('/schema', (req, res) => {
  try {
    const schema = insurancePlan.getInputSchema();
    res.status(200).json({
      success: true,
      schema: schema.describe(),
    });
  } catch (error) {
    console.error('Schema retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve schema',
      details: [error.message],
    });
  }
});

export default router;
