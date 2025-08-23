import mongoose, { Schema, InferSchemaType } from 'mongoose';

const BeneficiarySchema = new Schema(
  {
    abhaId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      first: { type: String, required: true },
      last: { type: String },
      middle: { type: String },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'unknown'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    phone: { type: String },
    email: { type: String },
    address: {
      line: { type: String },
      city: { type: String },
      district: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
    abhaAddress: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export type IBeneficiary = InferSchemaType<typeof BeneficiarySchema>;

export default mongoose.model<IBeneficiary>('Beneficiary', BeneficiarySchema);
