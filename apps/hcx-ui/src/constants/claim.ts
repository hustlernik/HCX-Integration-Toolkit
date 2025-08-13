export const CLAIM_RESPONSE_STATUS = [
  { code: 'active', display: 'Active', system: 'http://hl7.org/fhir/CodeSystem/fm-status' },
  { code: 'cancelled', display: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/fm-status' },
  { code: 'draft', display: 'Draft', system: 'http://hl7.org/fhir/CodeSystem/fm-status' },
  {
    code: 'entered-in-error',
    display: 'Entered in Error',
    system: 'http://hl7.org/fhir/CodeSystem/fm-status',
  },
] as const;

export const CLAIM_TYPES = [
  {
    code: 'institutional',
    display: 'Institutional',
    system: 'http://terminology.hl7.org/CodeSystem/claim-type',
  },
  { code: 'oral', display: 'Oral', system: 'http://terminology.hl7.org/CodeSystem/claim-type' },
  {
    code: 'pharmacy',
    display: 'Pharmacy',
    system: 'http://terminology.hl7.org/CodeSystem/claim-type',
  },
  {
    code: 'professional',
    display: 'Professional',
    system: 'http://terminology.hl7.org/CodeSystem/claim-type',
  },
  { code: 'vision', display: 'Vision', system: 'http://terminology.hl7.org/CodeSystem/claim-type' },
] as const;

export const USE_TYPES = [
  { code: 'claim', display: 'Claim', system: 'http://hl7.org/fhir/claim-use' },
  {
    code: 'preauthorization',
    display: 'Pre-authorization',
    system: 'http://hl7.org/fhir/claim-use',
  },
  {
    code: 'predetermination',
    display: 'Pre-determination',
    system: 'http://hl7.org/fhir/claim-use',
  },
] as const;

export const OUTCOME_CODES = [
  { code: 'queued', display: 'Queued', system: 'http://hl7.org/fhir/claim-outcome' },
  { code: 'complete', display: 'Processing Complete', system: 'http://hl7.org/fhir/claim-outcome' },
  { code: 'error', display: 'Error', system: 'http://hl7.org/fhir/claim-outcome' },
  { code: 'partial', display: 'Partial Processing', system: 'http://hl7.org/fhir/claim-outcome' },
] as const;

export const ADJUDICATION_CATEGORIES = [
  {
    code: 'submitted',
    display: 'Submitted Amount',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  { code: 'copay', display: 'CoPay', system: 'http://terminology.hl7.org/CodeSystem/adjudication' },
  {
    code: 'eligible',
    display: 'Eligible Amount',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  {
    code: 'deductible',
    display: 'Deductible',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  {
    code: 'unallocdeduct',
    display: 'Unallocated Deductible',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  {
    code: 'eligpercent',
    display: 'Eligible %',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  { code: 'tax', display: 'Tax', system: 'http://terminology.hl7.org/CodeSystem/adjudication' },
  {
    code: 'benefit',
    display: 'Benefit Amount',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
] as const;

export const PAYMENT_TYPES = [
  {
    code: 'complete',
    display: 'Complete Payment',
    system: 'http://terminology.hl7.org/CodeSystem/ex-paymenttype',
  },
  {
    code: 'partial',
    display: 'Partial Payment',
    system: 'http://terminology.hl7.org/CodeSystem/ex-paymenttype',
  },
] as const;

export const PAYEE_TYPES = [
  {
    code: 'subscriber',
    display: 'Subscriber',
    system: 'http://terminology.hl7.org/CodeSystem/payeetype',
  },
  {
    code: 'provider',
    display: 'Provider',
    system: 'http://terminology.hl7.org/CodeSystem/payeetype',
  },
  { code: 'other', display: 'Other', system: 'http://terminology.hl7.org/CodeSystem/payeetype' },
] as const;

export const TOTAL_CATEGORIES = [
  {
    code: 'submitted',
    display: 'Submitted',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  {
    code: 'benefit',
    display: 'Benefit',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  {
    code: 'adjudicatedamount',
    display: 'Adjudicated Amount',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
  { code: 'tax', display: 'Tax', system: 'http://terminology.hl7.org/CodeSystem/adjudication' },
  { code: 'copay', display: 'Copay', system: 'http://terminology.hl7.org/CodeSystem/adjudication' },
  {
    code: 'deductible',
    display: 'Deductible',
    system: 'http://terminology.hl7.org/CodeSystem/adjudication',
  },
] as const;

export const NOTE_TYPES = [
  {
    code: 'display',
    display: 'Display',
    system: 'http://terminology.hl7.org/CodeSystem/note-type',
  },
  { code: 'print', display: 'Print', system: 'http://terminology.hl7.org/CodeSystem/note-type' },
  {
    code: 'printoper',
    display: 'Print Operator',
    system: 'http://terminology.hl7.org/CodeSystem/note-type',
  },
] as const;

export const ERROR_CODES = [
  { code: 'a001', display: 'Missing information' },
  { code: 'a002', display: 'Invalid coding' },
  { code: 'a003', display: 'Unsupported item' },
  { code: 'a004', display: 'Duplicate claim' },
] as const;
