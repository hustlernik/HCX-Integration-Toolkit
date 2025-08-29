import claimInputSchema from '../schemas/Input/claimInputSchema.js';
import FHIRDataTypeUtils from '../utils/fhir-datatype-utils.js';

class Claim {
  constructor() {
    this.datatypeUtils = new FHIRDataTypeUtils();
  }

  /**
   * Create a FHIR Claim resource from input data
   * @param {Object} input - Input data
   * @returns {Object} - FHIR Claim resource
   */

  createClaim(input) {
    try {
      const { error, value } = claimInputSchema.validate(input);
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
    } catch {
      return {
        success: false,
        error: 'Claim creation failed',
        warnings: [],
      };
    }
  }

  /**
   * Transform input data to FHIR Claim resource
   * @param {Object} input - Validated input data
   * @returns {Object} - FHIR Claim resource
   */
  transformToFHIR(input) {
    const resource = {
      resourceType: 'Claim',
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

    if (input.billablePeriod) {
      resource.billablePeriod = this.datatypeUtils.transformPeriod(input.billablePeriod);
    }

    resource.created = input.created || new Date().toISOString();

    if (input.enterer) {
      resource.enterer = this.datatypeUtils.transformReference(input.enterer);
    }

    if (input.insurer) {
      resource.insurer = this.datatypeUtils.transformReference(input.insurer);
    }

    if (input.provider) {
      resource.provider = this.datatypeUtils.transformReference(input.provider);
    }

    if (input.priority) {
      if (typeof input.priority === 'string') {
        resource.priority = this.datatypeUtils.transformCodeableConcept(input.priority);
      } else {
        resource.priority = this.datatypeUtils.transformCodeableConcept(input.priority);
      }
    }

    if (input.fundsReserve) {
      if (typeof input.fundsReserve === 'string') {
        resource.fundsReserve = this.datatypeUtils.transformCodeableConcept(input.fundsReserve);
      } else {
        resource.fundsReserve = this.datatypeUtils.transformCodeableConcept(input.fundsReserve);
      }
    }

    if (input.related && Array.isArray(input.related)) {
      resource.related = input.related
        .map((related, index) => {
          const transformed = {
            claim: related.claim ? this.datatypeUtils.transformReference(related.claim) : undefined,
            relationship: related.relationship
              ? this.datatypeUtils.transformCodeableConcept(related.relationship)
              : undefined,
            reference: related.reference
              ? this.datatypeUtils.transformIdentifier(related.reference)
              : undefined,
          };

          if (related.id) {
            transformed.id = related.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (related.extension && Array.isArray(related.extension)) {
            transformed.extension = related.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (related.modifierExtension && Array.isArray(related.modifierExtension)) {
            transformed.modifierExtension = related.modifierExtension
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

    if (input.prescription) {
      resource.prescription = this.datatypeUtils.transformReference(input.prescription);
    }

    if (input.originalPrescription) {
      resource.originalPrescription = this.datatypeUtils.transformReference(
        input.originalPrescription,
      );
    }

    if (input.payee) {
      const payee = {
        type:
          typeof input.payee.type === 'string'
            ? this.datatypeUtils.transformCodeableConcept(input.payee.type)
            : this.datatypeUtils.transformCodeableConcept(input.payee.type),
        party: input.payee.party
          ? this.datatypeUtils.transformReference(input.payee.party)
          : undefined,
      };

      if (input.payee.id) {
        payee.id = input.payee.id;
      } else {
        payee.id = this.generateElementId();
      }

      if (input.payee.extension && Array.isArray(input.payee.extension)) {
        payee.extension = input.payee.extension
          .map((ext) => this.datatypeUtils.transformExtension(ext))
          .filter(Boolean);
      }

      if (input.payee.modifierExtension && Array.isArray(input.payee.modifierExtension)) {
        payee.modifierExtension = input.payee.modifierExtension
          .map((ext) => this.datatypeUtils.transformExtension(ext))
          .filter(Boolean);
      }

      Object.keys(payee).forEach((key) => {
        if (payee[key] === undefined) delete payee[key];
      });

      resource.payee = payee;
    }

    if (input.referral) {
      resource.referral = this.datatypeUtils.transformReference(input.referral);
    }

    if (input.facility) {
      resource.facility = this.datatypeUtils.transformReference(input.facility);
    }

    if (input.careTeam && Array.isArray(input.careTeam)) {
      resource.careTeam = input.careTeam
        .map((careTeam, index) => {
          const transformed = {
            sequence: careTeam.sequence,
            provider: this.datatypeUtils.transformReference(careTeam.provider),
            responsible: careTeam.responsible,
            role: careTeam.role
              ? typeof careTeam.role === 'string'
                ? this.datatypeUtils.transformCodeableConcept(careTeam.role)
                : this.datatypeUtils.transformCodeableConcept(careTeam.role)
              : undefined,
            qualification: careTeam.qualification
              ? typeof careTeam.qualification === 'string'
                ? this.datatypeUtils.transformCodeableConcept(careTeam.qualification)
                : this.datatypeUtils.transformCodeableConcept(careTeam.qualification)
              : undefined,
          };

          if (careTeam.id) {
            transformed.id = careTeam.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (careTeam.extension && Array.isArray(careTeam.extension)) {
            transformed.extension = careTeam.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (careTeam.modifierExtension && Array.isArray(careTeam.modifierExtension)) {
            transformed.modifierExtension = careTeam.modifierExtension
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

    if (input.supportingInfo && Array.isArray(input.supportingInfo)) {
      resource.supportingInfo = input.supportingInfo
        .map((info, index) => {
          const transformed = {
            sequence: info.sequence,
            category:
              typeof info.category === 'string'
                ? this.datatypeUtils.transformCodeableConcept(info.category)
                : this.datatypeUtils.transformCodeableConcept(info.category),
            code:
              typeof info.code === 'string'
                ? this.datatypeUtils.transformCodeableConcept(info.code)
                : this.datatypeUtils.transformCodeableConcept(info.code),
            timingDate: this.datatypeUtils.normalizeToFHIRDate(info.timingDate),
            timingPeriod: info.timingPeriod
              ? this.datatypeUtils.transformPeriod(info.timingPeriod)
              : undefined,
            valueBoolean: info.valueBoolean,
            valueString: info.valueString,
            valueQuantity: info.valueQuantity
              ? this.datatypeUtils.transformQuantity(info.valueQuantity)
              : undefined,
            valueAttachment: info.valueAttachment
              ? this.datatypeUtils.transformAttachment(info.valueAttachment)
              : undefined,
            valueReference: info.valueReference
              ? this.datatypeUtils.transformReference(info.valueReference)
              : undefined,
            reason: info.reason
              ? typeof info.reason === 'string'
                ? this.datatypeUtils.transformCodeableConcept(info.reason)
                : this.datatypeUtils.transformCodeableConcept(info.reason)
              : undefined,
          };

          if (info.id) {
            transformed.id = info.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (info.extension && Array.isArray(info.extension)) {
            transformed.extension = info.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (info.modifierExtension && Array.isArray(info.modifierExtension)) {
            transformed.modifierExtension = info.modifierExtension
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

    if (input.diagnosis && Array.isArray(input.diagnosis)) {
      resource.diagnosis = input.diagnosis
        .map((diagnosis, index) => {
          const transformed = {
            sequence: diagnosis.sequence,
            diagnosisCodeableConcept: diagnosis.diagnosisCodeableConcept
              ? this.datatypeUtils.transformCodeableConcept(diagnosis.diagnosisCodeableConcept)
              : undefined,
            diagnosisReference: diagnosis.diagnosisReference
              ? this.datatypeUtils.transformReference(diagnosis.diagnosisReference)
              : undefined,
            type: diagnosis.type
              ? diagnosis.type.map((type) => this.datatypeUtils.transformCodeableConcept(type))
              : undefined,
            onAdmission: diagnosis.onAdmission
              ? this.datatypeUtils.transformCodeableConcept(diagnosis.onAdmission)
              : undefined,
            packageCode: diagnosis.packageCode
              ? this.datatypeUtils.transformCodeableConcept(diagnosis.packageCode)
              : undefined,
          };

          if (diagnosis.id) {
            transformed.id = diagnosis.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (diagnosis.extension && Array.isArray(diagnosis.extension)) {
            transformed.extension = diagnosis.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (diagnosis.modifierExtension && Array.isArray(diagnosis.modifierExtension)) {
            transformed.modifierExtension = diagnosis.modifierExtension
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

    if (input.procedure && Array.isArray(input.procedure)) {
      resource.procedure = input.procedure
        .map((procedure, index) => {
          const transformed = {
            sequence: procedure.sequence,
            type: procedure.type
              ? procedure.type.map((type) => this.datatypeUtils.transformCodeableConcept(type))
              : undefined,
            date: this.datatypeUtils.normalizeToFHIRDate(procedure.date),
            procedureCodeableConcept: procedure.procedureCodeableConcept
              ? this.datatypeUtils.transformCodeableConcept(procedure.procedureCodeableConcept)
              : undefined,
            procedureReference: procedure.procedureReference
              ? this.datatypeUtils.transformReference(procedure.procedureReference)
              : undefined,
            udi: procedure.udi
              ? procedure.udi.map((udi) => this.datatypeUtils.transformReference(udi))
              : undefined,
          };

          if (procedure.id) {
            transformed.id = procedure.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (procedure.extension && Array.isArray(procedure.extension)) {
            transformed.extension = procedure.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (procedure.modifierExtension && Array.isArray(procedure.modifierExtension)) {
            transformed.modifierExtension = procedure.modifierExtension
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

    if (input.insurance && Array.isArray(input.insurance)) {
      resource.insurance = input.insurance
        .map((insurance, index) => {
          const transformed = {
            sequence: insurance.sequence,
            focal: insurance.focal,
            identifier: insurance.identifier
              ? this.datatypeUtils.transformIdentifier(insurance.identifier)
              : undefined,
            coverage: this.datatypeUtils.transformReference(insurance.coverage),
            businessArrangement: insurance.businessArrangement,
            preAuthRef: insurance.preAuthRef,
            claimResponse: insurance.claimResponse
              ? this.datatypeUtils.transformReference(insurance.claimResponse)
              : undefined,
          };

          if (insurance.id) {
            transformed.id = insurance.id;
          } else {
            transformed.id = this.generateElementId();
          }

          if (insurance.extension && Array.isArray(insurance.extension)) {
            transformed.extension = insurance.extension
              .map((ext) => this.datatypeUtils.transformExtension(ext))
              .filter(Boolean);
          }

          if (insurance.modifierExtension && Array.isArray(insurance.modifierExtension)) {
            transformed.modifierExtension = insurance.modifierExtension
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

    if (input.accident) {
      const accident = {
        date: this.datatypeUtils.normalizeToFHIRDate(input.accident.date),
        type: input.accident.type
          ? this.datatypeUtils.transformCodeableConcept(input.accident.type)
          : undefined,
        locationAddress: input.accident.locationAddress
          ? this.datatypeUtils.transformAddress(input.accident.locationAddress)
          : undefined,
        locationReference: input.accident.locationReference
          ? this.datatypeUtils.transformReference(input.accident.locationReference)
          : undefined,
      };

      if (input.accident.id) {
        accident.id = input.accident.id;
      } else {
        accident.id = this.generateElementId();
      }

      if (input.accident.extension && Array.isArray(input.accident.extension)) {
        accident.extension = input.accident.extension
          .map((ext) => this.datatypeUtils.transformExtension(ext))
          .filter(Boolean);
      }

      if (input.accident.modifierExtension && Array.isArray(input.accident.modifierExtension)) {
        accident.modifierExtension = input.accident.modifierExtension
          .map((ext) => this.datatypeUtils.transformExtension(ext))
          .filter(Boolean);
      }

      Object.keys(accident).forEach((key) => {
        if (accident[key] === undefined) delete accident[key];
      });

      resource.accident = accident;
    }

    if (input.item && Array.isArray(input.item)) {
      resource.item = input.item
        .map((item, index) => {
          const transformed = this.transformItemToFHIR(item);
          return transformed;
        })
        .filter(Boolean);
    }

    if (input.total) {
      resource.total = this.datatypeUtils.transformMoney(input.total, 'total.currency');
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
   * Transform item to FHIR format
   * @param {Object} item - Item input
   * @returns {Object} - Transformed item
   */
  transformItemToFHIR(item) {
    const transformed = {
      sequence: item.sequence,
      careTeamSequence: item.careTeamSequence,
      diagnosisSequence: item.diagnosisSequence,
      procedureSequence: item.procedureSequence,
      informationSequence: item.informationSequence,
      revenue: item.revenue ? this.datatypeUtils.transformCodeableConcept(item.revenue) : undefined,
      category: item.category
        ? this.datatypeUtils.transformCodeableConcept(item.category)
        : undefined,
      productOrService: this.datatypeUtils.transformCodeableConcept(item.productOrService),
      modifier: item.modifier
        ? item.modifier.map((mod) => this.datatypeUtils.transformCodeableConcept(mod))
        : undefined,
      programCode: item.programCode
        ? item.programCode.map((code) => this.datatypeUtils.transformCodeableConcept(code))
        : undefined,
      servicedDate: this.datatypeUtils.normalizeToFHIRDate(item.servicedDate),
      servicedPeriod: item.servicedPeriod
        ? this.datatypeUtils.transformPeriod(item.servicedPeriod)
        : undefined,
      locationCodeableConcept: item.locationCodeableConcept
        ? this.datatypeUtils.transformCodeableConcept(item.locationCodeableConcept)
        : undefined,
      locationAddress: item.locationAddress
        ? this.datatypeUtils.transformAddress(item.locationAddress)
        : undefined,
      locationReference: item.locationReference
        ? this.datatypeUtils.transformReference(item.locationReference)
        : undefined,
      quantity: item.quantity ? this.datatypeUtils.transformQuantity(item.quantity) : undefined,
      unitPrice: item.unitPrice
        ? this.datatypeUtils.transformMoney(item.unitPrice, 'item.unitPrice.currency')
        : undefined,
      factor: item.factor,
      net: item.net ? this.datatypeUtils.transformMoney(item.net, 'item.net.currency') : undefined,
      udi: item.udi ? item.udi.map((udi) => this.datatypeUtils.transformReference(udi)) : undefined,
      bodySite: item.bodySite
        ? this.datatypeUtils.transformCodeableConcept(item.bodySite)
        : undefined,
      subSite: item.subSite
        ? item.subSite.map((site) => this.datatypeUtils.transformCodeableConcept(site))
        : undefined,
      encounter: item.encounter
        ? item.encounter.map((enc) => this.datatypeUtils.transformReference(enc))
        : undefined,
      detail: item.detail
        ? item.detail.map((detail) => this.transformItemDetailToFHIR(detail))
        : undefined,
    };

    if (item.id) {
      transformed.id = item.id;
    } else {
      transformed.id = this.generateElementId();
    }

    if (item.extension && Array.isArray(item.extension)) {
      transformed.extension = item.extension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    if (item.modifierExtension && Array.isArray(item.modifierExtension)) {
      transformed.modifierExtension = item.modifierExtension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    Object.keys(transformed).forEach((key) => {
      if (transformed[key] === undefined) delete transformed[key];
    });

    return transformed;
  }

  /**
   * Transform item detail to FHIR format
   * @param {Object} detail - Item detail input
   * @returns {Object} - Transformed item detail
   */
  transformItemDetailToFHIR(detail) {
    const transformed = {
      sequence: detail.sequence,
      revenue: detail.revenue
        ? this.datatypeUtils.transformCodeableConcept(detail.revenue)
        : undefined,
      category: detail.category
        ? this.datatypeUtils.transformCodeableConcept(detail.category)
        : undefined,
      productOrService: this.datatypeUtils.transformCodeableConcept(detail.productOrService),
      modifier: detail.modifier
        ? detail.modifier.map((mod) => this.datatypeUtils.transformCodeableConcept(mod))
        : undefined,
      programCode: detail.programCode
        ? detail.programCode.map((code) => this.datatypeUtils.transformCodeableConcept(code))
        : undefined,
      quantity: detail.quantity ? this.datatypeUtils.transformQuantity(detail.quantity) : undefined,
      unitPrice: detail.unitPrice
        ? this.datatypeUtils.transformMoney(detail.unitPrice, 'item.detail.unitPrice.currency')
        : undefined,
      factor: detail.factor,
      net: detail.net
        ? this.datatypeUtils.transformMoney(detail.net, 'item.detail.net.currency')
        : undefined,
      udi: detail.udi
        ? detail.udi.map((udi) => this.datatypeUtils.transformReference(udi))
        : undefined,
      subDetail: detail.subDetail
        ? detail.subDetail.map((subDetail) => this.transformItemSubDetailToFHIR(subDetail))
        : undefined,
    };

    if (detail.id) {
      transformed.id = detail.id;
    } else {
      transformed.id = this.generateElementId();
    }

    if (detail.extension && Array.isArray(detail.extension)) {
      transformed.extension = detail.extension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    if (detail.modifierExtension && Array.isArray(detail.modifierExtension)) {
      transformed.modifierExtension = detail.modifierExtension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    Object.keys(transformed).forEach((key) => {
      if (transformed[key] === undefined) delete transformed[key];
    });

    return transformed;
  }

  /**
   * Transform item sub-detail to FHIR format
   * @param {Object} subDetail - Item sub-detail input
   * @returns {Object} - Transformed item sub-detail
   */
  transformItemSubDetailToFHIR(subDetail) {
    const transformed = {
      sequence: subDetail.sequence,
      revenue: subDetail.revenue
        ? this.datatypeUtils.transformCodeableConcept(subDetail.revenue)
        : undefined,
      category: subDetail.category
        ? this.datatypeUtils.transformCodeableConcept(subDetail.category)
        : undefined,
      productOrService: this.datatypeUtils.transformCodeableConcept(subDetail.productOrService),
      modifier: subDetail.modifier
        ? subDetail.modifier.map((mod) => this.datatypeUtils.transformCodeableConcept(mod))
        : undefined,
      programCode: subDetail.programCode
        ? subDetail.programCode.map((code) => this.datatypeUtils.transformCodeableConcept(code))
        : undefined,
      quantity: subDetail.quantity
        ? this.datatypeUtils.transformQuantity(subDetail.quantity)
        : undefined,
      unitPrice: subDetail.unitPrice
        ? this.datatypeUtils.transformMoney(
            subDetail.unitPrice,
            'item.detail.subDetail.unitPrice.currency',
          )
        : undefined,
      factor: subDetail.factor,
      net: subDetail.net
        ? this.datatypeUtils.transformMoney(subDetail.net, 'item.detail.subDetail.net.currency')
        : undefined,
      udi: subDetail.udi
        ? subDetail.udi.map((udi) => this.datatypeUtils.transformReference(udi))
        : undefined,
    };

    if (subDetail.id) {
      transformed.id = subDetail.id;
    } else {
      transformed.id = this.generateElementId();
    }

    if (subDetail.extension && Array.isArray(subDetail.extension)) {
      transformed.extension = subDetail.extension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    if (subDetail.modifierExtension && Array.isArray(subDetail.modifierExtension)) {
      transformed.modifierExtension = subDetail.modifierExtension
        .map((ext) => this.datatypeUtils.transformExtension(ext))
        .filter(Boolean);
    }

    Object.keys(transformed).forEach((key) => {
      if (transformed[key] === undefined) delete transformed[key];
    });

    return transformed;
  }

  /**
   * Ensure FHIR constraints are met in the resource
   * @param {Object} resource - FHIR resource
   */
  ensureFHIRConstraints(resource) {
    const cleaned = this.removeEmptyElements(resource);
    this.validateExtensions(cleaned);
    return cleaned;
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
   * Generate a short UUID for element IDs
   * @returns {string} - Short UUID
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
    let narrative = 'Claim for ';

    if (resource.patient && resource.patient.display) {
      narrative += resource.patient.display;
    } else if (resource.patient && resource.patient.reference) {
      narrative += resource.patient.reference;
    } else {
      narrative += 'patient';
    }

    if (resource.status) {
      narrative += ` (${resource.status})`;
    }

    if (resource.type && resource.type.text) {
      narrative += ` - ${resource.type.text}`;
    }

    if (resource.use) {
      narrative += ` - ${resource.use}`;
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
    const id = this.datatypeUtils.generateResourceId('Claim');
    const meta = this.datatypeUtils.transformMeta({
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim'],
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
    return claimInputSchema;
  }
}

export default Claim;
