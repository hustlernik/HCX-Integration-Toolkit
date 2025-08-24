import { Request, Response } from 'express';
import Policy from '../models/Policy';
import Beneficiary from '../models/Beneficiary';
import { InsurancePlan } from '../models/InsurancePlan';

export const createPolicy = async (req: Request, res: Response) => {
  try {
    const { policyNumber, ...policyData } = req.body;

    const policy = new Policy(policyData);
    await policy.save();
    await policy.populate('beneficiary');
    await policy.populate('insurancePlan');
    res.status(201).json(policy);
  } catch (error: any) {
    console.error('Create Policy Error:', error);
    res.status(400).json({ error: error.message, details: error });
  }
};

export const getPolicies = async (req: Request, res: Response) => {
  try {
    const policies = await Policy.find().populate('beneficiary').populate('insurancePlan');
    res.json(policies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPolicyById = async (req: Request, res: Response) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('beneficiary')
      .populate('insurancePlan');
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePolicy = async (req: Request, res: Response) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('beneficiary')
      .populate('insurancePlan');

    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json(policy);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePolicy = async (req: Request, res: Response) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ error: 'Policy not found' });
    res.json({ message: 'Policy deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
