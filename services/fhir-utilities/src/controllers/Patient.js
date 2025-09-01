import patientInputSchema from '../schemas/Input/patientInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class Patient {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR Patient resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR Patient resource
   */
  createPatient(input) {
    try {
      const { error, value } = patientInputSchema.validate(input);
      if (error) {
        return {
          success: false,
          error: 'Validation failed',
          details: error.details.map((d) => d.message),
        };
      }

      const fhirResource = this.transformToFHIR(value);

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
        error: 'Patient creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR Patient resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR Patient resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'Patient',
    };

    if (input.identifier && Array.isArray(input.identifier)) {
      resource.identifier = input.identifier
        .map((identifier) => {
          const transformed = this.datatypeUtils.transformIdentifier(identifier);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.active !== undefined) {
      resource.active = input.active;
    }

    if (input.name && Array.isArray(input.name)) {
      resource.name = input.name
        .map((name) => {
          const transformed = this.datatypeUtils.transformHumanName(name);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.telecom && Array.isArray(input.telecom)) {
      resource.telecom = input.telecom
        .map((telecom) => {
          const transformed = this.datatypeUtils.transformContactPoint(telecom);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.gender) {
      resource.gender = this.datatypeUtils.transformCode(input.gender, 'gender');
    }

    if (input.birthDate) {
      const date = new Date(input.birthDate);
      resource.birthDate = !isNaN(date.getTime())
        ? date.toISOString().split('T')[0]
        : input.birthDate;
    }

    if (input.deceasedBoolean !== undefined) {
      resource.deceasedBoolean = input.deceasedBoolean;
    } else if (input.deceasedDateTime) {
      resource.deceasedDateTime = input.deceasedDateTime;
    }

    if (input.address && Array.isArray(input.address)) {
      resource.address = input.address
        .map((address) => {
          const transformed = this.datatypeUtils.transformAddress(address);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.maritalStatus) {
      resource.maritalStatus = this.datatypeUtils.transformCodeableConcept(input.maritalStatus);
    }

    if (input.multipleBirthBoolean !== undefined) {
      resource.multipleBirthBoolean = input.multipleBirthBoolean;
    } else if (input.multipleBirthInteger !== undefined) {
      resource.multipleBirthInteger = input.multipleBirthInteger;
    }

    if (input.photo && Array.isArray(input.photo)) {
      resource.photo = input.photo
        .map((photo) => this.datatypeUtils.transformAttachment(photo))
        .filter(Boolean);
    }

    if (input.contact && Array.isArray(input.contact)) {
      resource.contact = input.contact
        .map((contact) => {
          const transformed = this.transformContact(contact);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.communication && Array.isArray(input.communication)) {
      resource.communication = input.communication
        .map((communication) => {
          const transformed = this.transformCommunication(communication);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.generalPractitioner && Array.isArray(input.generalPractitioner)) {
      resource.generalPractitioner = input.generalPractitioner
        .map((practitioner) => {
          const transformed = this.datatypeUtils.transformReference(practitioner);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.managingOrganization) {
      resource.managingOrganization = this.datatypeUtils.transformReference(
        input.managingOrganization,
      );
    }

    if (input.link && Array.isArray(input.link)) {
      resource.link = input.link
        .map((link) => {
          const transformed = this.transformLink(link);
          transformed.id = this.generateElementId();
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.generalPractitioner && Array.isArray(input.generalPractitioner)) {
      resource.generalPractitioner = input.generalPractitioner
        .map((practitioner) => this.datatypeUtils.transformReference(practitioner))
        .filter(Boolean);
    }

    if (input.managingOrganization) {
      resource.managingOrganization = this.datatypeUtils.transformReference(
        input.managingOrganization,
      );
    }

    if (input.implicitRules) {
      resource.implicitRules = input.implicitRules;
    }

    this.ensureFHIRConstraints(resource);

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
   * Transform contact information
   * @param {Object} contact - Contact object
   * @returns {Object} - Transformed contact
   */
  transformContact(contact) {
    if (!contact) return null;

    let relationship = undefined;
    if (contact.relationship) {
      if (Array.isArray(contact.relationship)) {
        relationship = contact.relationship
          .map((rel) => this.datatypeUtils.transformCodeableConcept(rel))
          .filter(Boolean);
      } else {
        const transformed = this.datatypeUtils.transformCodeableConcept(contact.relationship);
        if (transformed) {
          relationship = [transformed];
        }
      }
    }

    const result = {
      relationship: relationship,
      name: contact.name ? this.datatypeUtils.transformHumanName(contact.name) : undefined,
      telecom: contact.telecom
        ? contact.telecom
            .map((telecom) => this.datatypeUtils.transformContactPoint(telecom))
            .filter(Boolean)
        : undefined,
      address: contact.address ? this.datatypeUtils.transformAddress(contact.address) : undefined,
      gender: contact.gender ? this.datatypeUtils.transformCode(contact.gender) : undefined,
      organization: contact.organization
        ? this.datatypeUtils.transformReference(contact.organization)
        : undefined,
      period: contact.period ? this.datatypeUtils.transformPeriod(contact.period) : undefined,
    };

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform communication information
   * @param {Object} communication - Communication object
   * @returns {Object} - Transformed communication
   */
  transformCommunication(communication) {
    if (!communication) return null;

    const result = {
      language: communication.language
        ? this.datatypeUtils.transformCodeableConcept(communication.language)
        : undefined,
      preferred: communication.preferred,
    };

    // Remove undefined fields
    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform link information
   * @param {Object} link - Link object
   * @returns {Object} - Transformed link
   */
  transformLink(link) {
    if (!link) return null;
    const result = {
      other: link.other ? this.datatypeUtils.transformReference(link.other) : undefined,
      type: link.type ? this.datatypeUtils.transformCode(link.type, 'link.type') : undefined,
    };
    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });
    return result;
  }

  /**
   * Add system fields to resource
   * @param {Object} resource - FHIR resource
   * @returns {Object} - Resource with system fields
   */
  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('Patient');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'],
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

    if (resource.name && resource.name.length > 0) {
      const name = resource.name[0];
      if (name.family || (name.given && name.given.length > 0)) {
        const fullName = [...(name.given || []), name.family].filter(Boolean).join(' ');
        narrative += `<p><strong>Name:</strong> ${fullName}</p>`;
      }
    }

    if (resource.gender) {
      narrative += `<p><strong>Gender:</strong> ${resource.gender}</p>`;
    }

    if (resource.birthDate) {
      narrative += `<p><strong>Birth Date:</strong> ${resource.birthDate}</p>`;
    }

    if (resource.identifier && resource.identifier.length > 0) {
      const primaryId = resource.identifier[0];
      if (primaryId.value) {
        narrative += `<p><strong>Identifier:</strong> ${primaryId.value}</p>`;
      }
    }

    if (resource.telecom && resource.telecom.length > 0) {
      const contact = resource.telecom.find((t) => t.system === 'phone' || t.system === 'email');
      if (contact && contact.value) {
        narrative += `<p><strong>Contact:</strong> ${contact.value}</p>`;
      }
    }

    narrative += `</div>`;

    return {
      status: 'generated',
      div: narrative,
    };
  }

  /**
   * Get the input schema for validation
   * @returns {Object} - Joi schema
   */
  getInputSchema() {
    return patientInputSchema;
  }

  /**
   * Generate a unique element ID
   * @returns {string} - Unique element ID
   */
  generateElementId() {
    return this.datatypeUtils.generateShortUuid();
  }
}

export default Patient;
