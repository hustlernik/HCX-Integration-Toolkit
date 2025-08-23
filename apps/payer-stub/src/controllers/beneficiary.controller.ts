import { Request, Response } from 'express';
import Beneficiary from '../models/Beneficiary';

export const createBeneficiary = async (req: Request, res: Response) => {
  try {
    const beneficiary = new Beneficiary(req.body);
    await beneficiary.save();
    res.status(201).json(beneficiary);
  } catch (error: any) {
    if (error?.code === 11000) {
      const fields = Object.keys(error.keyPattern || error.keyValue || {});
      const fieldList = fields.length ? fields.join(', ') : 'unique field';
      return res
        .status(409)
        .json({ error: `Duplicate value for ${fieldList}. Please use a unique value.` });
    }
    res.status(400).json({ error: error.message });
  }
};

export const getBeneficiaries = async (req: Request, res: Response) => {
  try {
    const query: any = {};
    if (req.query.abhaId) query.abhaId = req.query.abhaId;
    if (req.query.name) query['name.first'] = { $regex: req.query.name, $options: 'i' };
    const beneficiaries = await Beneficiary.find(query);
    res.json(beneficiaries);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
