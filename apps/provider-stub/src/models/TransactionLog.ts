import mongoose from 'mongoose';

const TransactionLogSchema = new mongoose.Schema(
  {
    correlationId: { type: String, required: true, unique: true },
    protectedHeaders: Object,
    rawRequestJWE: String,
    requestFHIR: { type: mongoose.Schema.Types.Mixed, select: false },
    responseFHIR: { type: mongoose.Schema.Types.Mixed, select: false },
    responseJWE: String,
    status: {
      type: String,
      enum: ['pending', 'complete'],
      default: 'pending',
    },
    workflow: { type: String, default: 'coverage-eligibility' },
  },
  {
    timestamps: true,
  },
);

TransactionLogSchema.index({ createdAt: -1 });

export default mongoose.model('TransactionLog', TransactionLogSchema);
