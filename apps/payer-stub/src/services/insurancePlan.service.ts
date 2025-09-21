import { Bundle, Task } from 'fhir/r4';
import Policy from '../models/Policy';
import { logger } from '../utils/logger';
import { buildInsurancePlanBundle } from '../fhir/taskBundle';
import axios from 'axios';

export interface TaskInputs {
  policyNumber: string;
  providerId: string;
}

export interface ProcessResult {
  status: 'success' | 'error';
  data?: { responseBundle: any };
  errorDetails?: { code: string; message: string; trace?: string };
}

export class InsurancePlanDomainService {
  /**
   * Extracts required inputs from Task bundle
   */
  static extractTaskInputs(bundle: Bundle): TaskInputs | null {
    try {
      logger.debug('extractTaskInputs:start');
      if (!bundle.entry || !Array.isArray(bundle.entry)) return null;
      let policyNumber = '';
      let providerId = '';
      for (const entry of bundle.entry) {
        if (entry.resource?.resourceType === 'Task') {
          const task = entry.resource as Task;
          if (Array.isArray(task.input)) {
            for (const input of task.input) {
              const code = input.type?.coding?.[0]?.code;
              if (input.valueString) {
                if (code === 'policyNumber') policyNumber = input.valueString;
                if (code === 'providerId') providerId = input.valueString;
              }
            }
          }
        }
      }
      if (!policyNumber || !providerId) return null;
      return { policyNumber, providerId };
    } catch (e) {
      logger.error('extractTaskInputs:error', e);
      return null;
    }
  }

  /**
   * Fetch InsurancePlan resources for a policy and provider
   */
  // async fetchInsurancePlans(policyNumber: string, providerId: string): Promise<InsurancePlan[]> {
  //   try {
  //     logger.info('fetchInsurancePlans', { policyNumber, providerId });
  //     const policy = await Policy.findOne({ policyNumber }).populate('insurancePlan');
  //     if (!policy || !policy.insurancePlan) return [];
  //     const fhirPlan = mapDbInsurancePlanToFHIR(policy.insurancePlan, policy.policyNumber);
  //     return [fhirPlan];
  //   } catch (e) {
  //     logger.error('fetchInsurancePlans:error', e);
  //     return [];
  //   }
  // }

  async fetchInsurancePlans(policyNumber: string, providerId: string) {
    try {
      logger.info('fetchInsurancePlans:start', { policyNumber, providerId });

      const policy = await Policy.findOne({ policyNumber }).populate('insurancePlan');
      if (!policy || !policy.insurancePlan) {
        logger.warn('fetchInsurancePlans:no-policy-or-plan-found', { policyNumber, providerId });
        return [];
      }

      const ip: any = policy.insurancePlan;

      const input: any = {
        resourceType: 'InsurancePlan',
        identifier: [
          {
            system: 'https://abcinsurance.com/policy',
            value: policy.policyNumber,
          },
        ],
        status: ip.status || 'active',
        type: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-insuranceplan-type',
              code: ip.insurancePlanType || 'Medical',
              display: ip.insurancePlanType || 'Medical',
            },
          ],
          text: ip.insurancePlanType || 'Medical',
        },
        name: ip.name || 'Health Insurance Plan',
        period: {
          start: policy.coverageStart ? new Date(policy.coverageStart).toISOString() : undefined,
          end: policy.coverageEnd ? new Date(policy.coverageEnd).toISOString() : undefined,
        },
        ownedBy: {
          reference: `Organization/${ip.ownedByOrgId || 'unknown-payer'}`,
          display: ip.ownedByDisplay || ip.ownedByOrgId || 'Payer Organization',
        },

        coverage: [
          {
            type: {
              coding: [
                {
                  system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-coverage-type',
                  code: ip.planType || '00',
                  display: ip.planType || 'In Patient Hospitalization',
                },
              ],
              text: ip.planType || 'In Patient Hospitalization',
            },
            benefit: (Array.isArray(ip.benefitTypes) && ip.benefitTypes.length > 0
              ? ip.benefitTypes
              : ['Hospitalization']
            ).map((b: string) => ({
              type: {
                coding: [
                  {
                    system: 'http://snomed.info/sct',
                    code: b[0] || '309904001',
                    display: b[0] || 'Hospitalization',
                  },
                ],
                text: b[0] || 'Hospitalization',
              },
            })),
          },
        ],
        plan: [
          {
            type: {
              coding: [
                {
                  system: 'https://nrces.in/ndhm/fhir/r4/CodeSystem/ndhm-coverage-type',
                  code: ip.planType || '00',
                  display: ip.planType || 'In Patient Hospitalization',
                },
              ],
              text: ip.planType || 'In Patient Hospitalization',
            },
            specificCost: (Array.isArray(ip.specificCosts) && ip.specificCosts.length > 0
              ? ip.specificCosts
              : [{ benefitCategory: 'General', benefitType: 'Hospitalization' }]
            ).map((sc: { benefitCategory: string; benefitType: string }) => ({
              category: {
                coding: [
                  {
                    system: 'http://example.org/benefit-category',
                    code: sc.benefitCategory,
                    display: sc.benefitCategory,
                  },
                ],
                text: sc.benefitCategory,
              },
              benefit: [
                {
                  type: {
                    coding: [
                      {
                        system: 'http://example.org/benefit-type',
                        code: sc.benefitType,
                        display: sc.benefitType,
                      },
                    ],
                    text: sc.benefitType,
                  },
                },
              ],
            })),
          },
        ],
      };

      console.log('input', input);
      const response = await axios.post('http://localhost:4002/api/insurance-plan', input, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Response data', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.log('Error', error);
      logger.error('fetchInsurancePlans:error', {
        policyNumber,
        providerId,
        message: error,
      });
      return error.details;
    }
  }

  /**
   * Domain-level processing for insurance plan request
   */
  async processInsurancePlanRequest(
    taskInputs: TaskInputs,
    correlationId: string,
  ): Promise<ProcessResult> {
    try {
      logger.info('processInsurancePlanRequest', { taskInputs, correlationId });
      const plans = await this.fetchInsurancePlans(taskInputs.policyNumber, taskInputs.providerId);
      const responseBundle = buildInsurancePlanBundle(plans);
      return { status: 'success', data: { responseBundle } };
    } catch (e) {
      logger.error('processInsurancePlanRequest:error', e);
      return {
        status: 'error',
        errorDetails: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process insurance plan request',
        },
      };
    }
  }
}
