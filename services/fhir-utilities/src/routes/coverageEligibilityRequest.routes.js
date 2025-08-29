import express from 'express';
import CoverageEligibilityRequest from '../controllers/CoverageEligibilityRequest.js';

const router = express.Router();
const coverageEligibilityRequest = new CoverageEligibilityRequest();

router.post('/', (req, res) => {
  try {
    const result = coverageEligibilityRequest.createCoverageEligibilityRequest(req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('CoverageEligibilityRequest creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/schema', (req, res) => {
  try {
    const schema = coverageEligibilityRequest.getInputSchema();
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
