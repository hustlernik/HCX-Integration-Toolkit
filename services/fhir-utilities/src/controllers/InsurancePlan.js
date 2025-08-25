import insurancePlanInputSchema from '../schemas/Input/insurancePlanInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class InsurancePlan {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR InsurancePlan resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR InsurancePlan resource
   */

  createInsurancePlan(input) {
    try {
      const { error, value } = insurancePlanInputSchema.validate(input);
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
        error: 'InsurancePlan creation failed',
        warnings: [],
      };
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
   * Transform input data to FHIR InsurancePlan resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR InsurancePlan resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'InsurancePlan',
    };

    if (input.implicitRules) {
      resource.implicitRules = input.implicitRules;
    }

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

    if (input.type) {
      if (typeof input.type === 'string') {
        resource.type = this.datatypeUtils.transformCodeableConcept(input.type);
      } else {
        resource.type = this.datatypeUtils.transformCodeableConcept(input.type);
      }
    }

    if (input.name) {
      resource.name = input.name;
    }

    if (input.alias && Array.isArray(input.alias)) {
      resource.alias = input.alias;
    }

    if (input.period) {
      resource.period = this.datatypeUtils.transformPeriod(input.period);
    }

    if (input.ownedBy) {
      resource.ownedBy = this.datatypeUtils.transformReference(input.ownedBy);
    }

    if (input.administeredBy) {
      resource.administeredBy = this.datatypeUtils.transformReference(input.administeredBy);
    }

    if (input.coverageArea && Array.isArray(input.coverageArea)) {
      resource.coverageArea = input.coverageArea
        .map((area) => this.datatypeUtils.transformReference(area))
        .filter(Boolean);
    }

    if (input.contact && Array.isArray(input.contact)) {
      resource.contact = input.contact
        .map((contact, index) => {
          const transformed = this.datatypeUtils.transformContact(contact);

          if (contact.id) {
            transformed.id = contact.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (contact.extension && Array.isArray(contact.extension)) {
            transformed.extension = contact.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (contact.modifierExtension && Array.isArray(contact.modifierExtension)) {
            transformed.modifierExtension = contact.modifierExtension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          return transformed;
        })
        .filter(Boolean);
    }

    if (input.network && Array.isArray(input.network)) {
      resource.network = input.network
        .map((network) => this.datatypeUtils.transformReference(network))
        .filter(Boolean);
    }

    if (input.endpoint && Array.isArray(input.endpoint)) {
      resource.endpoint = input.endpoint
        .map((endpoint) => this.datatypeUtils.transformReference(endpoint))
        .filter(Boolean);
    }

    if (input.coverage && Array.isArray(input.coverage)) {
      resource.coverage = input.coverage
        .map((coverage, index) => {
          const transformed = {
            type: this.datatypeUtils.transformCodeableConcept(coverage.type),
          };

          if (coverage.id) {
            transformed.id = coverage.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (coverage.extension && Array.isArray(coverage.extension)) {
            transformed.extension = coverage.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (coverage.modifierExtension && Array.isArray(coverage.modifierExtension)) {
            transformed.modifierExtension = coverage.modifierExtension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (coverage.network && Array.isArray(coverage.network)) {
            transformed.network = coverage.network
              .map((network) => this.datatypeUtils.transformReference(network))
              .filter(Boolean);
          }

          if (coverage.benefit && Array.isArray(coverage.benefit)) {
            transformed.benefit = coverage.benefit
              .map((benefit, benefitIndex) => {
                const benefitTransformed = {
                  type: this.datatypeUtils.transformCodeableConcept(benefit.type),
                };

                if (benefit.id) {
                  benefitTransformed.id = benefit.id;
                } else {
                  benefitTransformed.id = this.generateElementId();
                }

                if (benefit.extension && Array.isArray(benefit.extension)) {
                  benefitTransformed.extension = benefit.extension
                    .map((ext) => this.datatypeUtils.transformExtension(ext))
                    .filter(Boolean);
                }

                if (benefit.modifierExtension && Array.isArray(benefit.modifierExtension)) {
                  benefitTransformed.modifierExtension = benefit.modifierExtension
                    .map((ext) => this.datatypeUtils.transformExtension(ext))
                    .filter(Boolean);
                }

                return benefitTransformed;
              })
              .filter(Boolean);
          }

          return transformed;
        })
        .filter(Boolean);
    }

    if (input.plan && Array.isArray(input.plan)) {
      resource.plan = input.plan
        .map((plan, planIndex) => {
          const transformed = {};

          if (plan.id) {
            transformed.id = plan.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (plan.extension && Array.isArray(plan.extension)) {
            transformed.extension = plan.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (plan.modifierExtension && Array.isArray(plan.modifierExtension)) {
            transformed.modifierExtension = plan.modifierExtension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (plan.identifier && Array.isArray(plan.identifier)) {
            transformed.identifier = plan.identifier
              .map((identifier, index) => {
                const identifierTransformed = this.datatypeUtils.transformIdentifier(identifier);

                if (identifier.id) {
                  identifierTransformed.id = identifier.id;
                } else {
                  identifierTransformed.id = this.generateElementId();
                }

                return identifierTransformed;
              })
              .filter(Boolean);
          }

          if (plan.type) {
            if (typeof plan.type === 'string') {
              transformed.type = this.datatypeUtils.transformCodeableConcept(plan.type);
            } else {
              transformed.type = this.datatypeUtils.transformCodeableConcept(plan.type);
            }
          }

          if (plan.coverageArea && Array.isArray(plan.coverageArea)) {
            transformed.coverageArea = plan.coverageArea
              .map((area) => this.datatypeUtils.transformReference(area))
              .filter(Boolean);
          }

          if (plan.network && Array.isArray(plan.network)) {
            transformed.network = plan.network
              .map((network) => this.datatypeUtils.transformReference(network))
              .filter(Boolean);
          }

          if (plan.generalCost && Array.isArray(plan.generalCost)) {
            transformed.generalCost = plan.generalCost
              .map((cost, costIndex) => {
                const costTransformed = {};

                if (cost.id) {
                  costTransformed.id = cost.id;
                } else {
                  costTransformed.id = this.generateElementId();
                }

                if (cost.modifierExtension && Array.isArray(cost.modifierExtension)) {
                  costTransformed.modifierExtension = cost.modifierExtension
                    .map((ext) => this.datatypeUtils.transformExtension(ext))
                    .filter(Boolean);
                }

                if (cost.type) {
                  costTransformed.type = this.datatypeUtils.transformCodeableConcept(cost.type);
                }

                if (cost.groupSize !== undefined) {
                  costTransformed.groupSize = cost.groupSize;
                }

                if (cost.cost) {
                  costTransformed.cost = this.datatypeUtils.transformQuantity(cost.cost);
                }

                if (cost.comment) {
                  costTransformed.comment = cost.comment;
                }

                return costTransformed;
              })
              .filter(Boolean);
          }

          if (plan.specificCost && Array.isArray(plan.specificCost)) {
            transformed.specificCost = plan.specificCost
              .map((specificCost, specificCostIndex) => {
                const specificCostTransformed = {
                  category: this.datatypeUtils.transformCodeableConcept(specificCost.category),
                };

                if (specificCost.id) {
                  specificCostTransformed.id = specificCost.id;
                } else {
                  specificCostTransformed.id = this.generateElementId();
                }

                if (
                  specificCost.modifierExtension &&
                  Array.isArray(specificCost.modifierExtension)
                ) {
                  specificCostTransformed.modifierExtension = specificCost.modifierExtension
                    .map((ext) => this.datatypeUtils.transformExtension(ext))
                    .filter(Boolean);
                }

                if (specificCost.benefit && Array.isArray(specificCost.benefit)) {
                  specificCostTransformed.benefit = specificCost.benefit
                    .map((benefit, benefitIndex) => {
                      const benefitTransformed = {};

                      if (benefit.id) {
                        benefitTransformed.id = benefit.id;
                      } else {
                        benefitTransformed.id = this.generateElementId();
                      }

                      if (benefit.modifierExtension && Array.isArray(benefit.modifierExtension)) {
                        benefitTransformed.modifierExtension = benefit.modifierExtension
                          .map((ext) => this.datatypeUtils.transformExtension(ext))
                          .filter(Boolean);
                      }

                      if (benefit.type) {
                        if (typeof benefit.type === 'string') {
                          benefitTransformed.type = this.datatypeUtils.transformCodeableConcept(
                            benefit.type,
                          );
                        } else {
                          benefitTransformed.type = this.datatypeUtils.transformCodeableConcept(
                            benefit.type,
                          );
                        }
                      }

                      if (benefit.cost && Array.isArray(benefit.cost)) {
                        benefitTransformed.cost = benefit.cost
                          .map((cost, costIndex) => {
                            const costTransformed = {};

                            if (cost.id) {
                              costTransformed.id = cost.id;
                            } else {
                              costTransformed.id = this.generateElementId();
                            }

                            if (cost.type) {
                              costTransformed.type = this.datatypeUtils.transformCodeableConcept(
                                cost.type,
                              );
                            }

                            if (cost.applicability) {
                              if (typeof cost.applicability === 'string') {
                                costTransformed.applicability =
                                  this.datatypeUtils.transformCodeableConcept(cost.applicability);
                              } else {
                                costTransformed.applicability =
                                  this.datatypeUtils.transformCodeableConcept(cost.applicability);
                              }
                            }

                            if (cost.qualifiers && Array.isArray(cost.qualifiers)) {
                              costTransformed.qualifiers = cost.qualifiers
                                .map((qualifier) =>
                                  this.datatypeUtils.transformCodeableConcept(qualifier),
                                )
                                .filter(Boolean);
                            }

                            if (cost.value) {
                              costTransformed.value = this.datatypeUtils.transformQuantity(
                                cost.value,
                              );
                            }

                            return costTransformed;
                          })
                          .filter(Boolean);
                      }

                      return benefitTransformed;
                    })
                    .filter(Boolean);
                }

                return specificCostTransformed;
              })
              .filter(Boolean);
          }

          return transformed;
        })
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

    this.ensureFHIRConstraints(resource);

    return this.removeEmptyElements(resource);
  }

  /**
   * Ensure FHIR constraints are met in the resource
   * @param {Object} resource - FHIR resource
   */
  ensureFHIRConstraints(resource) {
    this.removeEmptyElements(resource);
    this.validateExtensions(resource);

    const hasIdentifier =
      resource.identifier && Array.isArray(resource.identifier) && resource.identifier.length > 0;
    const hasName = resource.name && resource.name.trim().length > 0;

    if (!hasIdentifier && !hasName) {
      throw new Error('InsurancePlan must have at least one identifier or name (ipn-1 constraint)');
    }
  }

  /**
   * Remove empty elements from resource
   * @param {Object} resource - FHIR resource
   * @returns {Object} - Cleaned resource
   */
  removeEmptyElements(resource) {
    const cleaned = {};
    for (const [key, value] of Object.entries(resource)) {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === 'object' && Object.keys(value).length === 0)
      ) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedNested = this.removeEmptyElements(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else if (Array.isArray(value)) {
          const cleanedArray = value
            .map((item) => (typeof item === 'object' ? this.removeEmptyElements(item) : item))
            .filter(
              (item) =>
                item !== null &&
                item !== undefined &&
                item !== '' &&
                !(typeof item === 'object' && Object.keys(item).length === 0),
            );
          if (cleanedArray.length > 0) {
            cleaned[key] = cleanedArray;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  /**
   * Validate extensions
   * @param {Object} obj - Object to validate
   */
  validateExtensions(obj) {
    if (!obj) return;

    if (Array.isArray(obj)) {
      obj.forEach((item) => this.validateExtensions(item));
      return;
    }

    if (typeof obj === 'object') {
      if (obj.extension && Array.isArray(obj.extension)) {
        obj.extension.forEach((ext) => {
          if (!ext.url) {
            throw new Error('Extension must have a url');
          }
        });
      }

      if (obj.modifierExtension && Array.isArray(obj.modifierExtension)) {
        obj.modifierExtension.forEach((ext) => {
          if (!ext.url) {
            throw new Error('ModifierExtension must have a url');
          }
        });
      }

      Object.values(obj).forEach((value) => this.validateExtensions(value));
    }
  }

  /**
   * Add system fields to resource
   * @param {Object} resource - FHIR resource
   * @returns {Object} - Resource with system fields
   */
  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('InsurancePlan');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlan'],
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
   * Generate narrative text for Insurance Plan resource
   * @param {Object} resource - The Insurance Plan resource object
   * @returns {Object} - Narrative object
   */
  generateNarrativeText(resource) {
    let text = '';

    // Add Insurance Plan name (similar to Patient name)
    if (resource.name) {
      text += `<strong>${resource.name}</strong>`;
    }

    // Add status (similar to Patient gender)
    if (resource.status) {
      text += ` (${resource.status})`;
    }

    // Ensure XHTML has both lang and xml:lang when resource.language is present
    let divAttributes = 'xmlns="http://www.w3.org/1999/xhtml"';
    if (resource.language) {
      divAttributes += ` lang="${resource.language}" xml:lang="${resource.language}"`;
    }
    return {
      status: 'generated',
      div: `<div ${divAttributes}>${text}</div>`,
    };
  }

  /**
   * Get input schema
   * @returns {Object} - Input schema
   */
  getInputSchema() {
    return insurancePlanInputSchema;
  }
}

export default InsurancePlan;
