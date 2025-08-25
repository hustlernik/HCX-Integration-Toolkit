import coverageEligibilityResponseInputSchema from '../schemas/Input/coverageEligibilityResponseInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class CoverageEligibilityResponse {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR CoverageEligibilityResponse resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR CoverageEligibilityResponse resource
   */

  createCoverageEligibilityResponse(input) {
    try {
      const { error, value } = coverageEligibilityResponseInputSchema.validate(input);
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
        error: 'CoverageEligibilityResponse creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR CoverageEligibilityResponse resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR CoverageEligibilityResponse resource
   */

  transformToFHIR(input) {
    const resource = {
      resourceType: 'CoverageEligibilityResponse',
    };

    if (input.language) {
      resource.language = input.language;
    }

    if (input.identifier && Array.isArray(input.identifier)) {
      resource.identifier = input.identifier
        .map((identifier, index) => {
          const transformed = this.datatypeUtils.transformIdentifier(identifier);

          if (identifier.id) {
            transformed.id = identifier.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (identifier.extension && Array.isArray(identifier.extension)) {
            transformed.extension = identifier.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          return transformed;
        })
        .filter(Boolean);
    }

    if (input.status) {
      resource.status = input.status;
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

    if (input.requestor) {
      resource.requestor = this.datatypeUtils.transformReference(input.requestor);
    }

    if (input.request) {
      resource.request = this.datatypeUtils.transformReference(input.request);
    }

    if (input.outcome) {
      resource.outcome = input.outcome;
    }

    if (input.disposition) {
      resource.disposition = input.disposition;
    }

    if (input.insurer) {
      resource.insurer = this.datatypeUtils.transformReference(input.insurer);
    }

    if (input.insurance && Array.isArray(input.insurance)) {
      resource.insurance = input.insurance.map((insurance) =>
        this.transformInsuranceToFHIR(insurance),
      );
    }

    if (input.preAuthRef) {
      resource.preAuthRef = input.preAuthRef;
    }

    if (input.form) {
      if (typeof input.form === 'string') {
        resource.form = this.datatypeUtils.transformCodeableConcept(input.form);
      } else {
        resource.form = this.datatypeUtils.transformCodeableConcept(input.form);
      }
    }

    if (input.error && Array.isArray(input.error)) {
      resource.error = input.error.map((error) => this.transformErrorToFHIR(error));
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
   * Transform insurance to FHIR format
   */
  transformInsuranceToFHIR(insurance) {
    const transformed = {
      coverage: this.datatypeUtils.transformReference(insurance.coverage),
    };

    if (insurance.inforce !== undefined) {
      transformed.inforce = insurance.inforce;
    }

    if (insurance.benefitPeriod) {
      transformed.benefitPeriod = this.datatypeUtils.transformPeriod(insurance.benefitPeriod);
    }

    if (insurance.item && Array.isArray(insurance.item)) {
      transformed.item = insurance.item.map((item) => this.transformItemToFHIR(item));
    }

    return transformed;
  }

  /**
   * Transform item to FHIR format
   */
  transformItemToFHIR(item) {
    const transformed = {};

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

    if (item.excluded !== undefined) {
      transformed.excluded = item.excluded;
    }

    if (item.name) {
      transformed.name = item.name;
    }

    if (item.description) {
      transformed.description = item.description;
    }

    if (item.network) {
      if (typeof item.network === 'string') {
        transformed.network = this.datatypeUtils.transformCodeableConcept(item.network);
      } else {
        transformed.network = this.datatypeUtils.transformCodeableConcept(item.network);
      }
    }

    if (item.unit) {
      if (typeof item.unit === 'string') {
        transformed.unit = this.datatypeUtils.transformCodeableConcept(item.unit);
      } else {
        transformed.unit = this.datatypeUtils.transformCodeableConcept(item.unit);
      }
    }

    if (item.term) {
      if (typeof item.term === 'string') {
        transformed.term = this.datatypeUtils.transformCodeableConcept(item.term);
      } else {
        transformed.term = this.datatypeUtils.transformCodeableConcept(item.term);
      }
    }

    if (item.benefit && Array.isArray(item.benefit)) {
      transformed.benefit = item.benefit.map((benefit) => this.transformBenefitToFHIR(benefit));
    }

    if (item.authorizationRequired !== undefined) {
      transformed.authorizationRequired = item.authorizationRequired;
    }

    if (item.authorizationSupporting && Array.isArray(item.authorizationSupporting)) {
      transformed.authorizationSupporting = item.authorizationSupporting.map((support) =>
        typeof support === 'string'
          ? this.datatypeUtils.transformCodeableConcept(support)
          : this.datatypeUtils.transformCodeableConcept(support),
      );
    }

    if (item.authorizationUrl) {
      transformed.authorizationUrl = item.authorizationUrl;
    }

    return transformed;
  }

  /**
   * Transform benefit to FHIR format
   */
  transformBenefitToFHIR(benefit) {
    const transformed = {};

    if (benefit.type) {
      if (typeof benefit.type === 'string') {
        transformed.type = this.datatypeUtils.transformCodeableConcept(benefit.type);
      } else {
        transformed.type = this.datatypeUtils.transformCodeableConcept(benefit.type);
      }
    }

    if (benefit.allowedUnsignedInt !== undefined) {
      transformed.allowedUnsignedInt = benefit.allowedUnsignedInt;
    }

    if (benefit.allowedString) {
      transformed.allowedString = benefit.allowedString;
    }

    if (benefit.allowedMoney) {
      transformed.allowedMoney = this.datatypeUtils.transformMoney(benefit.allowedMoney);
    }

    if (benefit.usedUnsignedInt !== undefined) {
      transformed.usedUnsignedInt = benefit.usedUnsignedInt;
    }

    if (benefit.usedString) {
      transformed.usedString = benefit.usedString;
    }

    if (benefit.usedMoney) {
      transformed.usedMoney = this.datatypeUtils.transformMoney(benefit.usedMoney);
    }

    return transformed;
  }

  /**
   * Transform error to FHIR format
   */
  transformErrorToFHIR(error) {
    const transformed = {};

    if (error.code) {
      if (typeof error.code === 'string') {
        transformed.code = this.datatypeUtils.transformCodeableConcept(error.code);
      } else {
        transformed.code = this.datatypeUtils.transformCodeableConcept(error.code);
      }
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

    if (resource.insurance && Array.isArray(resource.insurance)) {
      resource.insurance.forEach((insurance) => {
        if (insurance.item && Array.isArray(insurance.item)) {
          insurance.item.forEach((item) => {
            if (item.category && item.productOrService) {
              console.warn(
                'Item should contain either category or productOrService but not both (ces-1 constraint)',
              );
            }
          });
        }
      });
    }
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
    return this.datatypeUtils.generateShortUuid();
  }

  /**
   * Add system fields to the resource
   */
  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('CoverageEligibilityResponse');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityResponse'],
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
    // Build XHTML div attributes per W3C guidance
    let divAttributes = 'xmlns="http://www.w3.org/1999/xhtml"';
    if (resource.language) {
      divAttributes += ` lang="${resource.language}" xml:lang="${resource.language}"`;
    }
    let narrative = `<div ${divAttributes}>`;

    if (resource.status) {
      narrative += `<p><strong>Status:</strong> ${resource.status}</p>`;
    }

    if (resource.outcome) {
      narrative += `<p><strong>Outcome:</strong> ${resource.outcome}</p>`;
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

    if (resource.request && resource.request.reference) {
      narrative += `<p><strong>Request:</strong> ${resource.request.reference}</p>`;
    }

    if (resource.created) {
      narrative += `<p><strong>Created:</strong> ${resource.created}</p>`;
    }

    if (resource.disposition) {
      narrative += `<p><strong>Disposition:</strong> ${resource.disposition}</p>`;
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
    return coverageEligibilityResponseInputSchema;
  }
}

export default CoverageEligibilityResponse;
