import coverageEligibilityRequestInputSchema from '../schemas/Input/coverageEligibilityRequestInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class CoverageEligibilityRequest {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR CoverageEligibilityRequest resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR CoverageEligibilityRequest resource
   */

  createCoverageEligibilityRequest(input) {
    try {
      const { error, value } = coverageEligibilityRequestInputSchema.validate(input);
      if (error) {
        return {
          success: false,
          error: 'Validation failed',
          details: error.details.map((d) => d.message),
        };
      }

      const fhirResource = this.transformToFHIR(value);

      this.ensureFHIRConstraints(fhirResource);

      const cleanedResource = this.removeEmptyElements(fhirResource);

      const finalResource = this.addSystemFields(cleanedResource);

      return {
        success: true,
        data: finalResource,
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        error: 'CoverageEligibilityRequest creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR CoverageEligibilityRequest resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR CoverageEligibilityRequest resource
   */

  transformToFHIR(input) {
    const resource = {
      resourceType: 'CoverageEligibilityRequest',
    };

    if (input.language) {
      resource.language = input.language;
    }

    if (input.identifier) {
      resource.identifier = this.datatypeUtils.transformIdentifier(input.identifier);
    }

    if (input.status) {
      resource.status = input.status;
    }

    if (input.priority) {
      if (typeof input.priority === 'string') {
        resource.priority = this.datatypeUtils.transformCodeableConcept(input.priority);
      } else {
        resource.priority = this.datatypeUtils.transformCodeableConcept(input.priority);
      }
    }

    if (input.purpose && Array.isArray(input.purpose)) {
      resource.purpose = input.purpose;
    }

    if (input.patient) {
      resource.patient = this.datatypeUtils.transformReference(input.patient);
    }

    if (input.servicedDate) {
      resource.servicedDate = input.servicedDate;
    }

    if (input.servicedPeriod) {
      resource.servicedPeriod = this.datatypeUtils.transformPeriod(input.servicedPeriod);
    }

    resource.created = input.created || new Date().toISOString();

    if (input.enterer) {
      resource.enterer = this.datatypeUtils.transformReference(input.enterer);
    }

    if (input.provider) {
      resource.provider = this.datatypeUtils.transformReference(input.provider);
    }

    if (input.insurer) {
      resource.insurer = this.datatypeUtils.transformReference(input.insurer);
    }

    if (input.facility) {
      resource.facility = this.datatypeUtils.transformReference(input.facility);
    }

    if (input.supportingInfo && Array.isArray(input.supportingInfo)) {
      resource.supportingInfo = input.supportingInfo.map((info) =>
        this.transformSupportingInfoToFHIR(info),
      );
    }

    if (input.insurance && Array.isArray(input.insurance)) {
      resource.insurance = input.insurance.map((insurance) =>
        this.transformInsuranceToFHIR(insurance),
      );
    }

    if (input.item && Array.isArray(input.item)) {
      resource.item = input.item.map((item) => this.transformItemToFHIR(item));
    }

    if (input.extension && Array.isArray(input.extension)) {
      resource.extension = input.extension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    if (input.modifierExtension && Array.isArray(input.modifierExtension)) {
      resource.modifierExtension = input.modifierExtension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    return resource;
  }

  /**
   * Transform supporting info to FHIR format
   */

  transformSupportingInfoToFHIR(info) {
    const transformed = {
      sequence: info.sequence,
      information: this.datatypeUtils.transformReference(info.information),
    };

    if (info.appliesToAll !== undefined) {
      transformed.appliesToAll = info.appliesToAll;
    }

    return transformed;
  }

  /**
   * Transform insurance to FHIR format
   */
  transformInsuranceToFHIR(insurance) {
    const transformed = {
      coverage: this.datatypeUtils.transformReference(insurance.coverage),
    };

    if (insurance.focal !== undefined) {
      transformed.focal = insurance.focal;
    }

    if (insurance.businessArrangement) {
      transformed.businessArrangement = insurance.businessArrangement;
    }

    return transformed;
  }

  /**
   * Transform item to FHIR format
   */
  transformItemToFHIR(item) {
    const transformed = {};

    if (item.supportingInfoSequence && Array.isArray(item.supportingInfoSequence)) {
      transformed.supportingInfoSequence = item.supportingInfoSequence;
    }

    if (item.category) {
      if (typeof item.category === 'string') {
        transformed.category = this.datatypeUtils.transformCodeableConcept(item.category);
      } else {
        transformed.category = this.datatypeUtils.transformCodeableConcept(item.category);
      }
    }

    if (item.productOrService) {
      if (typeof item.productOrService === 'string') {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          item.productOrService,
        );
      } else {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          item.productOrService,
        );
      }
    }

    if (item.modifier && Array.isArray(item.modifier)) {
      transformed.modifier = item.modifier.map((mod) =>
        typeof mod === 'string'
          ? this.datatypeUtils.transformCodeableConcept(mod)
          : this.datatypeUtils.transformCodeableConcept(mod),
      );
    }

    if (item.provider) {
      transformed.provider = this.datatypeUtils.transformReference(item.provider);
    }

    if (item.quantity) {
      transformed.quantity = this.datatypeUtils.transformQuantity(item.quantity);
    }

    if (item.unitPrice) {
      transformed.unitPrice = this.datatypeUtils.transformMoney(item.unitPrice);
    }

    if (item.facility) {
      transformed.facility = this.datatypeUtils.transformReference(item.facility);
    }

    if (item.diagnosis && Array.isArray(item.diagnosis)) {
      transformed.diagnosis = item.diagnosis.map((diagnosis) =>
        this.transformDiagnosisToFHIR(diagnosis),
      );
    }

    if (item.detail && Array.isArray(item.detail)) {
      transformed.detail = item.detail.map((ref) => this.datatypeUtils.transformReference(ref));
    }

    return transformed;
  }

  /**
   * Transform diagnosis to FHIR format
   */
  transformDiagnosisToFHIR(diagnosis) {
    const transformed = {};

    if (diagnosis.diagnosisCodeableConcept) {
      if (typeof diagnosis.diagnosisCodeableConcept === 'string') {
        transformed.diagnosisCodeableConcept = this.datatypeUtils.transformCodeableConcept(
          diagnosis.diagnosisCodeableConcept,
        );
      } else {
        transformed.diagnosisCodeableConcept = this.datatypeUtils.transformCodeableConcept(
          diagnosis.diagnosisCodeableConcept,
        );
      }
    }

    if (diagnosis.diagnosisReference) {
      transformed.diagnosisReference = this.datatypeUtils.transformReference(
        diagnosis.diagnosisReference,
      );
    }

    return transformed;
  }

  /**
   * Ensure FHIR constraints are met in the resource
   * @param {Object} resource - FHIR resource
   */
  ensureFHIRConstraints(resource) {
    this.removeEmptyElements(resource);
    this.validateExtensions(resource);
  }

  /**
   * Remove empty elements from the resource
   */
  removeEmptyElements(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.removeEmptyElements(item))
        .filter((item) => item !== null && item !== undefined);
    }

    if (typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = this.removeEmptyElements(value);
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return Object.keys(cleaned).length > 0 ? cleaned : null;
    }

    return obj;
  }

  /**
   * Validate extensions to comply with ext-1 constraint
   * @param {Object} obj - Object to validate
   */
  validateExtensions(obj) {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      if (key === 'extension' && Array.isArray(value)) {
        value.forEach((ext) => {
          if (ext.extension && ext.extension.length > 0) {
            const hasValue = Object.keys(ext).some(
              (k) => k.startsWith('value') && ext[k] !== undefined,
            );
            if (hasValue) {
              console.warn(
                'Extension has both extensions and value[x] - removing extensions to comply with ext-1',
              );
              delete ext.extension;
            }
          }
        });
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        this.validateExtensions(value);
      }
    }
  }

  /**
   * Generate a unique element ID
   */
  generateElementId() {
    return 'element-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Add system fields to the resource
   */
  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('CoverageEligibilityRequest');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityRequest'],
    });
    const text = this.generateNarrativeText(resource);

    return {
      resourceType: resource.resourceType,
      id: id,
      meta: meta,
      text: text,
      ...resource,
    };
  }

  /**
   * Generate narrative text for the resource
   */
  generateNarrativeText(resource) {
    let divAttributes = 'xmlns="http://www.w3.org/1999/xhtml"';
    if (resource.language) {
      const normLang = String(resource.language).replace('_', '-');
      divAttributes += ` lang=\"${normLang}\" xml:lang=\"${normLang}\"`;
      const isRtl = /^(ar|he|fa|ur|ps|sd|ug|yi|dv|ks|ku|nqo|prs|ckb)(-|$)/i.test(normLang);
      if (isRtl) divAttributes += ' dir=\"rtl\"';
    }
    let narrative = `<div ${divAttributes}>`;

    if (resource.status) {
      narrative += `<p><strong>Status:</strong> ${resource.status}</p>`;
    }

    if (resource.purpose && Array.isArray(resource.purpose)) {
      narrative += `<p><strong>Purpose:</strong> ${resource.purpose.join(', ')}</p>`;
    }

    if (resource.patient && resource.patient.reference) {
      narrative += `<p><strong>Patient:</strong> ${resource.patient.reference}</p>`;
    }

    if (resource.insurer && resource.insurer.reference) {
      narrative += `<p><strong>Insurer:</strong> ${resource.insurer.reference}</p>`;
    }

    if (resource.provider && resource.provider.reference) {
      narrative += `<p><strong>Provider:</strong> ${resource.provider.reference}</p>`;
    }

    if (resource.created) {
      narrative += `<p><strong>Created:</strong> ${resource.created}</p>`;
    }

    narrative += `</div>`;

    return {
      status: 'generated',
      div: narrative,
    };
  }

  /**
   * Get the input schema
   */
  getInputSchema() {
    return coverageEligibilityRequestInputSchema;
  }
}

export default CoverageEligibilityRequest;
