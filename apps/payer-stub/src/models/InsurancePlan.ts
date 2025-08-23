import mongoose, { Schema, InferSchemaType } from 'mongoose';

const InsurancePlanSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    status: { type: String, default: 'active' },
    resourceType: { type: String, default: 'InsurancePlan' },
    insurancePlanType: {
      type: String,
      required: true,
      enum: [
        'Hospitalisation Indemnity Policy',
        'Hospital Cash Plan',
        'Critical Illness Cover -Indemnity',
        'Critical Illness Cover - Benefits',
        'Out Patient Policy',
        'Universal Health Policy',
        'Micro insurance Policy',
        'Package Policy (covering more than one type of health above)',
        'Hybrid Policy (covering other than health also)',
        'Mass policy',
        'Any Other Product Type',
      ],
    },
    name: { type: String, required: true, default: 'ABC Health Secure Plan' },
    aliases: { type: [String], default: ['ABC Secure'] },
    periodStart: { type: Date, required: true, default: new Date('2024-01-01') },
    periodEnd: { type: Date, default: new Date('2025-01-01') },
    ownedByOrgId: {
      type: String,
      enum: ['abc-insurance-ltd', 'star-health', 'niva-bupa'],
      required: true,
      default: 'abc-insurance-ltd',
    },
    ownedByDisplay: { type: String, default: 'ABC Insurance Ltd.' },
    administeredByOrgId: {
      type: String,
      enum: ['xyz-health-tpa', 'mediassist-tpa', 'health-india-tpa'],
      default: 'xyz-health-tpa',
    },
    administeredByDisplay: { type: String, default: 'XYZ Health TPA' },
    coverageAreaIds: [
      {
        type: [String],
        enum: ['delhi-ncr', 'mumbai', 'bangalore'],
        default: ['delhi-ncr'],
      },
    ],
    contactPhones: [{ type: [String], default: '+91-9999999999' }],
    contactEmails: [{ type: [String], default: 'support@abcinsurance.com' }],
    networkOrgIds: [
      {
        type: [String],
        enum: ['max-hospital', 'apollo-hospital', 'fortis-hospital'],
        default: ['max-hospital', 'apollo-hospital'],
      },
    ],
    claimConditions: [
      {
        type: [String],
        enum: [
          'Minimum 24 hours hospitalisation required',
          'Prior authorization required',
          'Cashless only at network hospitals',
          'Claim applicable for pre-existing only after waiting period',
          'Others',
        ],
        default: ['Minimum 24 hours hospitalisation required'],
      },
    ],
    supportingDocuments: [
      {
        type: [String],
        enum: [
          'Proof of identity',
          'Proof of address',
          'Aadhaar card',
          'PAN card',
          'Voter ID',
          'Passport',
          'Driving License',
          'Discharge Summary',
          'Medical Prescription',
          'Investigation Reports',
          'Hospital Bill',
          'Claim Form',
          'Bank Details',
          'Cancelled Cheque',
          'Authorization Letter',
          'Others',
        ],
        default: ['Aadhaar card', 'Discharge Summary', 'Claim Form'],
      },
    ],
    benefitTypes: [
      {
        type: [String],
        enum: [
          'Consultation',
          'Hospitalization',
          'Day Care Treatment',
          'Maternity',
          'New Born',
          'Emergency',
          'ICU',
          'Ambulance',
          'Medicine',
          'Diagnostics',
          'Dental',
          'Vision',
          'Mental Health',
          'Other',
        ],
        default: ['Hospitalization', 'Diagnostics'],
      },
    ],
    planType: {
      type: String,
      required: true,
      enum: [
        'Individual',
        'Individual Floater',
        'Group',
        'Group Floater',
        'Declaration',
        'Declaration Floater',
        'Declaration with Group Organiser',
        'Declaration Floater with Group Organiser',
        'Any Other Cover Type',
      ],
      default: 'Group',
    },
    generalCosts: [
      {
        comment: { type: String, default: 'Base coverage for individual up to 5 lakh INR' },
        groupSize: { type: Number, default: 1 },
        costAmount: { type: Number, default: 5000 },
        currency: { type: String, default: 'INR' },
      },
    ],
    specificCosts: [
      {
        benefitCategory: {
          type: String,
          enum: [
            'Biomedical device',
            'Site of care',
            'Pharmaceutical / biologic product',
            'Administrative procedure',
            'Donor for medical or surgical procedure',
            'Healthcare services',
          ],
          default: 'Healthcare services',
        },
        benefitType: { type: String, default: 'ICU stay charges' },
        costAmount: { type: Number, default: 10000 },
        currency: { type: String, default: 'INR' },
      },
    ],
  },
  { timestamps: true },
);

export type IInsurancePlan = InferSchemaType<typeof InsurancePlanSchema>;

export const InsurancePlan = mongoose.model<IInsurancePlan>('InsurancePlan', InsurancePlanSchema);
