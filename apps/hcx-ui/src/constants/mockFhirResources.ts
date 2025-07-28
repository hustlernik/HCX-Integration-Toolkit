export const mockFhirResources = {
  'coverage-eligibility': [
    {
      name: 'NRCE Example - Rajesh Kumar Sharma',
      resource: {
        resourceType: 'CoverageEligibilityRequest',
        id: 'mock-eligibility-001',
        status: 'active',
        patient: {
          reference: 'Patient/patient-001',
          display: 'Rajesh Kumar Sharma',
        },
        insurer: {
          reference: 'Organization/insurer-org',
          display: 'Star Health Insurance',
        },
        provider: {
          reference: 'Organization/provider-org',
          display: 'Apollo Hospitals',
        },
        created: '2025-01-15T10:00:00Z',
        purpose: ['validation'],
        insurance: [
          {
            focal: true,
            coverage: {
              reference: 'Coverage/coverage-001',
            },
          },
        ],
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityRequest'],
        },
      },
    },
  ],
  preauth: [
    {
      name: 'NRCE Example - Preauth',
      resource: {
        resourceType: 'Claim',
        id: 'preauth-001',
        status: 'active',
        use: 'preauthorization',
        patient: {
          reference: 'Patient/patient-001',
          display: 'Rajesh Kumar Sharma',
        },
        created: '2025-01-15T10:00:00Z',
        insurer: {
          reference: 'Organization/insurer-org',
          display: 'Star Health Insurance',
        },
        provider: {
          reference: 'Organization/provider-org',
          display: 'Apollo Hospitals',
        },
        priority: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/claim-priority',
              code: 'normal',
              display: 'Normal',
            },
          ],
        },
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim'],
        },
      },
    },
  ],
  claim: [
    {
      name: 'NRCE Example - Rajesh Kumar Sharma',
      resource: {
        resourceType: 'Claim',
        id: 'claim-actual-001',
        identifier: [
          {
            system: 'https://nrces.in/ndhm/fhir/r4/NamingSystem/claim-identifier',
            value: 'CLM-2025-003',
          },
        ],
        status: 'active',
        use: 'claim',
        patient: {
          reference: 'Patient/patient-001',
          display: 'Rajesh Kumar Sharma',
        },
        billablePeriod: {
          start: '2025-01-15',
          end: '2025-01-20',
        },
        created: '2025-01-21T10:00:00Z',
        insurer: {
          reference: 'Organization/insurer-org',
          display: 'Star Health Insurance',
        },
        provider: {
          reference: 'Organization/provider-org',
          display: 'Apollo Hospitals',
        },
        facility: {
          reference: 'Location/facility-001',
          display: 'Apollo Hospitals - Main Campus',
        },
        priority: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/claim-priority',
              code: 'normal',
              display: 'Normal',
            },
          ],
        },
        fundsReserve: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/funds-reserve',
              code: 'patient',
              display: 'Patient',
            },
          ],
        },
        related: [
          {
            claim: {
              reference: 'Claim/claim-preauth-001',
            },
            relationship: {
              coding: [
                {
                  system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/claim-relationship',
                  code: 'prior',
                  display: 'Prior Claim',
                },
              ],
            },
          },
        ],
        prescription: {
          reference: 'MedicationRequest/prescription-001',
        },
        originalPrescription: {
          reference: 'MedicationRequest/prescription-001',
        },
        payee: {
          type: {
            coding: [
              {
                system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/payee-type',
                code: 'provider',
                display: 'Provider',
              },
            ],
          },
          party: {
            reference: 'Organization/provider-org',
            display: 'Apollo Hospitals',
          },
        },
        referral: {
          reference: 'ServiceRequest/referral-001',
        },
        careTeam: [
          {
            sequence: 1,
            provider: {
              reference: 'Practitioner/practitioner-001',
              display: 'Dr. Suresh Mehta',
            },
            role: {
              coding: [
                {
                  system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/claim-careteamrole',
                  code: 'primary',
                  display: 'Primary Provider',
                },
              ],
            },
            responsible: true,
          },
        ],
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim'],
        },
      },
    },
  ],
  'payment-notice': [
    {
      name: 'NRCE Example - Payment Notice',
      resource: {
        resourceType: 'PaymentNotice',
        id: 'payment-notice-001',
        status: 'active',
        request: {
          reference: 'Claim/claim-actual-001',
        },
        response: {
          reference: 'ClaimResponse/claim-response-001',
        },
        created: '2025-01-22T10:00:00Z',
        provider: {
          reference: 'Organization/provider-org',
          display: 'Apollo Hospitals',
        },
        payment: {
          reference: 'PaymentReconciliation/payment-recon-001',
        },
        paymentDate: '2025-01-23',
        amount: {
          value: 10000,
          currency: 'INR',
        },
        payee: {
          reference: 'Organization/provider-org',
          display: 'Apollo Hospitals',
        },
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/PaymentNotice'],
        },
      },
    },
  ],
  predetermination: [
    {
      name: 'NRCE Example - Predetermination',
      resource: {
        resourceType: 'Claim',
        id: 'predetermination-001',
        status: 'active',
        use: 'predetermination',
        patient: {
          reference: 'Patient/patient-001',
          display: 'Rajesh Kumar Sharma',
        },
        created: '2025-01-15T10:00:00Z',
        insurer: {
          reference: 'Organization/insurer-org',
          display: 'Star Health Insurance',
        },
        provider: {
          reference: 'Organization/provider-org',
          display: 'Apollo Hospitals',
        },
        priority: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/claim-priority',
              code: 'normal',
              display: 'Normal',
            },
          ],
        },
        meta: {
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim'],
        },
      },
    },
  ],
  'insurance-plan': [
    {
      name: 'Insurance Plan Request Bundle',
      resource: {
        identifier: {
          system: 'https://dummypayer.com/',
          value: '75b1340f-bfe7-4856-ae4e-3d0f06e2a8cc',
        },
        entry: [
          {
            resource: {
              input: [
                {
                  valueString: '100217',
                  id: 'PolicyNumber',
                  type: {
                    coding: [
                      {
                        system:
                          'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code',
                        code: 'policyNumber',
                        display: 'PolicyNumber',
                      },
                    ],
                  },
                },
                {
                  valueString: '32722',
                  id: 'ProviderId',
                  type: {
                    coding: [
                      {
                        system:
                          'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-task-input-type-code',
                        code: 'providerId',
                        display: 'ProviderId',
                      },
                    ],
                  },
                },
              ],
              meta: {
                lastUpdated: '2024-08-09T16:48:54.340+05:30',
                versionId: '1',
                profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Task'],
              },
              id: '75b1340f-bfe7-4856-ae4e-3d0f06e2a8cc',
              text: {
                div: '<div xmlns="http://www.w3.org/1999/xhtml">Insurance Plan.</div>',
                status: 'generated',
              },
              intent: 'plan',
              resourceType: 'Task',
              status: 'requested',
            },
            fullUrl: 'urn:uuid:75b1340f-bfe7-4856-ae4e-3d0f06e2a8cc',
          },
        ],
        meta: {
          versionId: '1',
          security: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
              code: 'V',
              display: 'very restricted',
            },
          ],
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/TaskBundle'],
        },
        id: '75b1340f-bfe7-4856-ae4e-3d0f06e2a8cc',
        type: 'collection',
        resourceType: 'Bundle',
      },
    },
  ],
};
