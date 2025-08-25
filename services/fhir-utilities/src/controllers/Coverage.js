import coverageInputSchema, { validate } from '../schemas/Input/coverageInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class Coverage {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR Coverage resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR Coverage resource
   */
  createCoverage(input) {
    try {
      const { error, value } = validate(input);
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
        error: 'Coverage creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR Coverage resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR Coverage resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'Coverage',
    };

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

    if (input.type) {
      if (typeof input.type === 'string') {
        resource.type = this.datatypeUtils.transformCodeableConcept(input.type);
      } else {
        resource.type = this.datatypeUtils.transformCodeableConcept(input.type);
      }
    }

    if (input.subscriber) {
      resource.subscriber = this.datatypeUtils.transformReference(input.subscriber);
    }

    if (input.subscriberId) {
      resource.subscriberId = input.subscriberId;
    }

    if (input.beneficiary) {
      resource.beneficiary = this.datatypeUtils.transformReference(input.beneficiary);
    }

    if (input.dependent) {
      resource.dependent = input.dependent;
    }

    if (input.relationship) {
      if (typeof input.relationship === 'string') {
        resource.relationship = this.datatypeUtils.transformCodeableConcept(input.relationship);
      } else {
        resource.relationship = this.datatypeUtils.transformCodeableConcept(input.relationship);
      }
    }

    if (input.period) {
      resource.period = this.datatypeUtils.transformPeriod(input.period);
    }

    if (input.payor && Array.isArray(input.payor)) {
      resource.payor = input.payor
        .map((payor) => this.datatypeUtils.transformReference(payor))
        .filter(Boolean);
    }

    if (input.class && Array.isArray(input.class)) {
      resource.class = input.class
        .map((cls, index) => {
          const transformed = {
            type: cls.type ? this.datatypeUtils.transformCodeableConcept(cls.type) : undefined,
            value: cls.value,
            name: cls.name,
          };

          if (cls.id) {
            transformed.id = cls.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (cls.extension && Array.isArray(cls.extension)) {
            transformed.extension = cls.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (cls.modifierExtension && Array.isArray(cls.modifierExtension)) {
            transformed.modifierExtension = cls.modifierExtension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          Object.keys(transformed).forEach((key) => {
            if (transformed[key] === undefined) delete transformed[key];
          });

          return transformed;
        })
        .filter(Boolean);
    }

    if (input.order) {
      resource.order = input.order;
    }

    if (input.network) {
      resource.network = input.network;
    }

    if (input.costToBeneficiary && Array.isArray(input.costToBeneficiary)) {
      resource.costToBeneficiary = input.costToBeneficiary
        .map((cost, index) => {
          const transformed = {
            type: cost.type ? this.datatypeUtils.transformCodeableConcept(cost.type) : undefined,
            valueQuantity: cost.valueQuantity
              ? this.datatypeUtils.transformQuantity(cost.valueQuantity)
              : undefined,
            valueMoney: cost.valueMoney
              ? this.datatypeUtils.transformMoney(cost.valueMoney)
              : undefined,
          };

          if (cost.id) {
            transformed.id = cost.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (cost.extension && Array.isArray(cost.extension)) {
            transformed.extension = cost.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (cost.modifierExtension && Array.isArray(cost.modifierExtension)) {
            transformed.modifierExtension = cost.modifierExtension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (cost.exception && Array.isArray(cost.exception)) {
            transformed.exception = cost.exception
              .map((exception, excIndex) => {
                const excTransformed = {
                  type: exception.type
                    ? this.datatypeUtils.transformCodeableConcept(exception.type)
                    : undefined,
                  period: exception.period
                    ? this.datatypeUtils.transformPeriod(exception.period)
                    : undefined,
                };

                if (exception.id) {
                  excTransformed.id = exception.id;
                } else {
                  excTransformed.id = this.generateElementId();
                }

                if (exception.extension && Array.isArray(exception.extension)) {
                  excTransformed.extension = exception.extension
                    .map((ext) => this.datatypeUtils.transformExtension(ext))
                    .filter(Boolean);
                }

                if (exception.modifierExtension && Array.isArray(exception.modifierExtension)) {
                  excTransformed.modifierExtension = exception.modifierExtension
                    .map((ext) => this.datatypeUtils.transformExtension(ext))
                    .filter(Boolean);
                }

                Object.keys(excTransformed).forEach((key) => {
                  if (excTransformed[key] === undefined) delete excTransformed[key];
                });

                return excTransformed;
              })
              .filter(Boolean);
          }

          Object.keys(transformed).forEach((key) => {
            if (transformed[key] === undefined) delete transformed[key];
          });

          return transformed;
        })
        .filter(Boolean);
    }

    if (input.subrogation !== undefined) {
      resource.subrogation = input.subrogation;
    }

    if (input.contract && Array.isArray(input.contract)) {
      resource.contract = input.contract
        .map((contract) => this.datatypeUtils.transformReference(contract))
        .filter(Boolean);
    }

    if (input.extension && Array.isArray(input.extension)) {
      resource.extension = input.extension
        .map((extension) => this.datatypeUtils.transformExtension(extension))
        .filter(Boolean);
    }

    if (input.modifierExtension && Array.isArray(input.modifierExtension)) {
      resource.modifierExtension = input.modifierExtension
        .map((extension) => this.datatypeUtils.transformExtension(extension))
        .filter(Boolean);
    }

    return resource;
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
   * Remove empty elements to comply with ele-1 constraint
   * @param {Object} obj - Object to clean
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
      // Handle Date objects and other non-plain objects
      if (obj instanceof Date || obj.constructor !== Object) {
        return obj;
      }
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
   * Generate short UUID for element ID
   * @returns {string} - Short UUID (8 characters)
   */
  generateElementId() {
    return this.datatypeUtils.generateShortUuid();
  }

  /**
   * Generate narrative text for the resource
   * @param {Object} resource - FHIR resource
   * @returns {Object} - Narrative text object
   */
  generateNarrativeText(resource) {
    let narrative = 'Coverage for ';

    if (resource.beneficiary && resource.beneficiary.display) {
      narrative += resource.beneficiary.display;
    } else if (resource.beneficiary && resource.beneficiary.reference) {
      narrative += resource.beneficiary.reference;
    } else {
      narrative += 'beneficiary';
    }

    if (resource.status) {
      narrative += ` (${resource.status})`;
    }

    if (resource.type && resource.type.text) {
      narrative += ` - ${resource.type.text}`;
    }

    let divAttributes = 'xmlns="http://www.w3.org/1999/xhtml"';
    if (resource.language) {
      const normLang = String(resource.language).replace('_', '-');
      divAttributes += ` lang="${normLang}" xml:lang="${normLang}"`;
      const isRtl = /^(ar|he|fa|ur|ps|sd|ug|yi|dv|ks|ku|nqo|prs|ckb)(-|$)/i.test(normLang);
      if (isRtl) divAttributes += ' dir="rtl"';
    }

    return {
      status: 'generated',
      div: `<div ${divAttributes}>${narrative}</div>`,
    };
  }

  /**
   * Add system-generated fields to the resource
   * @param {Object} resource - FHIR resource
   * @returns {Object} - Resource with system fields
   */

  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('Coverage');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Coverage'],
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
   * Get the input schema for validation
   * @returns {Object} - Joi schema
   */
  getInputSchema() {
    return coverageInputSchema;
  }
}

export default Coverage;
