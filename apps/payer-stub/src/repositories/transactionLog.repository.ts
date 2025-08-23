import TransactionLog from '../models/TransactionLog';

export interface UpdateLogParams {
  correlationId: string;
  requestFHIR?: any;
  rawRequestJWE?: string;
  responseFHIR?: any;
  responseJWE?: string;
  protectedHeaders?: Record<string, any>;
  status?: string;
  workflow?: string;
}

export class TransactionLogRepository {
  async updateByCorrelationId(params: UpdateLogParams) {
    const {
      correlationId,
      requestFHIR,
      rawRequestJWE,
      responseFHIR,
      responseJWE,
      protectedHeaders,
      status,
      workflow,
    } = params;
    return TransactionLog.findOneAndUpdate(
      { correlationId },
      {
        $set: {
          ...(requestFHIR !== undefined ? { requestFHIR } : {}),
          ...(rawRequestJWE !== undefined ? { rawRequestJWE } : {}),
          ...(responseFHIR !== undefined ? { responseFHIR } : {}),
          ...(responseJWE !== undefined ? { responseJWE } : {}),
          ...(protectedHeaders !== undefined ? { protectedHeaders } : {}),
          ...(status !== undefined ? { status } : {}),
          ...(workflow !== undefined ? { workflow } : {}),
          updatedAt: new Date(),
        },
      },
      { new: true },
    );
  }

  async create(doc: any) {
    return TransactionLog.create(doc);
  }
}
