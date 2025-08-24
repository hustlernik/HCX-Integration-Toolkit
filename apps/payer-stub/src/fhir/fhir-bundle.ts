import { Bundle, InsurancePlan } from 'fhir/r4';

export function buildInsurancePlanBundle(plans: InsurancePlan[]): Bundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    id: `ins-plan-bundle-${Date.now()}`,
    meta: {
      lastUpdated: new Date().toISOString(),
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlanBundle'],
    },
    entry: (plans || []).map((p) => ({ resource: p })),
  };
}
