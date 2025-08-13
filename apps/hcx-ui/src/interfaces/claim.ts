export interface AdjudicationType {
  category: string;
  reason?: string;
  amount?: {
    value: number;
    currency: string;
  };
  value?: number;
}

export interface ItemAdjudicationType {
  itemSequence: number;
  noteNumber?: number[];
  adjudication: AdjudicationType[];
}

export interface TotalType {
  category: string;
  amount: {
    value: number;
    currency: string;
  };
}

export interface ProcessNoteType {
  number?: number;
  type?: 'display' | 'print' | 'printoper';
  text: string;
}

export interface PaymentType {
  type: string;
  adjustment?: {
    value: number;
    currency: string;
  };
  adjustmentReason?: string;
  date?: string;
  amount: {
    value: number;
    currency: string;
  };
  identifier?: {
    system?: string;
    value: string;
  };
}

export interface AddItemType {
  itemSequence?: number[];
  detailSequence?: number[];
  subDetailSequence?: number[];
  provider?: string[];
  productOrService: string;
  modifier?: string[];
  programCode?: string[];
  servicedDate?: string;
  locationCodeableConcept?: string;
  quantity?: {
    value: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  unitPrice?: {
    value: number;
    currency: string;
  };
  factor?: number;
  net?: {
    value: number;
    currency: string;
  };
  bodySite?: string;
  subSite?: string[];
  noteNumber?: number[];
  adjudication: AdjudicationType[];
}

export interface InsuranceType {
  sequence: number;
  focal: boolean;
  coverage: {
    reference: string;
  };
  businessArrangement?: string;
  claimResponse?: {
    reference: string;
  };
}

export interface ErrorType {
  itemSequence?: number;
  detailSequence?: number;
  subDetailSequence?: number;
  code: string;
}

export interface ClaimResponseFormType {
  id?: string;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: string;
  subType?: string;
  use: 'claim' | 'preauthorization' | 'predetermination';
  patient: {
    reference: string;
    display?: string;
  };
  created: string;
  insurer: {
    reference: string;
    display?: string;
  };
  requestor?: {
    reference: string;
    display?: string;
  };
  request?: {
    reference: string;
  };
  outcome: 'queued' | 'complete' | 'error' | 'partial';
  disposition?: string;
  preAuthRef?: string;
  preAuthPeriod?: {
    start: string;
    end: string;
  };
  payeeType?: string;
  item?: ItemAdjudicationType[];
  addItem?: AddItemType[];
  adjudication?: AdjudicationType[];
  total?: TotalType[];
  payment?: PaymentType;
  fundsReserve?: string;
  formCode?: string;
  processNote?: ProcessNoteType[];
  communicationRequest?: {
    reference: string;
  }[];
  insurance?: InsuranceType[];
  error?: ErrorType[];
}

export interface ClaimAdjudicateFormProps {
  responseForm: ClaimResponseFormType;
  setResponseForm: React.Dispatch<React.SetStateAction<ClaimResponseFormType>>;
  responseSubmitting: boolean;
  handleResponseSubmit: (e: React.FormEvent) => void;
  setResponseAction: (action: 'approve' | 'reject' | 'query' | 'adjudicate' | null) => void;
  claimItems?: Array<{
    name?: string;
    category?: string;
    productOrService?: string;
    programCode?: string;
    quantity?: { value: number; unit?: string };
    unitPrice?: { value: number; currency: string };
    net?: { value: number; currency: string };
  }>;
}

export interface Patient {
  id: string;
  name: string;
  dob: Date | string;
  gender: string;
  identifier: string;
}

export interface Practitioner {
  id: string;
  name: string;
  qualification: string;
  identifier: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  contact: {
    phone: string;
    email: string;
  };
}

export interface Related {
  relatedClaimId: string;
  relationship: string;
}

export interface MedicationRequest {
  intent: string;
  medication: string[];
  reason: string[];
  dosageInstruction: Array<{
    text: string;
    additionalInstruction: string;
  }>;
}

export interface DeviceRequest {
  intent: string;
  priority: string;
  reason: string[];
  note: string;
  deviceRequested: string;
}

export interface VisionPrescription {
  lensSpecification: Array<{
    product: string;
    eye: 'right' | 'left';
    sphere: number;
    cylinder: number;
    axis: number;
    note: string;
    prism: Array<{
      amount: number;
      base: 'up' | 'down' | 'in' | 'out';
    }>;
    add: number;
    power: number;
    backCurve: number;
    diameter: number;
  }>;
}

export interface Prescription {
  medicationRequest?: MedicationRequest;
  deviceRequest?: DeviceRequest;
  visionPrescription?: VisionPrescription;
}

export interface SupportingInfo {
  category: string;
  code: string;
  reason: string;
}

export interface Diagnosis {
  diagnosis: string;
  onAdmission: string;
  type: string;
  packageCode: string;
}

export interface Procedure {
  type: string;
  procedure: string;
}

export interface Coverage {
  id: string;
  policyNumber: string;
  status: string;
  plan: string;
  payor: string;
}

export interface Item {
  revenue: string;
  category: string;
  productOrService: string;
  programCode: string;
  quantity: {
    value: number;
    unit: string;
    code: string;
  };
  unitPrice: {
    value: number;
    currency: string;
  };
  factor: number;
  net: {
    value: number;
    currency: string;
  };
  bodySite: string;
  subSite?: string[];
}

export interface Claim {
  _id: string;
  claimId: string;
  correlationId: string;
  fhirRefId: string;
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';
  type: string;
  subType?: string;
  use: 'claim' | 'preauthorization' | 'predetermination';
  patient: Patient;
  billablePeriod: {
    start: Date | string;
    end: Date | string;
  };
  created: Date | string;
  enterer: Practitioner;
  insurer: Organization;
  provider: Organization;
  priority: 'Immediate' | 'Normal' | 'Deferred';
  fundsReserve: 'Patient' | 'Provider' | 'None';
  related: Related[];
  prescription?: Prescription;
  originalPrescription?: Prescription;
  payee: Array<{
    type: string;
  }>;
  careTeam: Array<{
    isResponsible: boolean;
    role: string;
    qualification: string;
  }>;
  supportingInfo: SupportingInfo[];
  diagnosis: Diagnosis[];
  procedure: Procedure[];
  insurance: Array<{
    focal: boolean;
    coverage: Coverage;
  }>;
  item: Item[];
  total: {
    value: number;
    currency: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}
