import { randomUUID } from 'crypto';

export function buildInsurancePlanBundle(insurancePlan: any, bundleId?: string): any {
  if (!insurancePlan || insurancePlan.resourceType !== 'InsurancePlan') {
    throw new Error('Invalid InsurancePlan resource provided');
  }

  const insurancePlanId = insurancePlan.id || randomUUID();
  const bundleIdentifier = bundleId || randomUUID();
  const now = new Date().toISOString();

  return {
    resourceType: 'Bundle',
    id: bundleIdentifier,
    meta: {
      lastUpdated: now,
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode',
        },
      ],
    },
    identifier: {
      system: 'https://payer.nha.gov.in',
      value: bundleIdentifier,
    },
    type: 'collection',
    timestamp: now,
    entry: [
      {
        fullUrl: `urn:uuid:${insurancePlanId}`,
        resource: {
          ...insurancePlan,
          id: insurancePlanId,
        },
      },
    ],
  };
}
