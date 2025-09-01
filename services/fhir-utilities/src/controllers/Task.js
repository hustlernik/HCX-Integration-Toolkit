import taskInputSchema from '../schemas/Input/taskInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class Task {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR Task resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR Task resource
   */
  createTask(input) {
    try {
      const { error, value } = taskInputSchema.validate(input);
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
        error: 'Task creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR Task resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR Task resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'Task',
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

    if (input.instantiatesCanonical) {
      resource.instantiatesCanonical = input.instantiatesCanonical;
    }

    if (input.instantiatesUri) {
      resource.instantiatesUri = input.instantiatesUri;
    }

    if (input.basedOn && Array.isArray(input.basedOn)) {
      resource.basedOn = input.basedOn.map((ref) => this.datatypeUtils.transformReference(ref));
    }

    if (input.groupIdentifier) {
      resource.groupIdentifier = this.datatypeUtils.transformIdentifier(input.groupIdentifier);
    }

    if (input.partOf && Array.isArray(input.partOf)) {
      resource.partOf = input.partOf.map((ref) => this.datatypeUtils.transformReference(ref));
    }

    if (input.status) {
      resource.status = input.status;
    }

    if (input.statusReason) {
      if (typeof input.statusReason === 'string') {
        resource.statusReason = this.datatypeUtils.transformCodeableConcept(input.statusReason);
      } else {
        resource.statusReason = this.datatypeUtils.transformCodeableConcept(input.statusReason);
      }
    }

    if (input.businessStatus) {
      if (typeof input.businessStatus === 'string') {
        resource.businessStatus = this.datatypeUtils.transformCodeableConcept(input.businessStatus);
      } else {
        resource.businessStatus = this.datatypeUtils.transformCodeableConcept(input.businessStatus);
      }
    }

    if (input.intent) {
      resource.intent = input.intent;
    }

    if (input.priority) {
      resource.priority = input.priority;
    }

    if (input.code) {
      if (typeof input.code === 'string') {
        resource.code = this.datatypeUtils.transformCodeableConcept(input.code);
      } else {
        resource.code = this.datatypeUtils.transformCodeableConcept(input.code);
      }
    }

    if (input.description) {
      resource.description = input.description;
    }

    if (input.focus) {
      resource.focus = this.datatypeUtils.transformReference(input.focus);
    }

    if (input.for) {
      resource.for = this.datatypeUtils.transformReference(input.for);
    }

    if (input.encounter) {
      resource.encounter = this.datatypeUtils.transformReference(input.encounter);
    }

    if (input.executionPeriod) {
      resource.executionPeriod = this.datatypeUtils.transformPeriod(input.executionPeriod);
    }

    if (input.authoredOn) {
      resource.authoredOn = input.authoredOn;
    }

    if (input.lastModified) {
      resource.lastModified = input.lastModified;
    }

    if (input.requester) {
      resource.requester = this.datatypeUtils.transformReference(input.requester);
    }

    if (input.performerType && Array.isArray(input.performerType)) {
      resource.performerType = input.performerType.map((type) =>
        typeof type === 'string'
          ? this.datatypeUtils.transformCodeableConcept(type)
          : this.datatypeUtils.transformCodeableConcept(type),
      );
    }

    if (input.owner) {
      resource.owner = this.datatypeUtils.transformReference(input.owner);
    }

    if (input.location) {
      resource.location = this.datatypeUtils.transformReference(input.location);
    }

    if (input.reasonCode) {
      if (typeof input.reasonCode === 'string') {
        resource.reasonCode = this.datatypeUtils.transformCodeableConcept(input.reasonCode);
      } else {
        resource.reasonCode = this.datatypeUtils.transformCodeableConcept(input.reasonCode);
      }
    }

    if (input.reasonReference) {
      resource.reasonReference = this.datatypeUtils.transformReference(input.reasonReference);
    }

    if (input.insurance && Array.isArray(input.insurance)) {
      resource.insurance = input.insurance.map((ref) => this.datatypeUtils.transformReference(ref));
    }

    if (input.note && Array.isArray(input.note)) {
      resource.note = input.note.map((note) => this.datatypeUtils.transformAnnotation(note));
    }

    if (input.relevantHistory && Array.isArray(input.relevantHistory)) {
      resource.relevantHistory = input.relevantHistory.map((ref) =>
        this.datatypeUtils.transformReference(ref),
      );
    }

    if (input.restriction) {
      resource.restriction = this.transformRestrictionToFHIR(input.restriction);
    }

    if (input.input && Array.isArray(input.input)) {
      resource.input = input.input.map((inputItem) => this.transformInputToFHIR(inputItem));
    }

    if (input.output && Array.isArray(input.output)) {
      resource.output = input.output.map((outputItem) => this.transformOutputToFHIR(outputItem));
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
   * Transform restriction to FHIR format
   */
  transformRestrictionToFHIR(restriction) {
    const transformed = {};

    if (restriction.repetitions) {
      transformed.repetitions = restriction.repetitions;
    }

    if (restriction.period) {
      transformed.period = this.datatypeUtils.transformPeriod(restriction.period);
    }

    if (restriction.recipient && Array.isArray(restriction.recipient)) {
      transformed.recipient = restriction.recipient.map((ref) =>
        this.datatypeUtils.transformReference(ref),
      );
    }

    return transformed;
  }

  /**
   * Transform input to FHIR format
   */
  transformInputToFHIR(input) {
    const transformed = {};

    if (input.type) {
      if (typeof input.type === 'string') {
        transformed.type = this.datatypeUtils.transformCodeableConcept(input.type);
      } else {
        transformed.type = this.datatypeUtils.transformCodeableConcept(input.type);
      }
    }

    const valueFields = [
      'valueBase64Binary',
      'valueBoolean',
      'valueCanonical',
      'valueCode',
      'valueDate',
      'valueDateTime',
      'valueDecimal',
      'valueId',
      'valueInstant',
      'valueInteger',
      'valueMarkdown',
      'valueOid',
      'valuePositiveInt',
      'valueString',
      'valueTime',
      'valueUnsignedInt',
      'valueUri',
      'valueUrl',
      'valueUuid',
    ];

    for (const field of valueFields) {
      if (input[field] !== undefined) {
        transformed[field] = input[field];
        break;
      }
    }

    if (input.valueAddress) {
      transformed.valueAddress = this.datatypeUtils.transformAddress(input.valueAddress);
    }

    if (input.valueAge) {
      transformed.valueAge = this.datatypeUtils.transformAge(input.valueAge);
    }

    if (input.valueAnnotation) {
      transformed.valueAnnotation = this.datatypeUtils.transformAnnotation(input.valueAnnotation);
    }

    if (input.valueAttachment) {
      transformed.valueAttachment = this.datatypeUtils.transformAttachment(input.valueAttachment);
    }

    if (input.valueCodeableConcept) {
      transformed.valueCodeableConcept = this.datatypeUtils.transformCodeableConcept(
        input.valueCodeableConcept,
      );
    }

    if (input.valueCoding) {
      transformed.valueCoding = this.datatypeUtils.transformCoding(input.valueCoding);
    }

    if (input.valueContactPoint) {
      transformed.valueContactPoint = this.datatypeUtils.transformContactPoint(
        input.valueContactPoint,
      );
    }

    if (input.valueCount) {
      transformed.valueCount = this.datatypeUtils.transformCount(input.valueCount);
    }

    if (input.valueDistance) {
      transformed.valueDistance = this.datatypeUtils.transformDistance(input.valueDistance);
    }

    if (input.valueDuration) {
      transformed.valueDuration = this.datatypeUtils.transformDuration(input.valueDuration);
    }

    if (input.valueHumanName) {
      transformed.valueHumanName = this.datatypeUtils.transformHumanName(input.valueHumanName);
    }

    if (input.valueIdentifier) {
      transformed.valueIdentifier = this.datatypeUtils.transformIdentifier(input.valueIdentifier);
    }

    if (input.valueMoney) {
      transformed.valueMoney = this.datatypeUtils.transformMoney(input.valueMoney);
    }

    if (input.valuePeriod) {
      transformed.valuePeriod = this.datatypeUtils.transformPeriod(input.valuePeriod);
    }

    if (input.valueQuantity) {
      transformed.valueQuantity = this.datatypeUtils.transformQuantity(input.valueQuantity);
    }

    if (input.valueRange) {
      transformed.valueRange = this.datatypeUtils.transformRange(input.valueRange);
    }

    if (input.valueRatio) {
      transformed.valueRatio = this.datatypeUtils.transformRatio(input.valueRatio);
    }

    if (input.valueReference) {
      transformed.valueReference = this.datatypeUtils.transformReference(input.valueReference);
    }

    if (input.valueSignature) {
      transformed.valueSignature = this.datatypeUtils.transformSignature(input.valueSignature);
    }

    if (input.valueTiming) {
      transformed.valueTiming = this.datatypeUtils.transformTiming(input.valueTiming);
    }

    return transformed;
  }

  /**
   * Transform output to FHIR format
   */
  transformOutputToFHIR(output) {
    const transformed = {};

    if (output.type) {
      if (typeof output.type === 'string') {
        transformed.type = this.datatypeUtils.transformCodeableConcept(output.type);
      } else {
        transformed.type = this.datatypeUtils.transformCodeableConcept(output.type);
      }
    }

    const valueFields = [
      'valueBase64Binary',
      'valueBoolean',
      'valueCanonical',
      'valueCode',
      'valueDate',
      'valueDateTime',
      'valueDecimal',
      'valueId',
      'valueInstant',
      'valueInteger',
      'valueMarkdown',
      'valueOid',
      'valuePositiveInt',
      'valueString',
      'valueTime',
      'valueUnsignedInt',
      'valueUri',
      'valueUrl',
      'valueUuid',
    ];

    for (const field of valueFields) {
      if (output[field] !== undefined) {
        transformed[field] = output[field];
        break; // Only one value field should be present
      }
    }

    if (output.valueAddress) {
      transformed.valueAddress = this.datatypeUtils.transformAddress(output.valueAddress);
    }

    if (output.valueAge) {
      transformed.valueAge = this.datatypeUtils.transformAge(output.valueAge);
    }

    if (output.valueAnnotation) {
      transformed.valueAnnotation = this.datatypeUtils.transformAnnotation(output.valueAnnotation);
    }

    if (output.valueAttachment) {
      transformed.valueAttachment = this.datatypeUtils.transformAttachment(output.valueAttachment);
    }

    if (output.valueCodeableConcept) {
      transformed.valueCodeableConcept = this.datatypeUtils.transformCodeableConcept(
        output.valueCodeableConcept,
        'output.valueCodeableConcept',
      );
    }

    if (output.valueCoding) {
      transformed.valueCoding = this.datatypeUtils.transformCoding(output.valueCoding);
    }

    if (output.valueContactPoint) {
      transformed.valueContactPoint = this.datatypeUtils.transformContactPoint(
        output.valueContactPoint,
      );
    }

    if (output.valueCount) {
      transformed.valueCount = this.datatypeUtils.transformCount(output.valueCount);
    }

    if (output.valueDistance) {
      transformed.valueDistance = this.datatypeUtils.transformDistance(output.valueDistance);
    }

    if (output.valueDuration) {
      transformed.valueDuration = this.datatypeUtils.transformDuration(output.valueDuration);
    }

    if (output.valueHumanName) {
      transformed.valueHumanName = this.datatypeUtils.transformHumanName(output.valueHumanName);
    }

    if (output.valueIdentifier) {
      transformed.valueIdentifier = this.datatypeUtils.transformIdentifier(output.valueIdentifier);
    }

    if (output.valueMoney) {
      transformed.valueMoney = this.datatypeUtils.transformMoney(output.valueMoney);
    }

    if (output.valuePeriod) {
      transformed.valuePeriod = this.datatypeUtils.transformPeriod(output.valuePeriod);
    }

    if (output.valueQuantity) {
      transformed.valueQuantity = this.datatypeUtils.transformQuantity(output.valueQuantity);
    }

    if (output.valueRange) {
      transformed.valueRange = this.datatypeUtils.transformRange(output.valueRange);
    }

    if (output.valueRatio) {
      transformed.valueRatio = this.datatypeUtils.transformRatio(output.valueRatio);
    }

    if (output.valueReference) {
      transformed.valueReference = this.datatypeUtils.transformReference(output.valueReference);
    }

    if (output.valueSignature) {
      transformed.valueSignature = this.datatypeUtils.transformSignature(output.valueSignature);
    }

    if (output.valueTiming) {
      transformed.valueTiming = this.datatypeUtils.transformTiming(output.valueTiming);
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

    if (resource.lastModified && resource.authoredOn) {
      const lastModified = new Date(resource.lastModified);
      const authoredOn = new Date(resource.authoredOn);

      if (lastModified < authoredOn) {
        console.warn(
          'inv-1 constraint violation: Last modified date must be greater than or equal to authored-on date',
        );
      }
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
    const id = this.datatypeUtils.generateResourceId('Task');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Task'],
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

    if (resource.intent) {
      narrative += `<p><strong>Intent:</strong> ${resource.intent}</p>`;
    }

    if (resource.priority) {
      narrative += `<p><strong>Priority:</strong> ${resource.priority}</p>`;
    }

    if (resource.description) {
      narrative += `<p><strong>Description:</strong> ${resource.description}</p>`;
    }

    if (resource.focus && resource.focus.reference) {
      narrative += `<p><strong>Focus:</strong> ${resource.focus.reference}</p>`;
    }

    if (resource.for && resource.for.reference) {
      narrative += `<p><strong>For:</strong> ${resource.for.reference}</p>`;
    }

    if (resource.requester && resource.requester.reference) {
      narrative += `<p><strong>Requester:</strong> ${resource.requester.reference}</p>`;
    }

    if (resource.owner && resource.owner.reference) {
      narrative += `<p><strong>Owner:</strong> ${resource.owner.reference}</p>`;
    }

    if (resource.authoredOn) {
      narrative += `<p><strong>Authored On:</strong> ${resource.authoredOn}</p>`;
    }

    if (resource.lastModified) {
      narrative += `<p><strong>Last Modified:</strong> ${resource.lastModified}</p>`;
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
    return taskInputSchema;
  }
}

export default Task;
