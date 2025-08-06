export interface Beneficiary {
  _id: string;
  name: { first: string; last?: string; middle?: string };
  abhaId: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  dateOfBirth: string;
  phone?: string;
  email?: string;
  address?: {
    line?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  abhaAddress: string;
  isActive: boolean;
}

export interface InsurancePlan {
  _id: string;
  id: string;
  name: string;
  type: string;
  aliases?: string[];
  planType?: string;
  benefitTypes?: string[];
  periodStart?: string;
  periodEnd?: string;
  coverageAreaIds?: string[];
  networkOrgIds?: string[];
  claimConditions?: string[];
  supportingDocuments?: string[];
}

export interface Policy {
  _id: string;
  policyNumber: string;
  beneficiary: Beneficiary;
  insurancePlan: InsurancePlan;
  coverageStart: string;
  coverageEnd?: string;
  status: 'active' | 'cancelled' | 'expired' | 'draft' | 'entered-in-error';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyData {
  policyNumber?: string;
  beneficiary: string;
  insurancePlan: string;
  coverageStart: Date;
  coverageEnd?: Date;
  status: 'active' | 'cancelled' | 'expired' | 'draft' | 'entered-in-error';
}

export interface CreateBeneficiaryData {
  abhaId: string;
  name: {
    first: string;
    last?: string;
    middle?: string;
  };
  gender: 'male' | 'female' | 'other' | 'unknown';
  dateOfBirth: Date;
  phone?: string;
  email?: string;
  address?: {
    line?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  abhaAddress: string;
}
