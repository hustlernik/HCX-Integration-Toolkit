import mongoose, { Schema, InferSchemaType } from 'mongoose';

const PatientSchema = new Schema({
  id: { type: String, required: true },
  name: String,
  dob: Date,
  gender: String,
  identifier: String,
});

const PractitionerSchema = new Schema({
  id: String,
  name: String,
  qualification: String,
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

const RelatedSchema = new Schema({
  RelatedClaimId: { type: String },
  relationShip: { type: String },
});

const MedicationRequestSchema = new Schema({
  intent: {
    type: String,
    required: true,
    enum: [
      'proposal',
      'plan',
      'order',
      'original-order',
      'reflex-order',
      'filler-order',
      'instance-order',
      'option',
    ],
  },
  medication: [
    {
      type: String,
    },
  ],
  reason: [
    {
      type: String,
    },
  ],
  dosageInstruction: [
    {
      text: { type: String },
      additionalInstruction: {
        type: String,
      },
    },
  ],
});

const DeviceRequestSchema = new Schema({
  intent: {
    type: String,
    required: true,
    enum: [
      'proposal',
      'plan',
      'order',
      'original-order',
      'reflex-order',
      'filler-order',
      'instance-order',
      'option',
    ],
  },
  priority: {
    type: String,
  },
  reason: [
    {
      type: String,
    },
  ],
  note: { type: String },
  deviceRequested: { type: String },
});

const VisionPrescriptionSchema = new Schema({
  lensSpecification: [
    {
      product: { type: String },
      eye: { type: String, enum: ['right', 'left'] },
      sphere: { type: Number },
      cylinder: { type: Number },
      axis: { type: Number },
      note: { type: String },
      prism: [
        {
          amount: { type: Number },
          base: { type: String, enum: ['up', ' down', 'in', 'out'] },
        },
      ],
      add: { type: Number },
      power: { type: Number },
      backCurve: { type: Number },
      diameter: { type: Number },
    },
  ],
});

const PrescriptionSchema = new Schema({
  medicationRequest: MedicationRequestSchema,
  deviceRequest: DeviceRequestSchema,
  visionPrescription: VisionPrescriptionSchema,
});

const SupportingInfoSchema = new Schema({
  category: { type: String },
  code: { type: String },
  reason: { type: String },
});

const DiagnosisSchema = new Schema({
  diagnosis: { type: String },
  onAdmission: { type: String },
  type: { type: String },
  packageCode: { type: String },
});

const ProcedureSchema = new Schema({
  type: { type: String },
  procedure: { type: String },
});

const CoverageSchema = new Schema({
  id: String,
  policyNumber: String,
  status: String,
  plan: String,
  payor: String,
});

const ItemSchema = new Schema({
  revenue: { type: String },
  category: { type: String },
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
});

const ClaimSchema = new Schema({
  claimId: { type: String, required: true, unique: true },
  correlationId: { type: String, required: true, unique: true },
  apiCallId: { type: String },
  requestId: { type: String },
  fhirRefId: { type: String, required: true },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'draft', 'entered-in-error'],
    required: true,
  },
  type: { type: String, required: true },
  subType: { type: String, required: false },
  use: {
    type: String,
    enum: ['claim', 'preauthorization', 'predetermination'],
  },
  patient: PatientSchema,
  billablePeriod: {
    start: Date,
    end: Date,
  },
  created: {
    type: Date,
    required: true,
  },
  enterer: PractitionerSchema,
  insurer: OrganizationSchema,
  provider: OrganizationSchema,
  priority: {
    type: String,
    enum: ['Immediate', 'Normal', 'Deferred'],
  },

  fundsReserve: {
    type: String,
    enum: ['Patient', 'Provider', 'None'],
  },

  related: [RelatedSchema],
  prescription: PrescriptionSchema,
  orginalPrescription: PrescriptionSchema,
  payee: [
    {
      type: { type: String },
    },
  ],

  careTeam: [
    {
      isResponsible: { type: Boolean },
      role: { type: String },
      qualification: { type: String },
    },
  ],
  supportingInfo: [SupportingInfoSchema],
  diagnosis: [DiagnosisSchema],
  procedure: [ProcedureSchema],
  insurance: [
    {
      focal: Boolean,
      coverage: CoverageSchema,
    },
  ],

  item: [ItemSchema],
  total: {
    value: { type: Number },
    currency: { type: String },
  },

  communicationStatus: {
    type: String,
    enum: ['none', 'requested', 'in-progress', 'responded', 'completed'],
    default: 'none',
  },

  pendingCommunications: [
    {
      communicationId: { type: String },
      requestedAt: { type: Date },
      dueDate: { type: Date },
      status: { type: String, enum: ['pending', 'responded', 'overdue'], default: 'pending' },
    },
  ],

  lastCommunicationAt: { type: Date },
  communicationCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export type IClaim = InferSchemaType<typeof ClaimSchema>;
export default mongoose.model<IClaim>('Claim', ClaimSchema);
