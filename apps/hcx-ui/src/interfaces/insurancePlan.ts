export interface InsurancePlanForm {
  id?: string;
  insurancePlanType: string;
  name: string;
  aliases: string[];
  periodStart: string;
  periodEnd: string;
  ownedByOrgId: string;
  ownedByDisplay: string;
  administeredByOrgId: string;
  administeredByDisplay: string;
  coverageAreaIds: string[];
  contactPhones: string[];
  contactEmails: string[];
  networkOrgIds: string[];
  claimConditions: string[];
  supportingDocuments: string[];
  benefitTypes: string[];
  planType: string;
  generalCosts: Array<{
    comment: string;
    groupSize: number;
    costAmount: number;
    currency: string;
  }>;
  specificCosts: Array<{
    benefitCategory: string;
    benefitType: string;
    costAmount: number;
    currency: string;
  }>;
}
