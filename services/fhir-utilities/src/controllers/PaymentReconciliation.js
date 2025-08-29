import paymentReconciliationInputSchema from '../schemas/Input/paymentReconciliationInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class PaymentReconciliation {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR PaymentReconciliation resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR PaymentReconciliation resource
   */
  createPaymentReconciliation(input) {
    try {
      const { error, value } = paymentReconciliationInputSchema.validate(input);
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
        error: 'PaymentReconciliation creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR PaymentReconciliation resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR PaymentReconciliation resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'PaymentReconciliation',
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

    if (input.period) {
      resource.period = this.datatypeUtils.transformPeriod(input.period);
    }

    resource.created = input.created || new Date().toISOString();

    if (input.paymentIssuer) {
      resource.paymentIssuer = this.datatypeUtils.transformReference(input.paymentIssuer);
    }

    if (input.request) {
      resource.request = this.datatypeUtils.transformReference(input.request);
    }

    if (input.requestor) {
      resource.requestor = this.datatypeUtils.transformReference(input.requestor);
    }

    if (input.outcome) {
      resource.outcome = input.outcome;
    }

    if (input.disposition) {
      resource.disposition = input.disposition;
    }

    if (input.paymentDate) {
      resource.paymentDate = input.paymentDate;
    }

    if (input.paymentAmount) {
      resource.paymentAmount = this.datatypeUtils.transformMoney(input.paymentAmount);
    }

    if (input.paymentIdentifier) {
      resource.paymentIdentifier = this.datatypeUtils.transformIdentifier(input.paymentIdentifier);
    }

    if (input.detail && Array.isArray(input.detail)) {
      resource.detail = input.detail.map((detail) => this.transformDetailToFHIR(detail));
    }

    if (input.formCode) {
      if (typeof input.formCode === 'string') {
        resource.formCode = this.datatypeUtils.transformCodeableConcept(input.formCode);
      } else {
        resource.formCode = this.datatypeUtils.transformCodeableConcept(input.formCode);
      }
    }

    if (input.processNote && Array.isArray(input.processNote)) {
      resource.processNote = input.processNote.map((note) => this.transformProcessNoteToFHIR(note));
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
   * Transform detail to FHIR format
   */
  transformDetailToFHIR(detail) {
    const transformed = {};

    if (detail.identifier) {
      transformed.identifier = this.datatypeUtils.transformIdentifier(detail.identifier);
    }

    if (detail.predecessor) {
      transformed.predecessor = this.datatypeUtils.transformIdentifier(detail.predecessor);
    }

    if (detail.type) {
      if (typeof detail.type === 'string') {
        transformed.type = this.datatypeUtils.transformCodeableConcept(detail.type);
      } else {
        transformed.type = this.datatypeUtils.transformCodeableConcept(detail.type);
      }
    }

    if (detail.request) {
      transformed.request = this.datatypeUtils.transformReference(detail.request);
    }

    if (detail.submitter) {
      transformed.submitter = this.datatypeUtils.transformReference(detail.submitter);
    }

    if (detail.response) {
      transformed.response = this.datatypeUtils.transformReference(detail.response);
    }

    if (detail.date) {
      transformed.date = detail.date;
    }

    if (detail.responsible) {
      transformed.responsible = this.datatypeUtils.transformReference(detail.responsible);
    }

    if (detail.payee) {
      transformed.payee = this.datatypeUtils.transformReference(detail.payee);
    }

    if (detail.amount) {
      transformed.amount = this.datatypeUtils.transformMoney(detail.amount);
    }

    return transformed;
  }

  /**
   * Transform process note to FHIR format
   */
  transformProcessNoteToFHIR(note) {
    const transformed = {};

    if (note.type) {
      transformed.type = note.type;
    }

    if (note.text) {
      transformed.text = note.text;
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
    return this.datatypeUtils.generateShortUuid();
  }

  /**
   * Add system fields to the resource
   */
  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('PaymentReconciliation');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/PaymentReconciliation'],
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
      divAttributes += ` lang="${resource.language}" xml:lang="${resource.language}"`;
    }
    let narrative = `<div ${divAttributes}>`;

    if (resource.status) {
      narrative += `<p><strong>Status:</strong> ${resource.status}</p>`;
    }

    if (resource.created) {
      narrative += `<p><strong>Created:</strong> ${resource.created}</p>`;
    }

    if (resource.paymentDate) {
      narrative += `<p><strong>Payment Date:</strong> ${this.escapeHtml(resource.paymentDate)}</p>`;
    }

    if (resource.paymentAmount && resource.paymentAmount.value) {
      const currency = resource.paymentAmount.currency || 'INR';
      narrative += `<p><strong>Payment Amount:</strong> ${this.escapeHtml(resource.paymentAmount.value)} ${currency}</p>`;
    }

    if (resource.outcome) {
      narrative += `<p><strong>Outcome:</strong> ${this.escapeHtml(resource.outcome)}</p>`;
    }

    if (resource.disposition) {
      narrative += `<p><strong>Disposition:</strong> ${this.escapeHtml(resource.disposition)}</p>`;
    }

    if (resource.paymentIssuer && resource.paymentIssuer.reference) {
      narrative += `<p><strong>Payment Issuer:</strong> ${this.escapeHtml(resource.paymentIssuer.reference)}</p>`;
    }

    if (resource.requestor && resource.requestor.reference) {
      narrative += `<p><strong>Requestor:</strong> ${this.escapeHtml(resource.requestor.reference)}</p>`;
    }

    if (resource.request && resource.request.reference) {
      narrative += `<p><strong>Request:</strong> ${this.escapeHtml(resource.request.reference)}</p>`;
    }

    if (resource.detail && resource.detail.length > 0) {
      narrative += `<p><strong>Details:</strong> ${this.escapeHtml(resource.detail.length)} detail(s)</p>`;
    }

    if (resource.processNote && resource.processNote.length > 0) {
      narrative += `<p><strong>Process Notes:</strong> ${this.escapeHtml(resource.processNote.length)} note(s)</p>`;
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
    return paymentReconciliationInputSchema;
  }
}

export default PaymentReconciliation;
