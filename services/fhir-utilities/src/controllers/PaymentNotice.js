import paymentNoticeInputSchema from '../schemas/Input/paymentNoticeInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class PaymentNotice {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR PaymentNotice resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR PaymentNotice resource
   */
  createPaymentNotice(input) {
    try {
      const { error, value } = paymentNoticeInputSchema.validate(input);
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
        error: 'PaymentNotice creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR PaymentNotice resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR PaymentNotice resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'PaymentNotice',
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

    if (input.request) {
      resource.request = this.datatypeUtils.transformReference(input.request);
    }

    if (input.response) {
      resource.response = this.datatypeUtils.transformReference(input.response);
    }

    resource.created = input.created || new Date().toISOString();

    if (input.provider) {
      resource.provider = this.datatypeUtils.transformReference(input.provider);
    }

    if (input.payment) {
      resource.payment = this.datatypeUtils.transformReference(input.payment);
    }

    if (input.paymentDate) {
      resource.paymentDate = input.paymentDate;
    }

    if (input.payee) {
      resource.payee = this.datatypeUtils.transformReference(input.payee);
    }

    if (input.recipient) {
      resource.recipient = this.datatypeUtils.transformReference(input.recipient);
    }

    if (input.amount) {
      resource.amount = this.datatypeUtils.transformMoney(input.amount);
    }

    if (input.paymentStatus) {
      if (typeof input.paymentStatus === 'string') {
        resource.paymentStatus = this.datatypeUtils.transformCodeableConcept(input.paymentStatus);
      } else {
        resource.paymentStatus = this.datatypeUtils.transformCodeableConcept(input.paymentStatus);
      }
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
   * Generate short UUID for element ID
   * @returns {string} - Short UUID (8 characters)
   */
  generateElementId() {
    return this.datatypeUtils.generateShortUuid();
  }

  /**
   * Add system fields to the resource
   */
  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('PaymentNotice');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/PaymentNotice'],
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
      divAttributes += ` lang="${normLang}" xml:lang="${normLang}"`;
      const isRtl = /^(ar|he|fa|ur|ps|sd|ug|yi|dv|ks|ku|nqo|prs|ckb)(-|$)/i.test(normLang);
      if (isRtl) divAttributes += ' dir="rtl"';
    }
    let narrative = `<div ${divAttributes}>`;

    if (resource.status) {
      narrative += `<p><strong>Status:</strong> ${resource.status}</p>`;
    }

    if (resource.created) {
      narrative += `<p><strong>Created:</strong> ${resource.created}</p>`;
    }

    if (resource.paymentDate) {
      narrative += `<p><strong>Payment Date:</strong> ${resource.paymentDate}</p>`;
    }

    if (resource.amount && resource.amount.value) {
      const currency = resource.amount.currency || 'INR';
      narrative += `<p><strong>Amount:</strong> ${resource.amount.value} ${currency}</p>`;
    }

    if (resource.paymentStatus) {
      if (resource.paymentStatus.text) {
        narrative += `<p><strong>Payment Status:</strong> ${resource.paymentStatus.text}</p>`;
      } else if (resource.paymentStatus.coding && resource.paymentStatus.coding.length > 0) {
        narrative += `<p><strong>Payment Status:</strong> ${resource.paymentStatus.coding[0].display || resource.paymentStatus.coding[0].code}</p>`;
      }
    }

    if (resource.payment && resource.payment.reference) {
      narrative += `<p><strong>Payment:</strong> ${resource.payment.reference}</p>`;
    }

    if (resource.recipient && resource.recipient.reference) {
      narrative += `<p><strong>Recipient:</strong> ${resource.recipient.reference}</p>`;
    }

    if (resource.provider && resource.provider.reference) {
      narrative += `<p><strong>Provider:</strong> ${resource.provider.reference}</p>`;
    }

    if (resource.payee && resource.payee.reference) {
      narrative += `<p><strong>Payee:</strong> ${resource.payee.reference}</p>`;
    }

    if (resource.request && resource.request.reference) {
      narrative += `<p><strong>Request:</strong> ${resource.request.reference}</p>`;
    }

    if (resource.response && resource.response.reference) {
      narrative += `<p><strong>Response:</strong> ${resource.response.reference}</p>`;
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
    return paymentNoticeInputSchema;
  }
}

export default PaymentNotice;
