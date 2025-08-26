import express from 'express';
import Coverage from '../controllers/Coverage.js';

const router = express.Router();
const coverage = new Coverage();

router.post('/', (req, res) => {
  try {
    const result = coverage.createCoverage(req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Coverage creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: [error.message],
    });
  }
});

router.get('/schema', (req, res) => {
  try {
    const schema = coverage.getInputSchema();
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
