import mongoose, { Schema, InferSchemaType } from 'mongoose';

const ConditionSchema = new Schema({
  id: String,
  clinicalStatus: String,
  verificationStatus: String,
  category: String,
  severity: String,
  onsetDate: Date,
  abatementDate: Date,
  bodySite: String,
  notes: String,
});

const DiagnosisSchema = new Schema({
  code: String,
  description: String,
  condition: ConditionSchema,
});

const ItemSchema = new Schema({
  category: {
    code: String,
    display: String,
  },
  productOrService: {
    code: String,
    display: String,
  },
  quantity: {
    value: Number,
    unit: String,
  },
  unitPrice: {
    value: Number,
    currency: String,
  },
  diagnoses: [DiagnosisSchema],
});

const ServicedSchema = new Schema({
  date: Date,
  period: {
    start: Date,
    end: Date,
  },
});

const PatientSchema = new Schema({
  id: { type: String, required: true },
  name: String,
  dob: Date,
  gender: String,
  identifier: String,
});

const CoverageSchema = new Schema({
  id: String,
  policyNumber: String,
  status: String,
  plan: String,
  payor: String,
});

const PractitionerSchema = new Schema({
  id: String,
  name: String,
  qualification: String,
  identifier: String,
});

const PractitionerRoleSchema = new Schema({
  specialty: String,
  role: String,
  availability: String,
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

const CoverageEligibilityRequestSchema = new Schema({
  correlationId: { type: String, required: true, unique: true },
  fhirRefId: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'draft', 'entered-in-error'],
    required: true,
  },
  purpose: [
    {
      type: String,
      enum: ['auth-requirements', 'benefits', 'discovery', 'validation'],
    },
  ],
  patient: PatientSchema,
  insurance: [
    {
      focal: Boolean,
      coverage: CoverageSchema,
    },
  ],
  practitioner: PractitionerSchema,
  practitionerRole: PractitionerRoleSchema,
  organization: OrganizationSchema,
  serviced: ServicedSchema,
  items: [ItemSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type ICoverageEligibilityRequest = InferSchemaType<typeof CoverageEligibilityRequestSchema>;
export default mongoose.model<ICoverageEligibilityRequest>(
  'CoverageEligibilityRequest',
  CoverageEligibilityRequestSchema,
);
