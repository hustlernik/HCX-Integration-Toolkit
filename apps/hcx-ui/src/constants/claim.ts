export const CLAIM_RESPONSE_STATUS = [
  { code: 'active', display: 'Active' },
  { code: 'cancelled', display: 'Cancelled' },
  { code: 'draft', display: 'Draft' },
  { code: 'entered-in-error', display: 'Entered in Error' },
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
  { code: 'claim', display: 'Claim' },
  { code: 'preauthorization', display: 'Pre-authorization' },
  { code: 'predetermination', display: 'Pre-determination' },
] as const;

export const OUTCOME_CODES = [
  { code: 'queued', display: 'Queued' },
  { code: 'complete', display: 'Processing Complete' },
  { code: 'error', display: 'Error' },
  { code: 'partial', display: 'Partial Processing' },
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
  { code: 'display', display: 'Display' },
  { code: 'print', display: 'Print' },
  { code: 'printoper', display: 'Print Operator' },
] as const;

export const ERROR_CODES = [
  { code: 'a001', display: 'Missing information' },
  { code: 'a002', display: 'Invalid coding' },
  { code: 'a003', display: 'Unsupported item' },
  { code: 'a004', display: 'Duplicate claim' },
] as const;
