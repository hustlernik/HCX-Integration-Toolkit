import claimResponseInputSchema from '../schemas/Input/claimResponseInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class ClaimResponse {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR ClaimResponse resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR ClaimResponse resource
   */
  createClaimResponse(input) {
    try {
      const { error, value } = claimResponseInputSchema.validate(input);
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
        error: 'ClaimResponse creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR ClaimResponse resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR ClaimResponse resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'ClaimResponse',
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

    if (input.type) {
      if (typeof input.type === 'string') {
        resource.type = this.datatypeUtils.transformCodeableConcept(input.type);
      } else {
        resource.type = this.datatypeUtils.transformCodeableConcept(input.type);
      }
    }

    if (input.subType) {
      if (typeof input.subType === 'string') {
        resource.subType = this.datatypeUtils.transformCodeableConcept(input.subType);
      } else {
        resource.subType = this.datatypeUtils.transformCodeableConcept(input.subType);
      }
    }

    if (input.use) {
      resource.use = input.use;
    }

    if (input.patient) {
      resource.patient = this.datatypeUtils.transformReference(input.patient);
    }

    resource.created = input.created || new Date().toISOString();

    if (input.insurer) {
      resource.insurer = this.datatypeUtils.transformReference(input.insurer);
    }

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

    if (input.preAuthRef) {
      resource.preAuthRef = input.preAuthRef;
    }

    if (input.preAuthPeriod) {
      resource.preAuthPeriod = this.datatypeUtils.transformPeriod(input.preAuthPeriod);
    }

    if (input.payeeType) {
      if (typeof input.payeeType === 'string') {
        resource.payeeType = this.datatypeUtils.transformCodeableConcept(input.payeeType);
      } else {
        resource.payeeType = this.datatypeUtils.transformCodeableConcept(input.payeeType);
      }
    }

    if (input.item && Array.isArray(input.item)) {
      resource.item = input.item.map((item) => this.transformItemToFHIR(item));
    }

    if (input.addItem && Array.isArray(input.addItem)) {
      resource.addItem = input.addItem.map((addItem) => this.transformAddItemToFHIR(addItem));
    }

    if (input.adjudication && Array.isArray(input.adjudication)) {
      resource.adjudication = input.adjudication.map((adjudication) =>
        this.transformAdjudicationToFHIR(adjudication),
      );
    }

    if (input.total && Array.isArray(input.total)) {
      resource.total = input.total.map((total) => this.transformTotalToFHIR(total));
    }

    if (input.payment) {
      resource.payment = this.transformPaymentToFHIR(input.payment);
    }

    if (input.fundsReserve) {
      if (typeof input.fundsReserve === 'string') {
        resource.fundsReserve = this.datatypeUtils.transformCodeableConcept(input.fundsReserve);
      } else {
        resource.fundsReserve = this.datatypeUtils.transformCodeableConcept(input.fundsReserve);
      }
    }

    if (input.formCode) {
      if (typeof input.formCode === 'string') {
        resource.formCode = this.datatypeUtils.transformCodeableConcept(input.formCode);
      } else {
        resource.formCode = this.datatypeUtils.transformCodeableConcept(input.formCode);
      }
    }

    if (input.form) {
      resource.form = this.datatypeUtils.transformAttachment(input.form);
    }

    if (input.processNote && Array.isArray(input.processNote)) {
      resource.processNote = input.processNote.map((note) => this.transformProcessNoteToFHIR(note));
    }

    if (input.communicationRequest && Array.isArray(input.communicationRequest)) {
      resource.communicationRequest = input.communicationRequest.map((ref) =>
        this.datatypeUtils.transformReference(ref),
      );
    }

    if (input.insurance && Array.isArray(input.insurance)) {
      resource.insurance = input.insurance.map((insurance) =>
        this.transformInsuranceToFHIR(insurance),
      );
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
   * Transform item to FHIR format
   */
  transformItemToFHIR(item) {
    const transformed = {
      itemSequence: item.itemSequence,
    };

    if (item.noteNumber && Array.isArray(item.noteNumber)) {
      transformed.noteNumber = item.noteNumber;
    }

    if (item.adjudication && Array.isArray(item.adjudication)) {
      transformed.adjudication = item.adjudication.map((adj) =>
        this.transformAdjudicationToFHIR(adj),
      );
    }

    if (item.detail && Array.isArray(item.detail)) {
      transformed.detail = item.detail.map((detail) => this.transformItemDetailToFHIR(detail));
    }

    return transformed;
  }

  /**
   * Transform item detail to FHIR format
   */
  transformItemDetailToFHIR(detail) {
    const transformed = {
      detailSequence: detail.detailSequence,
    };

    if (detail.noteNumber && Array.isArray(detail.noteNumber)) {
      transformed.noteNumber = detail.noteNumber;
    }

    if (detail.adjudication && Array.isArray(detail.adjudication)) {
      transformed.adjudication = detail.adjudication.map((adj) =>
        this.transformAdjudicationToFHIR(adj),
      );
    }

    if (detail.subDetail && Array.isArray(detail.subDetail)) {
      transformed.subDetail = detail.subDetail.map((subDetail) =>
        this.transformItemSubDetailToFHIR(subDetail),
      );
    }

    return transformed;
  }

  /**
   * Transform item sub-detail to FHIR format
   */
  transformItemSubDetailToFHIR(subDetail) {
    const transformed = {
      subDetailSequence: subDetail.subDetailSequence,
    };

    if (subDetail.noteNumber && Array.isArray(subDetail.noteNumber)) {
      transformed.noteNumber = subDetail.noteNumber;
    }

    if (subDetail.adjudication && Array.isArray(subDetail.adjudication)) {
      transformed.adjudication = subDetail.adjudication.map((adj) =>
        this.transformAdjudicationToFHIR(adj),
      );
    }

    return transformed;
  }

  /**
   * Transform add item to FHIR format
   */
  transformAddItemToFHIR(addItem) {
    const transformed = {};

    if (addItem.itemSequence && Array.isArray(addItem.itemSequence)) {
      transformed.itemSequence = addItem.itemSequence;
    }

    if (addItem.detailSequence && Array.isArray(addItem.detailSequence)) {
      transformed.detailSequence = addItem.detailSequence;
    }

    if (addItem.subdetailSequence && Array.isArray(addItem.subdetailSequence)) {
      transformed.subdetailSequence = addItem.subdetailSequence;
    }

    if (addItem.provider && Array.isArray(addItem.provider)) {
      transformed.provider = addItem.provider.map((ref) =>
        this.datatypeUtils.transformReference(ref),
      );
    }

    if (addItem.productOrService) {
      if (typeof addItem.productOrService === 'string') {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          addItem.productOrService,
        );
      } else {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          addItem.productOrService,
        );
      }
    }

    if (addItem.modifier && Array.isArray(addItem.modifier)) {
      transformed.modifier = addItem.modifier.map((mod) =>
        typeof mod === 'string'
          ? this.datatypeUtils.transformCodeableConcept(mod)
          : this.datatypeUtils.transformCodeableConcept(mod),
      );
    }

    if (addItem.programCode && Array.isArray(addItem.programCode)) {
      transformed.programCode = addItem.programCode.map((code) =>
        typeof code === 'string'
          ? this.datatypeUtils.transformCodeableConcept(code)
          : this.datatypeUtils.transformCodeableConcept(code),
      );
    }

    if (addItem.servicedDate) {
      transformed.servicedDate = addItem.servicedDate;
    }

    if (addItem.servicedPeriod) {
      transformed.servicedPeriod = this.datatypeUtils.transformPeriod(addItem.servicedPeriod);
    }

    if (addItem.locationCodeableConcept) {
      if (typeof addItem.locationCodeableConcept === 'string') {
        transformed.locationCodeableConcept = this.datatypeUtils.transformCodeableConcept(
          addItem.locationCodeableConcept,
        );
      } else {
        transformed.locationCodeableConcept = this.datatypeUtils.transformCodeableConcept(
          addItem.locationCodeableConcept,
        );
      }
    }

    if (addItem.locationAddress) {
      transformed.locationAddress = this.datatypeUtils.transformAddress(addItem.locationAddress);
    }

    if (addItem.locationReference) {
      transformed.locationReference = this.datatypeUtils.transformReference(
        addItem.locationReference,
      );
    }

    if (addItem.quantity) {
      transformed.quantity = this.datatypeUtils.transformQuantity(addItem.quantity);
    }

    if (addItem.unitPrice) {
      transformed.unitPrice = this.datatypeUtils.transformMoney(addItem.unitPrice);
    }

    if (addItem.factor) {
      transformed.factor = addItem.factor;
    }

    if (addItem.net) {
      transformed.net = this.datatypeUtils.transformMoney(addItem.net);
    }

    if (addItem.bodySite) {
      if (typeof addItem.bodySite === 'string') {
        transformed.bodySite = this.datatypeUtils.transformCodeableConcept(addItem.bodySite);
      } else {
        transformed.bodySite = this.datatypeUtils.transformCodeableConcept(addItem.bodySite);
      }
    }

    if (addItem.subSite && Array.isArray(addItem.subSite)) {
      transformed.subSite = addItem.subSite.map((site) =>
        typeof site === 'string'
          ? this.datatypeUtils.transformCodeableConcept(site)
          : this.datatypeUtils.transformCodeableConcept(site),
      );
    }

    if (addItem.noteNumber && Array.isArray(addItem.noteNumber)) {
      transformed.noteNumber = addItem.noteNumber;
    }

    if (addItem.adjudication && Array.isArray(addItem.adjudication)) {
      transformed.adjudication = addItem.adjudication.map((adj) =>
        this.transformAdjudicationToFHIR(adj),
      );
    }

    if (addItem.detail && Array.isArray(addItem.detail)) {
      transformed.detail = addItem.detail.map((detail) =>
        this.transformAddItemDetailToFHIR(detail),
      );
    }

    return transformed;
  }

  /**
   * Transform add item detail to FHIR format
   */
  transformAddItemDetailToFHIR(detail) {
    const transformed = {};

    if (detail.productOrService) {
      if (typeof detail.productOrService === 'string') {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          detail.productOrService,
        );
      } else {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          detail.productOrService,
        );
      }
    }

    if (detail.modifier && Array.isArray(detail.modifier)) {
      transformed.modifier = detail.modifier.map((mod) =>
        typeof mod === 'string'
          ? this.datatypeUtils.transformCodeableConcept(mod)
          : this.datatypeUtils.transformCodeableConcept(mod),
      );
    }

    if (detail.quantity) {
      transformed.quantity = this.datatypeUtils.transformQuantity(detail.quantity);
    }

    if (detail.unitPrice) {
      transformed.unitPrice = this.datatypeUtils.transformMoney(detail.unitPrice);
    }

    if (detail.factor) {
      transformed.factor = detail.factor;
    }

    if (detail.net) {
      transformed.net = this.datatypeUtils.transformMoney(detail.net);
    }

    if (detail.noteNumber && Array.isArray(detail.noteNumber)) {
      transformed.noteNumber = detail.noteNumber;
    }

    if (detail.adjudication && Array.isArray(detail.adjudication)) {
      transformed.adjudication = detail.adjudication.map((adj) =>
        this.transformAdjudicationToFHIR(adj),
      );
    }

    if (detail.subDetail && Array.isArray(detail.subDetail)) {
      transformed.subDetail = detail.subDetail.map((subDetail) =>
        this.transformAddItemSubDetailToFHIR(subDetail),
      );
    }

    return transformed;
  }

  /**
   * Transform add item sub-detail to FHIR format
   */
  transformAddItemSubDetailToFHIR(subDetail) {
    const transformed = {};

    if (subDetail.productOrService) {
      if (typeof subDetail.productOrService === 'string') {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          subDetail.productOrService,
        );
      } else {
        transformed.productOrService = this.datatypeUtils.transformCodeableConcept(
          subDetail.productOrService,
        );
      }
    }

    if (subDetail.modifier && Array.isArray(subDetail.modifier)) {
      transformed.modifier = subDetail.modifier.map((mod) =>
        typeof mod === 'string'
          ? this.datatypeUtils.transformCodeableConcept(mod)
          : this.datatypeUtils.transformCodeableConcept(mod),
      );
    }

    if (subDetail.quantity) {
      transformed.quantity = this.datatypeUtils.transformQuantity(subDetail.quantity);
    }

    if (subDetail.unitPrice) {
      transformed.unitPrice = this.datatypeUtils.transformMoney(subDetail.unitPrice);
    }

    if (subDetail.factor) {
      transformed.factor = subDetail.factor;
    }

    if (subDetail.net) {
      transformed.net = this.datatypeUtils.transformMoney(subDetail.net);
    }

    if (subDetail.noteNumber && Array.isArray(subDetail.noteNumber)) {
      transformed.noteNumber = subDetail.noteNumber;
    }

    if (subDetail.adjudication && Array.isArray(subDetail.adjudication)) {
      transformed.adjudication = subDetail.adjudication.map((adj) =>
        this.transformAdjudicationToFHIR(adj),
      );
    }

    return transformed;
  }

  /**
   * Transform adjudication to FHIR format
   */
  transformAdjudicationToFHIR(adjudication) {
    const transformed = {};

    if (adjudication.category) {
      if (typeof adjudication.category === 'string') {
        transformed.category = this.datatypeUtils.transformCodeableConcept(adjudication.category);
      } else {
        transformed.category = this.datatypeUtils.transformCodeableConcept(adjudication.category);
      }
    }

    if (adjudication.reason) {
      if (typeof adjudication.reason === 'string') {
        transformed.reason = this.datatypeUtils.transformCodeableConcept(adjudication.reason);
      } else {
        transformed.reason = this.datatypeUtils.transformCodeableConcept(adjudication.reason);
      }
    }

    if (adjudication.amount) {
      transformed.amount = this.datatypeUtils.transformMoney(adjudication.amount);
    }

    if (adjudication.value) {
      transformed.value = adjudication.value;
    }

    return transformed;
  }

  /**
   * Transform total to FHIR format
   */
  transformTotalToFHIR(total) {
    const transformed = {};

    if (total.category) {
      if (typeof total.category === 'string') {
        transformed.category = this.datatypeUtils.transformCodeableConcept(total.category);
      } else {
        transformed.category = this.datatypeUtils.transformCodeableConcept(total.category);
      }
    }

    if (total.amount) {
      transformed.amount = this.datatypeUtils.transformMoney(total.amount);
    }

    return transformed;
  }

  /**
   * Transform payment to FHIR format
   */
  transformPaymentToFHIR(payment) {
    const transformed = {};

    if (payment.type) {
      if (typeof payment.type === 'string') {
        transformed.type = this.datatypeUtils.transformCodeableConcept(payment.type);
      } else {
        transformed.type = this.datatypeUtils.transformCodeableConcept(payment.type);
      }
    }

    if (payment.adjustment) {
      transformed.adjustment = this.datatypeUtils.transformMoney(payment.adjustment);
    }

    if (payment.adjustmentReason) {
      if (typeof payment.adjustmentReason === 'string') {
        transformed.adjustmentReason = this.datatypeUtils.transformCodeableConcept(
          payment.adjustmentReason,
        );
      } else {
        transformed.adjustmentReason = this.datatypeUtils.transformCodeableConcept(
          payment.adjustmentReason,
        );
      }
    }

    if (payment.date) {
      transformed.date = payment.date;
    }

    if (payment.amount) {
      transformed.amount = this.datatypeUtils.transformMoney(payment.amount);
    }

    if (payment.identifier) {
      transformed.identifier = this.datatypeUtils.transformIdentifier(payment.identifier);
    }

    return transformed;
  }

  /**
   * Transform process note to FHIR format
   */
  transformProcessNoteToFHIR(note) {
    const transformed = {};

    if (note.number) {
      transformed.number = note.number;
    }

    if (note.type) {
      transformed.type = note.type;
    }

    if (note.text) {
      transformed.text = note.text;
    }

    if (note.language) {
      if (typeof note.language === 'string') {
        transformed.language = this.datatypeUtils.transformCodeableConcept(note.language);
      } else {
        transformed.language = this.datatypeUtils.transformCodeableConcept(note.language);
      }
    }

    return transformed;
  }

  /**
   * Transform insurance to FHIR format
   */
  transformInsuranceToFHIR(insurance) {
    const transformed = {
      sequence: insurance.sequence,
      focal: insurance.focal,
      coverage: this.datatypeUtils.transformReference(insurance.coverage),
    };

    if (insurance.businessArrangement) {
      transformed.businessArrangement = insurance.businessArrangement;
    }

    if (insurance.claimResponse) {
      transformed.claimResponse = this.datatypeUtils.transformReference(insurance.claimResponse);
    }

    return transformed;
  }

  /**
   * Transform error to FHIR format
   */
  transformErrorToFHIR(error) {
    const transformed = {};

    if (error.itemSequence) {
      transformed.itemSequence = error.itemSequence;
    }

    if (error.detailSequence) {
      transformed.detailSequence = error.detailSequence;
    }

    if (error.subDetailSequence) {
      transformed.subDetailSequence = error.subDetailSequence;
    }

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
   * Generate a unique element ID
   */

  generateElementId() {
    return 'element-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Add system fields to the resource
   */

  addSystemFields(resource) {
    const id = this.datatypeUtils.generateResourceId('ClaimResponse');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClaimResponse'],
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

    if (resource.outcome) {
      narrative += `<p><strong>Outcome:</strong> ${resource.outcome}</p>`;
    }

    if (resource.patient && resource.patient.reference) {
      narrative += `<p><strong>Patient:</strong> ${resource.patient.reference}</p>`;
    }

    if (resource.insurer && resource.insurer.reference) {
      narrative += `<p><strong>Insurer:</strong> ${resource.insurer.reference}</p>`;
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
    return claimResponseInputSchema;
  }
}

export default ClaimResponse;
