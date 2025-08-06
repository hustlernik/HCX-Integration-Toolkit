export const INSURANCE_PLAN_TYPES = [
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
];

export const PLAN_TYPES = [
  'Individual',
  'Individual Floater',
  'Group',
  'Group Floater',
  'Declaration',
  'Declaration Floater',
  'Declaration with Group Organiser',
  'Declaration Floater with Group Organiser',
  'Any Other Cover Type',
];

export const BENEFIT_CATEGORIES = [
  'Biomedical device',
  'Site of care',
  'Pharmaceutical / biologic product',
  'Administrative procedure',
  'Donor for medical or surgical procedure',
  'Healthcare services',
];

export const CATEGORY_OPTIONS = [
  { code: '63653004', display: 'Biomedical device (physical object)' },
  { code: '43741000', display: 'Site of care (environment)' },
  { code: '373873005', display: 'Pharmaceutical / biologic product (product)' },
  { code: '14734007', display: 'Administrative procedure (procedure)' },
  { code: '105455006', display: 'Donor for medical or surgical procedure (person)' },
];
export const PRODUCT_OR_SERVICE_OPTIONS = [
  { code: '387713003', display: 'Surgical procedure (procedure)' },
  { code: '305056002', display: 'Admission procedure' },
  { code: '43741000', display: 'Site of care' },
  { code: '285201006', display: 'Hospital environment' },
  { code: '63653004', display: 'Medical device' },
  { code: '440654001', display: 'Inpatient environment (environment)' },
  { code: '440655000', display: 'Outpatient environment (environment)' },
];

export const BENEFIT_TYPES = [
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
];

export const ORGANIZATIONS = {
  owned: [
    { value: 'abc-insurance-ltd', label: 'ABC Insurance Ltd.' },
    { value: 'star-health', label: 'Star Health' },
    { value: 'niva-bupa', label: 'Niva Bupa' },
  ],
  administered: [
    { value: 'xyz-health-tpa', label: 'XYZ Health TPA' },
    { value: 'mediassist-tpa', label: 'Mediassist TPA' },
    { value: 'health-india-tpa', label: 'Health India TPA' },
  ],
};
