import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PatientSchema = new Schema({
  id: { type: String, required: true },
  name: String,
  dob: Date,
  gender: String,
  identifier: String,
});

const OrganizationSchema = new Schema({
  id: String,
  name: String,
  type: String,
  contact: {
    phone: String,
    email: String,
  },
});

const AdjudicationSchema = new Schema({
  adjudication: [
    {
      category: { type: String },
      reason: { type: String },
      amount: {
        value: { type: Number },
        currency: { type: String },
      },
      value: { type: Number },
    },
  ],
});

const ItemSchema = new Schema({
  adjudication: [AdjudicationSchema],
  detail: {
    adjudication: [AdjudicationSchema],
  },
});

const totalSchema = new Schema({
  category: { type: String },
  amount: {
    value: { type: Number },
    currency: { type: String },
  },
});

const processNoteSchema = new Schema({
  type: { type: String },
  enum: ['display', 'print', 'printoper'],
  text: { type: String },
});

const CoverageSchema = new Schema({
  id: String,
  policyNumber: String,
  status: String,
  plan: String,
  payor: String,
});

const InsuranceSchema = new Schema({
  focal: { type: Boolean },
  coverage: CoverageSchema,
});

const PaymentSchema = new Schema({
  type: { type: String },
  adjustment: {
    value: { type: Number },
    currency: { type: String },
  },
  adjustmentReason: { type: String },
  amount: {
    value: { type: Number },
    currency: { type: String },
  },
});

const AddItemSchema = new Schema({
  productOrService: { type: String },
  programCode: { type: String },
  quantity: {
    value: { type: Number },
    unit: { type: String },
    code: { type: String },
  },
  unitPrice: {
    value: { type: Number },
    currency: { type: String },
  },
  factor: { type: Number },
  net: {
    value: { type: Number },
    currency: { type: String },
  },
  bodySite: { type: String },
  subSite: { type: String },
  adjudication: [AdjudicationSchema],
});

const ClaimResponseSchema = new Schema({
  claimResponseId: { type: String, required: true, unique: true },
  correlationId: { type: String, required: true, unique: true },
  fhirRefId: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'draft', 'entered-in-error'],
    required: true,
  },
  type: { type: String, required: true },
  subType: { type: String, required: true },
  use: {
    type: String,
    enum: ['claim', 'preauthorization', 'predetermination'],
  },
  patient: PatientSchema,
  created: {
    type: Date,
    required: true,
  },
  insurer: OrganizationSchema,
  claimId: { type: String },
  outcome: { type: String, enum: ['queued', 'complete', 'error', 'partial'] },
  disposition: { type: String },
  preAuthRef: { type: String },
  preAuthPeriod: {
    start: { type: Date },
    end: { type: Date },
  },
  payeeType: { type: String },
  fundsReserve: { type: String },
  adjudication: [AdjudicationSchema],
  item: [ItemSchema],
  addItem: [AddItemSchema],
  processNote: [processNoteSchema],
  formCode: { type: String },
  payment: PaymentSchema,
  communicationRequestId: { type: String },
  insurance: [InsuranceSchema],
  total: [totalSchema],
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type IClaimResponse = InferSchemaType<typeof ClaimResponseSchema>;
export default mongoose.model<IClaimResponse>('ClaimResponse', ClaimResponseSchema);
