import mongoose from 'mongoose';

const TransactionLogSchema = new mongoose.Schema(
  {
    correlationId: { type: String, required: true, unique: true },
    protectedHeaders: Object,
    rawRequestJWE: String,
    requestFHIR: Object,
    responseFHIR: Object,
    responseJWE: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'queried', 'complete', 'sent', 'received', 'error'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    workflow: { type: String, default: 'communication' },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

export default mongoose.model('TransactionLog', TransactionLogSchema);
