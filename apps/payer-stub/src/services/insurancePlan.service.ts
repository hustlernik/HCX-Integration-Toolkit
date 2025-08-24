import { Bundle, Task, InsurancePlan } from 'fhir/r4';
import Policy from '../models/Policy';
import { logger } from '../utils/logger';
import { mapDbInsurancePlanToFHIR } from '../fhir/fhir-mapping';
import { buildInsurancePlanBundle } from '../fhir/fhir-bundle';

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
      logger.debug('svc.extractTaskInputs:start');
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
      logger.error('svc.extractTaskInputs:error', e);
      return null;
    }
  }

  /**
   * Fetch InsurancePlan resources for a policy and provider
   */
  async fetchInsurancePlans(policyNumber: string, providerId: string): Promise<InsurancePlan[]> {
    try {
      logger.info('svc.fetchInsurancePlans', { policyNumber, providerId });
      const policy = await Policy.findOne({ policyNumber }).populate('insurancePlan');
      if (!policy || !policy.insurancePlan) return [];
      const fhirPlan = mapDbInsurancePlanToFHIR(policy.insurancePlan, policy.policyNumber);
      return [fhirPlan];
    } catch (e) {
      logger.error('svc.fetchInsurancePlans:error', e);
      return [];
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
      logger.info('svc.processInsurancePlanRequest', { taskInputs, correlationId });
      const plans = await this.fetchInsurancePlans(taskInputs.policyNumber, taskInputs.providerId);
      const responseBundle = buildInsurancePlanBundle(plans);
      return { status: 'success', data: { responseBundle } };
    } catch (e) {
      logger.error('svc.processInsurancePlanRequest:error', e);
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
