import express from 'express';
import Task from '../controllers/Task.js';

const router = express.Router();
const task = new Task();

router.post('/', (req, res) => {
  try {
    const result = task.createTask(req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: [error.message],
    });
  }
});

router.get('/schema', (req, res) => {
  try {
    const schema = task.getInputSchema();
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
