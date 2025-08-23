const mongoose = require('mongoose');

const BenefitSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'benefit',
      'deductible',
      'visit',
      'room',
      'copay',
      'copay-percent',
      'copay-maximum',
      'vision-exam',
      'vision-glasses',
      'vision-contacts',
      'medical-primarycare',
      'pharmacy-dispense',
    ],
    required: true,
  },
  allowedUnsignedInt: { type: Number },
  allowedString: { type: String },
  allowedMoney: {
    value: { type: Number },
    currency: { type: String },
  },
  usedUnsignedInt: { type: Number },
  usedString: { type: String },
  usedMoney: {
    value: { type: Number },
    currency: { type: String },
  },
});

const ItemSchema = new mongoose.Schema({
  category: {
    code: {
      type: String,
      enum: ['63653004', '43741000', '373873005', '14734007', '105455006'],
    },
    display: {
      type: String,
      enum: [
        'Biomedical device (physical object)',
        'Site of care (environment)',
        'Pharmaceutical / biologic product (product)',
        'Administrative procedure (procedure)',
        'Donor for medical or surgical procedure (person)',
      ],
    },
  },
  productOrService: {
    code: {
      type: String,
      enum: [
        '387713003', // Surgical procedure (procedure)
        '305056002', // Admission procedure
        '43741000', // Site of care
        '285201006', // Hospital environment
        '63653004', // Medical device
        '440654001', // Inpatient environment (environment)
        '440655000', // Outpatient environment (environment)
      ],
    },
    display: {
      type: String,
      enum: [
        'Surgical procedure (procedure)',
        'Admission procedure',
        'Site of care',
        'Hospital environment',
        'Medical device',
        'Inpatient environment (environment)',
        'Outpatient environment (environment)',
      ],
    },
  },
  excluded: { type: Boolean },
  name: { type: String },
  description: { type: String },
  network: {
    type: String,
    enum: ['in-network', 'out-of-network'],
  },
  unit: {
    type: String,
    enum: ['individual', 'family'],
  },
  term: { type: String },
  benefits: [BenefitSchema],
  authorizationRequired: { type: Boolean },
  authorizationSupporting: [{ code: String, display: String }],
  authorizationUrl: { type: String },
});

const InsuranceSchema = new mongoose.Schema({
  policyNumber: { type: String },
  inforce: { type: Boolean },
  benefitPeriod: {
    start: { type: Date },
    end: { type: Date },
  },
  items: [ItemSchema],
});

const AdjudicationInfoSchema = new mongoose.Schema({
  adjudicatedBy: { type: String },
  adjudicationNotes: { type: String },
  adjudicatedAt: { type: Date },
  selectedByAdjudicator: { type: Boolean },
});

const CoverageEligibilityResponseSchema = new mongoose.Schema(
  {
    identifier: [{ system: String, value: String }],
    requestId: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'draft', 'entered-in-error'],
      required: true,
    },
    purpose: {
      type: [String],
      enum: ['auth-requirements', 'benefits', 'discovery', 'validation'],
      required: true,
    },
    outcome: {
      type: String,
      enum: ['queued', 'complete', 'error', 'partial'],
      required: true,
    },
    disposition: { type: String },

    patientId: { type: String, required: true },
    insurerId: { type: String, required: true },

    servicedDate: { type: Date },
    servicedPeriod: {
      start: { type: Date },
      end: { type: Date },
    },

    created: { type: Date, required: true },
    insurance: [InsuranceSchema],
    form: {
      code: {
        type: String,
        enum: [
          'laborder',
          'labreport',
          'diagnosticimageorder',
          'diagnosticimagereport',
          'professionalreport',
          'accidentreport',
          'model',
          'picture',
        ],
      },
      display: { type: String },
    },
    adjudication: AdjudicationInfoSchema,
    errors: [
      {
        code: {
          type: String,
          enum: ['a001', 'a002'],
        },
        message: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const CoverageEligibilityResponse = mongoose.model(
  'CoverageEligibilityResponse',
  CoverageEligibilityResponseSchema,
);
export { CoverageEligibilityResponse };
export default CoverageEligibilityResponse;
