import { InsurancePlan } from 'fhir/r4';

export function mapDbInsurancePlanToFHIR(dbData: any, policyNumber: string): InsurancePlan {
  const planType = mapPlanType(dbData?.planType);
  const insurancePlanType = mapInsurancePlanType(dbData?.insurancePlanType);

  const fhir: InsurancePlan = {
    resourceType: 'InsurancePlan',
    id: dbData?.id || `insurance-plan-${Date.now()}`,
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlan'],
      lastUpdated: new Date().toISOString(),
    },
    status: dbData?.status || 'active',
    name: dbData?.name || 'Health Insurance Plan',
    alias: Array.isArray(dbData?.aliases) ? dbData.aliases : undefined,
    type: [
      {
        coding: [
          {
            system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-insuranceplan-type',
            code: insurancePlanType,
            display: dbData?.insurancePlanType || 'Medical',
          },
        ],
        text: dbData?.insurancePlanType || 'Medical',
      } as any,
    ],
    plan: [
      {
        identifier: [
          {
            system: 'https://abcinsurance.com/policy',
            value: policyNumber,
          },
        ],
        type: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-plan-type',
              code: planType,
              display: dbData?.planType || 'Individual',
            },
          ],
          text: dbData?.planType || 'Individual',
        },
        generalCost: Array.isArray(dbData?.generalCosts)
          ? dbData.generalCosts.map((cost: any) => ({
              type: {
                coding: [
                  {
                    system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/cost-type',
                    code: 'premium',
                    display: 'Premium',
                  },
                ],
                text: 'Monthly Premium',
              },
              cost: {
                value: {
                  value: cost?.costAmount ?? 0,
                  unit: cost?.currency || 'INR',
                  system: 'http://unitsofmeasure.org',
                  code: cost?.currency || 'INR',
                } as any,
              },
              comment: cost?.comment,
            }))
          : undefined,
      },
    ],
    coverage: [
      {
        type: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-coverage-type',
              code: '00',
              display: 'In Patient Hospitalization',
            },
          ],
          text: 'Medical Coverage',
        },
        benefit: Array.isArray(dbData?.benefitTypes)
          ? dbData.benefitTypes.map((b: string) => createBenefitFromType(b))
          : undefined,
      },
    ],
  };

  return fhir;
}

export function createBenefitFromType(benefitType: string): any {
  const benefitConfig: Record<
    string,
    { code: string; limit: number; unit: string; requirement: string }
  > = {
    Consultation: {
      code: 'consultation',
      limit: 10,
      unit: 'visits',
      requirement: 'Valid prescription required',
    },
    Hospitalization: {
      code: 'hospitalization',
      limit: 500000,
      unit: 'INR',
      requirement: 'Minimum 24 hours hospital stay required',
    },
    'Day Care Treatment': {
      code: 'daycare',
      limit: 100000,
      unit: 'INR',
      requirement: 'Day care procedures as per policy',
    },
    Maternity: {
      code: 'maternity',
      limit: 100000,
      unit: 'INR',
      requirement: 'Maternity benefits as per policy terms',
    },
    'New Born': {
      code: 'newborn',
      limit: 50000,
      unit: 'INR',
      requirement: 'New born baby coverage',
    },
    Emergency: {
      code: 'emergency',
      limit: 200000,
      unit: 'INR',
      requirement: 'Emergency medical treatment',
    },
    ICU: { code: 'icu', limit: 300000, unit: 'INR', requirement: 'Intensive Care Unit treatment' },
    Ambulance: {
      code: 'ambulance',
      limit: 5000,
      unit: 'INR',
      requirement: 'Emergency ambulance services',
    },
    Medicine: {
      code: 'medicine',
      limit: 25000,
      unit: 'INR',
      requirement: 'Prescribed medicines coverage',
    },
    Diagnostics: {
      code: 'diagnostics',
      limit: 25000,
      unit: 'INR',
      requirement: 'Diagnostic tests and procedures',
    },
    Dental: { code: 'dental', limit: 15000, unit: 'INR', requirement: 'Dental treatment coverage' },
    Vision: { code: 'vision', limit: 10000, unit: 'INR', requirement: 'Vision care and eyewear' },
    'Mental Health': {
      code: 'mental-health',
      limit: 50000,
      unit: 'INR',
      requirement: 'Mental health treatment',
    },
    Other: { code: 'other', limit: 50000, unit: 'INR', requirement: 'Other medical expenses' },
  };
  const config = benefitConfig[benefitType] || benefitConfig['Other'];
  return {
    type: {
      coding: [
        {
          system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-benefit-type',
          code: config.code,
          display: benefitType,
        },
      ],
      text: benefitType,
    },
    requirement: config.requirement,
    limit: [
      {
        value: {
          value: config.limit,
          unit: config.unit,
          system: 'http://unitsofmeasure.org',
          code: config.unit === 'INR' ? 'INR' : config.unit,
        },
        code: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/benefit-limit-type',
              code: 'per-year',
              display: 'Per Year',
            },
          ],
        },
      },
    ],
  };
}

export function mapInsurancePlanType(type: string | undefined): string {
  const m: Record<string, string> = {
    'Hospitalisation Indemnity Policy': 'medical',
    'Hospital Cash Plan': 'medical',
    'Critical Illness Cover -Indemnity': 'medical',
    'Critical Illness Cover - Benefits': 'medical',
    'Out Patient Policy': 'medical',
    'Universal Health Policy': 'medical',
    'Micro insurance Policy': 'medical',
    'Package Policy (covering more than one type of health above)': 'medical',
    'Hybrid Policy (covering other than health also)': 'medical',
    'Mass policy': 'medical',
    'Any Other Product Type': 'medical',
  };
  return (type && m[type]) || 'medical';
}

export function mapPlanType(type: string | undefined): string {
  const m: Record<string, string> = {
    Individual: 'individual',
    'Individual Floater': 'individual',
    Group: 'group',
    'Group Floater': 'group',
    Declaration: 'individual',
    'Declaration Floater': 'individual',
    'Declaration with Group Organiser': 'group',
    'Declaration Floater with Group Organiser': 'group',
    'Any Other Cover Type': 'individual',
  };
  return (type && m[type]) || 'individual';
}
