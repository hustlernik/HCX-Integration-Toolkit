import express from 'express';
import Patient from '../controllers/Patient.js';

const router = express.Router();
const patient = new Patient();

router.post('/', (req, res) => {
  try {
    const result = patient.createPatient(req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Patient creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/schema', (req, res) => {
  try {
    const schema = patient.getInputSchema();
    res.status(200).json({
      success: true,
      schema: schema.describe(),
    });
  } catch (error) {
    console.error('Schema retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve schema',
    });
  }
});

export default router;
