import { Request, Response } from 'express';
import CoverageEligibilityRequest from '../models/CoverageEligibilityRequest';
import CoverageEligibilityResponse from '../models/CoverageEligibilityResponse';
import { CoverageEligibilityNHCXController } from './coverageEligibility.nhcx.controller';

const nhcx = new CoverageEligibilityNHCXController();

export async function handleOnRequest(req: Request, res: Response) {
  return nhcx.handleCoverageEligibilityCheck(req, res);
}

export async function handleEligibilityCheck(req: Request, res: Response) {
  try {
    const { correlationId } = req.params as { correlationId: string };
    if (!correlationId) {
      return res.status(400).json({ error: 'Missing correlationId' });
    }

    const reqDoc = await CoverageEligibilityRequest.findOne({ correlationId });
    if (!reqDoc) {
      return res.status(404).json({ error: 'CoverageEligibilityRequest not found' });
    }

    const valid = !!reqDoc.patient && !!reqDoc.organization;
    return res.status(200).json({
      correlationId,
      valid,
      request: reqDoc,
    });
  } catch (err) {
    console.error('handleEligibilityCheck error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleSubmitResponse(req: Request, res: Response) {
  return nhcx.handleCoverageEligibilityOnCheck(req, res);
}

export async function handleGetTransactionById(req: Request, res: Response) {
  try {
    const { correlationId } = req.params as { correlationId: string };
    if (!correlationId) {
      return res.status(400).json({ error: 'Missing correlationId' });
    }

    const request = await CoverageEligibilityRequest.findOne({ correlationId });
    if (!request) {
      return res.status(404).json({ error: 'CoverageEligibilityRequest not found' });
    }

    const responses = request.fhirRefId
      ? await CoverageEligibilityResponse.find({ requestId: request.fhirRefId }).sort({
          createdAt: -1,
        })
      : [];

    return res.status(200).json({ correlationId, request, responses });
  } catch (err) {
    console.error('handleGetTransactionById error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
