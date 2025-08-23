import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PolicySchema = new Schema(
  {
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        const date = new Date();
        const year = String(date.getFullYear()).slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0');
        return `POL-${year}${month}${day}-${random}`;
      },
    },
    beneficiary: {
      type: Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: true,
    },
    insurancePlan: {
      type: Schema.Types.ObjectId,
      ref: 'InsurancePlan',
      required: true,
    },
    coverageStart: {
      type: Date,
      required: true,
    },
    coverageEnd: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'draft', 'entered-in-error'],
      default: 'active',
    },
  },
  { timestamps: true },
);

export type IPolicy = InferSchemaType<typeof PolicySchema>;

export default mongoose.model<IPolicy>('Policy', PolicySchema);
