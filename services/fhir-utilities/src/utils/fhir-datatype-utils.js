/**
 * FHIR Data Type Utilities
 */

class FHIRDataType {
  constructor() {}

  /**
   * Transform to FHIR id (string)
   * @param {string} value - The id value
   * @returns {string} - Valid FHIR id
   */
  transformId(value) {
    if (!value) return null;
    return String(value).replace(/[^A-Za-z0-9\-\.]/g, '-');
  }

  /**
   * Transform to FHIR Meta
   * @param {Object} meta - Meta object
   * @returns {Object} - Valid FHIR Meta
   */
  transformMeta(meta = {}) {
    const now = new Date().toISOString();
    const result = {
      versionId: meta.versionId || '1',
      lastUpdated: meta.lastUpdated || now,
      profile: meta.profile || [],
    };

    if (meta.security && Array.isArray(meta.security) && meta.security.length > 0) {
      result.security = meta.security;
    }

    if (meta.tag && Array.isArray(meta.tag) && meta.tag.length > 0) {
      result.tag = meta.tag;
    }

    return result;
  }

  /**
   * @param {string} value - date or dateTime string
   * @returns {string|null} - normalized date string or null
   */
  normalizeToFHIRDate(value) {
    if (value === null || value === undefined) return null;

    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      const y = value.getUTCFullYear();
      const m = String(value.getUTCMonth() + 1).padStart(2, '0');
      const d = String(value.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    if (
      typeof value === 'number' ||
      (typeof value === 'string' && /^\d{10,}$/.test(value.trim()))
    ) {
      const n = typeof value === 'number' ? value : Number(value.trim());
      const ms = Math.abs(n) < 1e12 ? n * 1000 : n; // < 1e12 → seconds, else milliseconds
      const dt = new Date(ms);
      if (isNaN(dt.getTime())) return null;
      const y = dt.getUTCFullYear();
      const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dt.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }

    const s = String(value).trim().replace(/\//g, '-');
    const datePart = s.includes('T') ? s.split('T')[0] : s;
    const re = /^(\d{4})(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2]\d|3[0-1]))?)?$/;
    return re.test(datePart) ? datePart : null;
  }

  /**
   * Transform to FHIR uri
   * @param {string} value - The uri value
   * @returns {string} - Valid FHIR uri
   */
  transformUri(value) {
    if (!value) return null;
    return String(value);
  }

  /**
   * Transform to FHIR Code
   * @param {string} code - Code value
   * @returns {string} - Valid FHIR Code
   */
  transformCode(code) {
    if (!code) return null;
    return code;
  }

  /**
   * Transform to FHIR Resource Reference
   * @param {Object} reference - Reference object
   * @returns {Object} - Valid FHIR Reference
   */
  transformReference(reference) {
    if (!reference) return null;

    if (typeof reference === 'string') {
      return { reference: reference };
    }

    return {
      reference: reference.reference,
      type: reference.type,
      identifier: reference.identifier,
      display: reference.display,
    };
  }

  /**
   * Transform to FHIR Extension
   * @param {Object} extension - Extension object
   * @returns {Object} - Valid FHIR Extension
   */
  transformExtension(extension) {
    if (!extension) return null;

    const result = {
      url: extension.url,
    };

    const hasExtensions =
      extension.extension && Array.isArray(extension.extension) && extension.extension.length > 0;
    const hasValue = Object.keys(extension).some(
      (key) => key.startsWith('value') && extension[key] !== undefined,
    );

    if (hasExtensions && hasValue) {
      console.warn(
        'Extension has both extensions and value[x] - removing extensions to comply with ext-1 constraint',
      );
      delete extension.extension;
    }

    if (extension.valueBase64Binary !== undefined)
      result.valueBase64Binary = extension.valueBase64Binary;
    if (extension.valueBoolean !== undefined) result.valueBoolean = extension.valueBoolean;
    if (extension.valueCanonical !== undefined) result.valueCanonical = extension.valueCanonical;
    if (extension.valueCode !== undefined) result.valueCode = extension.valueCode;
    if (extension.valueDate !== undefined) result.valueDate = extension.valueDate;
    if (extension.valueDateTime !== undefined) result.valueDateTime = extension.valueDateTime;
    if (extension.valueDecimal !== undefined) result.valueDecimal = extension.valueDecimal;
    if (extension.valueId !== undefined) result.valueId = extension.valueId;
    if (extension.valueInstant !== undefined) result.valueInstant = extension.valueInstant;
    if (extension.valueInteger !== undefined) result.valueInteger = extension.valueInteger;
    if (extension.valueMarkdown !== undefined) result.valueMarkdown = extension.valueMarkdown;
    if (extension.valueOid !== undefined) result.valueOid = extension.valueOid;
    if (extension.valuePositiveInt !== undefined)
      result.valuePositiveInt = extension.valuePositiveInt;
    if (extension.valueString !== undefined) result.valueString = extension.valueString;
    if (extension.valueTime !== undefined) result.valueTime = extension.valueTime;
    if (extension.valueUnsignedInt !== undefined)
      result.valueUnsignedInt = extension.valueUnsignedInt;
    if (extension.valueUri !== undefined) result.valueUri = extension.valueUri;
    if (extension.valueUrl !== undefined) result.valueUrl = extension.valueUrl;
    if (extension.valueUuid !== undefined) result.valueUuid = extension.valueUuid;
    if (extension.valueAddress !== undefined)
      result.valueAddress = this.transformAddress(extension.valueAddress);
    if (extension.valueAge !== undefined)
      result.valueAge = this.transformQuantity(extension.valueAge);
    if (extension.valueAnnotation !== undefined)
      result.valueAnnotation = this.transformAnnotation(extension.valueAnnotation);
    if (extension.valueAttachment !== undefined)
      result.valueAttachment = this.transformAttachment(extension.valueAttachment);
    if (extension.valueCodeableConcept !== undefined)
      result.valueCodeableConcept = this.transformCodeableConcept(extension.valueCodeableConcept);
    if (extension.valueCoding !== undefined)
      result.valueCoding = this.transformCoding(extension.valueCoding);
    if (extension.valueContactPoint !== undefined)
      result.valueContactPoint = this.transformContactPoint(extension.valueContactPoint);
    if (extension.valueCount !== undefined)
      result.valueCount = this.transformQuantity(extension.valueCount);
    if (extension.valueDistance !== undefined)
      result.valueDistance = this.transformQuantity(extension.valueDistance);
    if (extension.valueDuration !== undefined)
      result.valueDuration = this.transformQuantity(extension.valueDuration);
    if (extension.valueHumanName !== undefined)
      result.valueHumanName = this.transformHumanName(extension.valueHumanName);
    if (extension.valueIdentifier !== undefined)
      result.valueIdentifier = this.transformIdentifier(extension.valueIdentifier);
    if (extension.valueMoney !== undefined)
      result.valueMoney = this.transformMoney(extension.valueMoney);
    if (extension.valuePeriod !== undefined)
      result.valuePeriod = this.transformPeriod(extension.valuePeriod);
    if (extension.valueQuantity !== undefined)
      result.valueQuantity = this.transformQuantity(extension.valueQuantity);
    if (extension.valueRange !== undefined)
      result.valueRange = this.transformRange(extension.valueRange);
    if (extension.valueRatio !== undefined)
      result.valueRatio = this.transformRatio(extension.valueRatio);
    if (extension.valueReference !== undefined)
      result.valueReference = this.transformReference(extension.valueReference);
    if (extension.valueSampledData !== undefined)
      result.valueSampledData = this.transformSampledData(extension.valueSampledData);
    if (extension.valueSignature !== undefined)
      result.valueSignature = this.transformSignature(extension.valueSignature);
    if (extension.valueTiming !== undefined) result.valueTiming = extension.valueTiming; // Timing is complex, pass through for now
    if (extension.valueContactDetail !== undefined)
      result.valueContactDetail = extension.valueContactDetail; // Pass through for now
    if (extension.valueContributor !== undefined)
      result.valueContributor = extension.valueContributor; // Pass through for now
    if (extension.valueDataRequirement !== undefined)
      result.valueDataRequirement = extension.valueDataRequirement; // Pass through for now
    if (extension.valueExpression !== undefined) result.valueExpression = extension.valueExpression; // Pass through for now
    if (extension.valueParameterDefinition !== undefined)
      result.valueParameterDefinition = extension.valueParameterDefinition; // Pass through for now
    if (extension.valueRelatedArtifact !== undefined)
      result.valueRelatedArtifact = extension.valueRelatedArtifact; // Pass through for now
    if (extension.valueTriggerDefinition !== undefined)
      result.valueTriggerDefinition = extension.valueTriggerDefinition; // Pass through for now
    if (extension.valueUsageContext !== undefined)
      result.valueUsageContext = extension.valueUsageContext; // Pass through for now
    if (extension.valueDosage !== undefined)
      result.valueDosage = this.transformDosage(extension.valueDosage);
    if (extension.valueMeta !== undefined)
      result.valueMeta = this.transformMeta(extension.valueMeta);

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform to FHIR Identifier
   * @param {Object} identifier - Identifier object
   * @returns {Object} - Valid FHIR Identifier
   */
  transformIdentifier(identifier) {
    if (!identifier) return null;

    const result = {
      use: identifier.use || 'usual',
      type: this.transformCodeableConcept(identifier.type),
      system: identifier.system,
      value: identifier.value,
      period: identifier.period ? this.transformPeriod(identifier.period) : undefined,
      assigner: identifier.assigner ? this.transformReference(identifier.assigner) : undefined,
    };

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform to FHIR string
   * @param {string} value - The string value
   * @returns {string} - Valid FHIR string
   */
  transformString(value) {
    if (value === null || value === undefined) return null;
    return String(value);
  }

  /**
   * Transform to FHIR CodeableConcept
   * @param {Object|string} codeableConcept - CodeableConcept object or string
   * @returns {Object} - Valid FHIR CodeableConcept
   */
  transformCodeableConcept(codeableConcept) {
    if (!codeableConcept) return null;

    if (typeof codeableConcept === 'string') {
      return { text: codeableConcept };
    }

    if (codeableConcept.code || codeableConcept.display || codeableConcept.system) {
      const coding =
        codeableConcept.code || codeableConcept.system || codeableConcept.display
          ? [
              {
                system: codeableConcept.system,
                code: codeableConcept.code,
                display: codeableConcept.display,
              },
            ]
          : undefined;
      const result = {};
      if (coding) result.coding = coding;
      if (codeableConcept.text) result.text = codeableConcept.text;
      if (!result.text && codeableConcept.display) result.text = codeableConcept.display;
      return result;
    }

    if (codeableConcept.coding && Array.isArray(codeableConcept.coding)) {
      const result = {
        coding: codeableConcept.coding.map((coding) => ({
          system: coding.system,
          code: coding.code,
          display: coding.display,
        })),
      };
      if (codeableConcept.text || codeableConcept.display) {
        result.text = codeableConcept.text || codeableConcept.display;
      }
      return result;
    }

    return codeableConcept;
  }

  /**
   * Transform to FHIR Coding
   * @param {Object} coding - Coding object
   * @returns {Object} - Valid FHIR Coding
   */
  transformCoding(coding) {
    if (!coding) return null;

    return {
      system: coding.system,
      version: coding.version,
      code: coding.code,
      display: coding.display,
      userSelected: coding.userSelected,
    };
  }

  /**
   * Transform to FHIR Period
   * @param {Object} period - Period object
   * @returns {Object} - Valid FHIR Period
   */
  transformPeriod(period) {
    if (!period) return null;

    return {
      start: period.start,
      end: period.end,
    };
  }

  /**
   * Transform to FHIR HumanName
   * @param {Object} name - HumanName object
   * @returns {Object} - Valid FHIR HumanName
   */
  transformHumanName(name) {
    if (!name) return null;

    const result = {
      use: name.use || 'usual',
      text: name.text,
      family: name.family,
      given: Array.isArray(name.given) ? name.given : name.given ? [name.given] : undefined,
      prefix: Array.isArray(name.prefix) ? name.prefix : name.prefix ? [name.prefix] : undefined,
      suffix: Array.isArray(name.suffix) ? name.suffix : name.suffix ? [name.suffix] : undefined,
      period: name.period ? this.transformPeriod(name.period) : undefined,
    };

    if (!result.text) {
      const parts = [];
      if (result.prefix && result.prefix.length > 0) {
        parts.push(result.prefix.join(' '));
      }
      if (result.given && result.given.length > 0) {
        parts.push(result.given.join(' '));
      }
      if (result.family) {
        parts.push(result.family);
      }
      if (result.suffix && result.suffix.length > 0) {
        parts.push(result.suffix.join(' '));
      }
      result.text = parts.join(' ');
    }

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform to FHIR Address
   * @param {Object} address - Address object
   * @returns {Object} - Valid FHIR Address
   */
  transformAddress(address) {
    if (!address) return null;

    const result = {
      use: address.use,
      type: address.type,
      text: address.text,
      line: Array.isArray(address.line) && address.line.length > 0 ? address.line : undefined,
      city: address.city,
      district: address.district,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      period: address.period ? this.transformPeriod(address.period) : undefined,
    };

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform to FHIR ContactPoint
   * @param {Object} contactPoint - ContactPoint object
   * @returns {Object} - Valid FHIR ContactPoint
   */
  transformContactPoint(contactPoint) {
    if (!contactPoint) return null;

    const result = {
      system: contactPoint.system || 'phone',
      value: contactPoint.value,
      use: contactPoint.use,
      rank: contactPoint.rank,
      period: contactPoint.period ? this.transformPeriod(contactPoint.period) : undefined,
    };

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform to FHIR Attachment
   * @param {Object} attachment - Attachment object
   * @returns {Object} - Valid FHIR Attachment
   */
  transformAttachment(attachment) {
    if (!attachment) return null;

    return {
      contentType: attachment.contentType,
      language: attachment.language,
      data: attachment.data,
      url: attachment.url,
      size: attachment.size,
      hash: attachment.hash,
      title: attachment.title,
      creation: attachment.creation,
    };
  }

  /**
   * Transform to FHIR Quantity
   * @param {Object} quantity - Quantity object
   * @returns {Object} - Valid FHIR Quantity
   */
  transformQuantity(quantity) {
    if (!quantity) return null;

    return {
      value: quantity.value,
      unit: quantity.unit,
      system: quantity.system,
      code: quantity.code,
    };
  }

  /**
   * Transform to FHIR Money
   * @param {Object} money - Money object
   * @param {string} fieldPath - Field path for binding lookup (optional)
   * @returns {Object} - Valid FHIR Money
   */
  transformMoney(money, fieldPath = null) {
    if (!money) return null;

    const currency = money.currency || 'INR';

    return {
      value: money.value,
      currency: currency,
    };
  }

  /**
   * Transform to FHIR Range
   * @param {Object} range - Range object
   * @returns {Object} - Valid FHIR Range
   */
  transformRange(range) {
    if (!range) return null;

    return {
      low: range.low ? this.transformQuantity(range.low) : undefined,
      high: range.high ? this.transformQuantity(range.high) : undefined,
    };
  }

  /**
   * Transform to FHIR Ratio
   * @param {Object} ratio - Ratio object
   * @returns {Object} - Valid FHIR Ratio
   */
  transformRatio(ratio) {
    if (!ratio) return null;

    return {
      numerator: ratio.numerator ? this.transformQuantity(ratio.numerator) : undefined,
      denominator: ratio.denominator ? this.transformQuantity(ratio.denominator) : undefined,
    };
  }

  /**
   * Transform to FHIR SampledData
   * @param {Object} sampledData - SampledData object
   * @returns {Object} - Valid FHIR SampledData
   */
  transformSampledData(sampledData) {
    if (!sampledData) return null;

    return {
      origin: sampledData.origin ? this.transformQuantity(sampledData.origin) : undefined,
      period: sampledData.period,
      factor: sampledData.factor,
      lowerLimit: sampledData.lowerLimit,
      upperLimit: sampledData.upperLimit,
      dimensions: sampledData.dimensions,
      data: sampledData.data,
    };
  }

  /**
   * Transform to FHIR Signature
   * @param {Object} signature - Signature object
   * @returns {Object} - Valid FHIR Signature
   */
  transformSignature(signature) {
    if (!signature) return null;

    return {
      type: signature.type ? signature.type.map((type) => this.transformCoding(type)) : undefined,
      when: signature.when,
      who: signature.who ? this.transformReference(signature.who) : undefined,
      onBehalfOf: signature.onBehalfOf ? this.transformReference(signature.onBehalfOf) : undefined,
      targetFormat: signature.targetFormat,
      sigFormat: signature.sigFormat,
      data: signature.data,
    };
  }

  /**
   * Transform to FHIR Annotation
   * @param {Object} annotation - Annotation object
   * @returns {Object} - Valid FHIR Annotation
   */
  transformAnnotation(annotation) {
    if (!annotation) return null;

    return {
      authorReference: annotation.authorReference
        ? this.transformReference(annotation.authorReference)
        : undefined,
      authorString: annotation.authorString,
      time: annotation.time,
      text: annotation.text,
    };
  }

  /**
   * Transform to FHIR Dosage
   * @param {Object} dosage - Dosage object
   * @returns {Object} - Valid FHIR Dosage
   */
  transformDosage(dosage) {
    if (!dosage) return null;

    return {
      sequence: dosage.sequence,
      text: dosage.text,
      additionalInstruction: dosage.additionalInstruction
        ? dosage.additionalInstruction.map((instruction) =>
            this.transformCodeableConcept(instruction),
          )
        : undefined,
      patientInstruction: dosage.patientInstruction,
      timing: dosage.timing ? this.transformTiming(dosage.timing) : undefined,
      asNeededBoolean: dosage.asNeededBoolean,
      asNeededCodeableConcept: dosage.asNeededCodeableConcept
        ? this.transformCodeableConcept(dosage.asNeededCodeableConcept)
        : undefined,
      site: dosage.site ? this.transformCodeableConcept(dosage.site) : undefined,
      route: dosage.route ? this.transformCodeableConcept(dosage.route) : undefined,
      method: dosage.method ? this.transformCodeableConcept(dosage.method) : undefined,
      doseAndRate: dosage.doseAndRate
        ? dosage.doseAndRate.map((doseRate) => ({
            type: doseRate.type ? this.transformCodeableConcept(doseRate.type) : undefined,
            doseRange: doseRate.doseRange ? this.transformRange(doseRate.doseRange) : undefined,
            doseQuantity: doseRate.doseQuantity
              ? this.transformQuantity(doseRate.doseQuantity)
              : undefined,
            rateRatio: doseRate.rateRatio ? this.transformRatio(doseRate.rateRatio) : undefined,
            rateRange: doseRate.rateRange ? this.transformRange(doseRate.rateRange) : undefined,
            rateQuantity: doseRate.rateQuantity
              ? this.transformQuantity(doseRate.rateQuantity)
              : undefined,
          }))
        : undefined,
      maxDosePerPeriod: dosage.maxDosePerPeriod
        ? this.transformRatio(dosage.maxDosePerPeriod)
        : undefined,
      maxDosePerAdministration: dosage.maxDosePerAdministration
        ? this.transformQuantity(dosage.maxDosePerAdministration)
        : undefined,
      maxDosePerLifetime: dosage.maxDosePerLifetime
        ? this.transformQuantity(dosage.maxDosePerLifetime)
        : undefined,
    };
  }

  /**
   * Generate resource ID (short UUID format)
   * @param {string} resourceType - The resource type
   * @returns {string} - Short UUID (8-10 characters)
   */
  generateResourceId(resourceType) {
    return this.generateShortUuid(resourceType);
  }

  /**
   * Generate short UUID for resource ID and element IDs
   * @param {string} resourceType - The resource type (optional)
   * @returns {string} - Short UUID (8-10 characters)
   */
  generateShortUuid(resourceType = null) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    const length = Math.floor(Math.random() * 3) + 8; // Random length between 8-10

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (resourceType) {
      const prefix = resourceType.toLowerCase().substring(0, 2); // First 2 chars of resource type
      return `${prefix}${result}`;
    }

    return result;
  }

  /**
   * Transform to FHIR Patient Contact
   * @param {Object} contact - Contact object
   * @returns {Object} - Valid FHIR Patient Contact
   */
  transformContact(contact) {
    if (!contact) return null;

    let relationship = undefined;
    if (contact.relationship) {
      if (Array.isArray(contact.relationship)) {
        relationship = contact.relationship
          .map((rel) => this.transformCodeableConcept(rel))
          .filter(Boolean);
      } else {
        const transformed = this.transformCodeableConcept(contact.relationship);
        if (transformed) {
          relationship = [transformed];
        }
      }
    }

    const result = {
      relationship: relationship,
      name: contact.name ? this.transformHumanName(contact.name) : undefined,
      telecom: contact.telecom
        ? contact.telecom.map((telecom) => this.transformContactPoint(telecom)).filter(Boolean)
        : undefined,
      address: contact.address ? this.transformAddress(contact.address) : undefined,
      gender: contact.gender ? this.transformCode(contact.gender) : undefined,
      organization: contact.organization
        ? this.transformReference(contact.organization)
        : undefined,
      period: contact.period ? this.transformPeriod(contact.period) : undefined,
    };

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform to FHIR Patient Communication
   * @param {Object} communication - Communication object
   * @returns {Object} - Valid FHIR Patient Communication
   */
  transformCommunication(communication) {
    if (!communication) return null;

    const result = {
      language: communication.language
        ? this.transformCodeableConcept(communication.language)
        : undefined,
      preferred: communication.preferred,
    };

    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });

    return result;
  }

  /**
   * Transform to FHIR Patient Link
   * @param {Object} link - Link object
   * @returns {Object} - Valid FHIR Patient Link
   */
  transformLink(link) {
    if (!link) return null;
    const result = {
      other: link.other ? this.transformReference(link.other) : undefined,
      type: link.type ? this.transformCode(link.type) : undefined,
    };
    Object.keys(result).forEach((key) => {
      if (result[key] === undefined) delete result[key];
    });
    return result;
  }

  /**
   * Generate narrative text for a resource
   * @param {Object} resource - The resource object
   * @returns {Object} - Narrative object
   */
  generateNarrativeText(resource) {
    let text = '';

    if (resource.name && resource.name.length > 0) {
      const primaryName = resource.name.find((n) => n.use === 'official') || resource.name[0];
      text += `<strong>${primaryName.text || primaryName.given?.join(' ') || ''}</strong>`;
    }

    if (resource.gender) {
      text += ` (${resource.gender})`;
    }

    const language = resource.language;
    let divAttributes = 'xmlns="http://www.w3.org/1999/xhtml"';

    if (language) {
      const normLang = String(language).replace('_', '-');
      divAttributes += ` lang="${normLang}" xml:lang="${normLang}"`;
      const isRtl = /^(ar|he|fa|ur|ps|sd|ug|yi|dv|ks|ku|nqo|prs|ckb)(-|$)/i.test(normLang);
      if (isRtl) divAttributes += ' dir="rtl"';
    }

    return {
      status: 'generated',
      div: `<div ${divAttributes}>${text}</div>`,
    };
  }

  /**
   * Transform to FHIR Count
   * @param {Object} count - Count object
   * @returns {Object} - Valid FHIR Count
   */
  transformCount(count) {
    return this.transformQuantity(count);
  }

  /**
   * Transform to FHIR Distance
   * @param {Object} distance - Distance object
   * @returns {Object} - Valid FHIR Distance
   */
  transformDistance(distance) {
    return this.transformQuantity(distance);
  }

  /**
   * Transform to FHIR Duration
   * @param {Object} duration - Duration object
   * @returns {Object} - Valid FHIR Duration
   */
  transformDuration(duration) {
    return this.transformQuantity(duration);
  }

  /**
   * Transform to FHIR Age
   * @param {Object} age - Age object
   * @returns {Object} - Valid FHIR Age
   */
  transformAge(age) {
    return this.transformQuantity(age);
  }

  /**
   * Transform to FHIR Timing
   * @param {Object} timing - Timing object
   * @returns {Object} - Valid FHIR Timing
   */
  transformTiming(timing) {
    if (!timing) return null;

    const result = {};

    if (timing.event && Array.isArray(timing.event)) {
      result.event = timing.event;
    }

    if (timing.repeat) {
      const repeat = {};
      if (timing.repeat.boundsDuration)
        repeat.boundsDuration = this.transformDuration(timing.repeat.boundsDuration);
      if (timing.repeat.boundsRange)
        repeat.boundsRange = this.transformRange(timing.repeat.boundsRange);
      if (timing.repeat.boundsPeriod)
        repeat.boundsPeriod = this.transformPeriod(timing.repeat.boundsPeriod);
      if (timing.repeat.count !== undefined) repeat.count = timing.repeat.count;
      if (timing.repeat.countMax !== undefined) repeat.countMax = timing.repeat.countMax;
      if (timing.repeat.duration !== undefined) repeat.duration = timing.repeat.duration;
      if (timing.repeat.durationMax !== undefined) repeat.durationMax = timing.repeat.durationMax;
      if (timing.repeat.durationUnit) repeat.durationUnit = timing.repeat.durationUnit;
      if (timing.repeat.frequency !== undefined) repeat.frequency = timing.repeat.frequency;
      if (timing.repeat.frequencyMax !== undefined)
        repeat.frequencyMax = timing.repeat.frequencyMax;
      if (timing.repeat.period !== undefined) repeat.period = timing.repeat.period;
      if (timing.repeat.periodMax !== undefined) repeat.periodMax = timing.repeat.periodMax;
      if (timing.repeat.periodUnit) repeat.periodUnit = timing.repeat.periodUnit;
      if (timing.repeat.dayOfWeek && Array.isArray(timing.repeat.dayOfWeek))
        repeat.dayOfWeek = timing.repeat.dayOfWeek;
      if (timing.repeat.timeOfDay && Array.isArray(timing.repeat.timeOfDay))
        repeat.timeOfDay = timing.repeat.timeOfDay;
      if (timing.repeat.when && Array.isArray(timing.repeat.when)) repeat.when = timing.repeat.when;
      if (timing.repeat.offset !== undefined) repeat.offset = timing.repeat.offset;

      if (Object.keys(repeat).length > 0) {
        result.repeat = repeat;
      }
    }

    if (timing.code) {
      result.code = this.transformCodeableConcept(timing.code);
    }

    return Object.keys(result).length > 0 ? result : null;
  }
}

export default FHIRDataType;
