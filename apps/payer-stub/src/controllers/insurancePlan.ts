import { Request, Response } from 'express';
import { InsurancePlan } from '../models/InsurancePlan';

export const getAllInsurancePlans = async (req: Request, res: Response) => {
  try {
    const plans = await InsurancePlan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insurance plans' });
  }
};

export const getInsurancePlanById = async (req: Request, res: Response) => {
  try {
    const plan = await InsurancePlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Insurance plan not found' });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insurance plan' });
  }
};

const generateShortPlanId = () => 'PLN-' + Math.random().toString(36).substr(2, 6).toUpperCase();

export const createInsurancePlan = async (req: Request, res: Response) => {
  try {
    const planData = req.body;

    if (!planData.id) {
      planData.id = generateShortPlanId();
    }

    if (!planData.resourceType) {
      planData.resourceType = 'InsurancePlan';
    } else if (planData.resourceType !== 'InsurancePlan') {
      return res.status(400).json({
        error: 'Invalid resourceType',
        message: 'Expected resourceType "InsurancePlan".',
      });
    }

    if (!planData.status) {
      planData.status = 'active';
    }

    const newPlan = new InsurancePlan(planData);
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (error: any) {
    console.error('Error creating insurance plan:', error);

    if (error.name === 'ValidationError') {
      const validationErrors: any = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate key error',
        message: 'An insurance plan with this ID already exists',
        details: error.keyValue,
      });
    }

    res.status(400).json({
      error: 'Failed to create insurance plan',
      message: error.message,
    });
  }
};

export const updateInsurancePlan = async (req: Request, res: Response) => {
  try {
    const planData = req.body;
    const updatedPlan = await InsurancePlan.findByIdAndUpdate(req.params.id, planData, {
      new: true,
      runValidators: true,
    });
    if (!updatedPlan) {
      return res.status(404).json({ error: 'Insurance plan not found' });
    }
    res.json(updatedPlan);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update insurance plan' });
  }
};

export const deleteInsurancePlan = async (req: Request, res: Response) => {
  try {
    const deletedPlan = await InsurancePlan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) {
      return res.status(404).json({ error: 'Insurance plan not found' });
    }
    res.json({ message: 'Insurance plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete insurance plan' });
  }
};

export const searchInsurancePlans = async (req: Request, res: Response) => {
  try {
    const { name, insurancePlanType, planType } = req.query;
    const query: any = {};

    if (name) {
      query.name = { $regex: name as string, $options: 'i' };
    }
    if (insurancePlanType) {
      query.insurancePlanType = insurancePlanType;
    }
    if (planType) {
      query.planType = planType;
    }

    const plans = await InsurancePlan.find(query);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search insurance plans' });
  }
};
