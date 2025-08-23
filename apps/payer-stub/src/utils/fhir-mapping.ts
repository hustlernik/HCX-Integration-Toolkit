import { AnyObject } from 'mongoose';
import { logger } from './logger';
/**
 * Map a FHIR CoverageEligibilityRequest Bundle
 * @param bundle FHIR Bundle object
 * @returns Object matching CoverageEligibilityRequest mongoose schema
 */
export function mapCoverageEligibilityRequestBundleToModel(bundle: AnyObject): AnyObject {
  if (!bundle || bundle.resourceType !== 'Bundle' || !Array.isArray(bundle.entry)) {
    throw new Error('Invalid FHIR Bundle');
  }

  const entryMap: Record<string, any> = {};
  for (const entry of bundle.entry) {
    if (entry.resource && entry.resource.resourceType && entry.resource.id) {
      entryMap[`${entry.resource.resourceType}/${entry.resource.id}`] = entry.resource;
    }
  }

  const cerEntry = bundle.entry.find(
    (e) => e.resource?.resourceType === 'CoverageEligibilityRequest',
  );
  if (!cerEntry) throw new Error('No CoverageEligibilityRequest found in bundle');
  const cer = cerEntry.resource;

  const resolveRef = (ref?: { reference?: string }) => {
    if (!ref?.reference) return undefined;
    return entryMap[ref.reference] || undefined;
  };

  const patientResource = resolveRef(cer.patient);
  const patient = patientResource
    ? {
        id: patientResource.id || '',
        name:
          Array.isArray(patientResource.name) && patientResource.name[0]
            ? [
                patientResource.name[0].prefix,
                ...patientResource.name[0].given,
                patientResource.name[0].family,
              ]
                .filter(Boolean)
                .join(' ')
            : cer.patient?.display || '',
        dob: patientResource.birthDate || '',
        gender: patientResource.gender || '',
        identifier:
          Array.isArray(patientResource.identifier) && patientResource.identifier[0]?.value
            ? patientResource.identifier[0].value
            : '',
      }
    : {
        id: cer.patient?.reference?.split('/')?.[1] || '',
        name: cer.patient?.display || '',
        dob: '',
        gender: '',
        identifier: '',
      };

  const insurance = Array.isArray(cer.insurance)
    ? cer.insurance.map((ins: any) => {
        const coverageResource = resolveRef(ins.coverage);
        return {
          focal: ins.focal,
          coverage: coverageResource
            ? {
                id: coverageResource.id || '',
                policyNumber: coverageResource.subscriberId || '',
                status: coverageResource.status || '',
                plan:
                  Array.isArray(coverageResource.class) && coverageResource.class[0]?.value
                    ? coverageResource.class[0].value
                    : '',
                payor:
                  Array.isArray(coverageResource.payor) && coverageResource.payor[0]?.display
                    ? coverageResource.payor[0].display
                    : '',
              }
            : {
                id: ins.coverage?.reference?.split('/')?.[1] || '',
                policyNumber: '',
                status: '',
                plan: '',
                payor: '',
              },
        };
      })
    : [];

  const practitionerResource = resolveRef(cer.enterer);
  const practitioner = practitionerResource
    ? {
        id: practitionerResource.id || '',
        name:
          Array.isArray(practitionerResource.name) && practitionerResource.name[0]?.text
            ? practitionerResource.name[0].text
            : cer.enterer?.display || cer.practitioner?.display || '',
        qualification: '', // Can be extracted from qualification array if present
        identifier:
          Array.isArray(practitionerResource.identifier) &&
          practitionerResource.identifier[0]?.value
            ? practitionerResource.identifier[0].value
            : '',
      }
    : undefined;

  const orgResource = resolveRef(cer.provider);
  const organization = orgResource
    ? {
        id: orgResource.id || '',
        name: orgResource.name || cer.provider?.display || '',
        type:
          Array.isArray(orgResource.type) && orgResource.type[0]?.text
            ? orgResource.type[0].text
            : '',
        contact: {
          phone: Array.isArray(orgResource.telecom)
            ? orgResource.telecom.find((t: any) => t.system === 'phone')?.value || ''
            : '',
          email: Array.isArray(orgResource.telecom)
            ? orgResource.telecom.find((t: any) => t.system === 'email')?.value || ''
            : '',
        },
      }
    : undefined;

  let serviced = {};
  if (cer.servicedPeriod) {
    serviced = {
      period: { start: cer.servicedPeriod.start || '', end: cer.servicedPeriod.end || '' },
    };
  } else if (cer.servicedDate) {
    serviced = { date: cer.servicedDate };
  }

  const items = Array.isArray(cer.item)
    ? cer.item.map((item: any) => {
        return {
          category:
            item.category?.coding && item.category.coding[0]
              ? {
                  code: item.category.coding[0].code || '',
                  display: item.category.coding[0].display || '',
                }
              : {},
          productOrService:
            item.productOrService?.coding && item.productOrService.coding[0]
              ? {
                  code: item.productOrService.coding[0].code || '',
                  display: item.productOrService.coding[0].display || '',
                }
              : {},
          quantity: item.quantity || {},
          unitPrice: item.unitPrice || {},
          diagnoses: Array.isArray(item.diagnosis)
            ? item.diagnosis.map((diag: any) => {
                if (diag.diagnosisReference) {
                  const condResource = resolveRef(diag.diagnosisReference);
                  return condResource
                    ? {
                        id: condResource.id || '',
                        clinicalStatus: condResource.clinicalStatus?.coding?.[0]?.display || '',
                        verificationStatus:
                          condResource.verificationStatus?.coding?.[0]?.display || '',
                        category:
                          Array.isArray(condResource.category) &&
                          condResource.category[0]?.coding?.[0]?.display
                            ? condResource.category[0].coding[0].display
                            : '',
                        severity: condResource.severity?.coding?.[0]?.display || '',
                        onsetDate: condResource.onsetDateTime || '',
                        abatementDate: condResource.abatementDateTime || '',
                        bodySite:
                          Array.isArray(condResource.bodySite) &&
                          condResource.bodySite[0]?.coding?.[0]?.display
                            ? condResource.bodySite[0].coding[0].display
                            : '',
                        notes:
                          Array.isArray(condResource.note) && condResource.note[0]?.text
                            ? condResource.note[0].text
                            : '',
                      }
                    : {};
                } else if (diag.diagnosisCodeableConcept) {
                  return {
                    code: diag.diagnosisCodeableConcept.coding?.[0]?.code || '',
                    description: diag.diagnosisCodeableConcept.coding?.[0]?.display || '',
                  };
                }
                return {};
              })
            : [],
        };
      })
    : [];

  return {
    fhirRefId: cer.id || '',
    status: cer.status || 'active',
    purpose: cer.purpose || [],
    patient,
    insurance,
    practitioner,
    practitionerRole: {},
    organization,
    serviced,
    items,
    createdAt: cer.created ? new Date(cer.created) : new Date(),
    updatedAt: new Date(),
  };
}

export function mapClaimBundleToModel(bundle: AnyObject): AnyObject {
  logger.debug?.('Mapping claim bundle', undefined, { bundleType: typeof bundle });

  if (!bundle) {
    throw new Error('Bundle is null or undefined');
  }

  if (bundle.resourceType !== 'Bundle') {
    throw new Error(`Invalid resourceType: expected 'Bundle', got '${bundle.resourceType}'`);
  }

  if (!bundle.entry) {
    throw new Error('Bundle.entry is missing');
  }

  if (!Array.isArray(bundle.entry)) {
    throw new Error(`Bundle.entry is not an array, got type: ${typeof bundle.entry}`);
  }

  if (bundle.entry.length === 0) {
    throw new Error('Bundle.entry is empty');
  }

  const entryMap: Record<string, any> = {};
  for (const entry of bundle.entry) {
    if (entry.resource && entry.resource.resourceType && entry.resource.id) {
      entryMap[`${entry.resource.resourceType}/${entry.resource.id}`] = entry.resource;
    }
  }

  const claimEntry = bundle.entry.find((e) => e.resource?.resourceType === 'Claim');
  if (!claimEntry) {
    const availableTypes = bundle.entry
      .map((e) => e.resource?.resourceType)
      .filter(Boolean)
      .join(', ');
    throw new Error(`No Claim found in bundle. Available resource types: ${availableTypes}`);
  }
  const claim = claimEntry.resource;

  const resolveRef = (ref?: { reference?: string }) => {
    if (!ref?.reference) return undefined;
    return entryMap[ref.reference] || undefined;
  };

  const patientResource = resolveRef(claim.patient);
  const patient = patientResource
    ? {
        id: patientResource.id || '',
        name:
          Array.isArray(patientResource.name) && patientResource.name[0]
            ? [
                patientResource.name[0].prefix,
                ...patientResource.name[0].given,
                patientResource.name[0].family,
              ]
                .filter(Boolean)
                .join(' ')
            : claim.patient?.display || '',
        dob: patientResource.birthDate ? new Date(patientResource.birthDate) : undefined,
        gender: patientResource.gender || '',
        identifier:
          Array.isArray(patientResource.identifier) && patientResource.identifier[0]?.value
            ? patientResource.identifier[0].value
            : '',
      }
    : {
        id: claim.patient?.reference?.split('/')?.[1] || '',
        name: claim.patient?.display || '',
        dob: undefined,
        gender: '',
        identifier: '',
      };

  const entererResource = resolveRef(claim.enterer);
  const enterer = entererResource
    ? {
        id: entererResource.id || '',
        name:
          Array.isArray(entererResource.name) && entererResource.name[0]?.text
            ? entererResource.name[0].text
            : Array.isArray(entererResource.name) && entererResource.name[0]
              ? [
                  entererResource.name[0].prefix,
                  ...entererResource.name[0].given,
                  entererResource.name[0].family,
                ]
                  .filter(Boolean)
                  .join(' ')
              : claim.enterer?.display || '',
        qualification:
          Array.isArray(entererResource.qualification) &&
          entererResource.qualification[0]?.code?.text
            ? entererResource.qualification[0].code.text
            : '',
        identifier:
          Array.isArray(entererResource.identifier) && entererResource.identifier[0]?.value
            ? entererResource.identifier[0].value
            : '',
      }
    : undefined;

  const insurerResource = resolveRef(claim.insurer);
  const insurer = insurerResource
    ? {
        id: insurerResource.id || '',
        name: insurerResource.name || claim.insurer?.display || '',
        type:
          Array.isArray(insurerResource.type) && insurerResource.type[0]?.text
            ? insurerResource.type[0].text
            : '',
        contact: {
          phone: Array.isArray(insurerResource.telecom)
            ? insurerResource.telecom.find((t: any) => t.system === 'phone')?.value || ''
            : '',
          email: Array.isArray(insurerResource.telecom)
            ? insurerResource.telecom.find((t: any) => t.system === 'email')?.value || ''
            : '',
        },
      }
    : undefined;

  const providerResource = resolveRef(claim.provider);
  const provider = providerResource
    ? {
        id: providerResource.id || '',
        name: providerResource.name || claim.provider?.display || '',
        type:
          Array.isArray(providerResource.type) && providerResource.type[0]?.text
            ? providerResource.type[0].text
            : '',
        contact: {
          phone: Array.isArray(providerResource.telecom)
            ? providerResource.telecom.find((t: any) => t.system === 'phone')?.value || ''
            : '',
          email: Array.isArray(providerResource.telecom)
            ? providerResource.telecom.find((t: any) => t.system === 'email')?.value || ''
            : '',
        },
      }
    : undefined;

  const billablePeriod = claim.billablePeriod
    ? {
        start: claim.billablePeriod.start ? new Date(claim.billablePeriod.start) : undefined,
        end: claim.billablePeriod.end ? new Date(claim.billablePeriod.end) : undefined,
      }
    : {};

  const related = Array.isArray(claim.related)
    ? claim.related.map((rel: any) => ({
        RelatedClaimId: rel.claim?.reference?.split('/')?.[1] || rel.claim?.display || '',
        relationShip:
          rel.relationship?.coding?.[0]?.code || rel.relationship?.coding?.[0]?.display || '',
      }))
    : [];

  const mapPrescription = (prescriptionRef: any) => {
    if (!prescriptionRef) return {};

    const prescriptionResource = resolveRef(prescriptionRef);
    if (!prescriptionResource) return {};

    const prescription: any = {};

    if (prescriptionResource.resourceType === 'MedicationRequest') {
      prescription.medicationRequest = {
        intent: prescriptionResource.intent || 'order',
        medication:
          prescriptionResource.medicationCodeableConcept?.coding?.map(
            (c: any) => c.display || c.code,
          ) || [],
        reason:
          prescriptionResource.reasonCode?.map((r: any) => r.coding?.[0]?.display || r.text) || [],
        dosageInstruction: Array.isArray(prescriptionResource.dosageInstruction)
          ? prescriptionResource.dosageInstruction.map((d: any) => ({
              text: d.text || '',
              additionalInstruction: d.additionalInstruction?.[0]?.text || '',
            }))
          : [],
      };
    }

    if (prescriptionResource.resourceType === 'DeviceRequest') {
      prescription.deviceRequest = {
        intent: prescriptionResource.intent || 'order',
        priority: prescriptionResource.priority || '',
        reason:
          prescriptionResource.reasonCode?.map((r: any) => r.coding?.[0]?.display || r.text) || [],
        note: prescriptionResource.note?.[0]?.text || '',
        deviceRequested: prescriptionResource.codeCodeableConcept?.coding?.[0]?.display || '',
      };
    }

    if (prescriptionResource.resourceType === 'VisionPrescription') {
      prescription.visionPrescription = {
        lensSpecification: Array.isArray(prescriptionResource.lensSpecification)
          ? prescriptionResource.lensSpecification.map((lens: any) => ({
              product: lens.product?.coding?.[0]?.display || '',
              eye: lens.eye || '',
              sphere: lens.sphere || 0,
              cylinder: lens.cylinder || 0,
              axis: lens.axis || 0,
              note: lens.note?.[0]?.text || '',
              prism: Array.isArray(lens.prism)
                ? lens.prism.map((p: any) => ({
                    amount: p.amount || 0,
                    base: p.base || '',
                  }))
                : [],
              add: lens.add || 0,
              power: lens.power || 0,
              backCurve: lens.backCurve || 0,
              diameter: lens.diameter || 0,
            }))
          : [],
      };
    }

    return prescription;
  };

  const insurance = Array.isArray(claim.insurance)
    ? claim.insurance.map((ins: any) => {
        const coverageResource = resolveRef(ins.coverage);
        return {
          focal: ins.focal || false,
          coverage: coverageResource
            ? {
                id: coverageResource.id || '',
                policyNumber: coverageResource.subscriberId || '',
                status: coverageResource.status || '',
                plan:
                  Array.isArray(coverageResource.class) && coverageResource.class[0]?.value
                    ? coverageResource.class[0].value
                    : '',
                payor:
                  Array.isArray(coverageResource.payor) && coverageResource.payor[0]?.display
                    ? coverageResource.payor[0].display
                    : '',
              }
            : {
                id: ins.coverage?.reference?.split('/')?.[1] || '',
                policyNumber: '',
                status: '',
                plan: '',
                payor: '',
              },
        };
      })
    : [];

  const careTeam = Array.isArray(claim.careTeam)
    ? claim.careTeam.map((ct: any) => ({
        isResponsible: ct.responsible || false,
        role: ct.role?.coding?.[0]?.display || ct.role?.coding?.[0]?.code || '',
        qualification:
          ct.qualification?.coding?.[0]?.display || ct.qualification?.coding?.[0]?.code || '',
      }))
    : [];

  const supportingInfo = Array.isArray(claim.supportingInfo)
    ? claim.supportingInfo.map((si: any) => ({
        category: si.category?.coding?.[0]?.display || si.category?.coding?.[0]?.code || '',
        code: si.code?.coding?.[0]?.display || si.code?.coding?.[0]?.code || '',
        reason: si.reason?.coding?.[0]?.display || si.reason?.coding?.[0]?.code || '',
      }))
    : [];

  const diagnosis = Array.isArray(claim.diagnosis)
    ? claim.diagnosis.map((diag: any) => ({
        diagnosis:
          diag.diagnosisCodeableConcept?.coding?.[0]?.display ||
          diag.diagnosisCodeableConcept?.coding?.[0]?.code ||
          '',
        onAdmission:
          diag.onAdmission?.coding?.[0]?.display || diag.onAdmission?.coding?.[0]?.code || '',
        type: diag.type?.[0]?.coding?.[0]?.display || diag.type?.[0]?.coding?.[0]?.code || '',
        packageCode:
          diag.packageCode?.coding?.[0]?.display || diag.packageCode?.coding?.[0]?.code || '',
      }))
    : [];

  const procedure = Array.isArray(claim.procedure)
    ? claim.procedure.map((proc: any) => ({
        type: proc.type?.[0]?.coding?.[0]?.display || proc.type?.[0]?.coding?.[0]?.code || '',
        procedure:
          proc.procedureCodeableConcept?.coding?.[0]?.display ||
          proc.procedureCodeableConcept?.coding?.[0]?.code ||
          '',
      }))
    : [];

  const payee = claim.payee
    ? {
        type: claim.payee.type?.coding?.[0]?.display || claim.payee.type?.coding?.[0]?.code || '',
      }
    : undefined;

  const item = Array.isArray(claim.item)
    ? claim.item.map((itm: any) => ({
        revenue: itm.revenue?.coding?.[0]?.display || itm.revenue?.coding?.[0]?.code || '',
        category: itm.category?.coding?.[0]?.display || itm.category?.coding?.[0]?.code || '',
        productOrService:
          itm.productOrService?.coding?.[0]?.display ||
          itm.productOrService?.coding?.[0]?.code ||
          '',
        programCode:
          itm.programCode?.[0]?.coding?.[0]?.display ||
          itm.programCode?.[0]?.coding?.[0]?.code ||
          '',
        quantity: {
          value: itm.quantity?.value || 0,
          unit: itm.quantity?.unit || '',
          code: itm.quantity?.code || '',
        },
        unitPrice: {
          value: itm.unitPrice?.value || 0,
          currency: itm.unitPrice?.currency || '',
        },
        factor: itm.factor || 0,
        net: {
          value: itm.net?.value || 0,
          currency: itm.net?.currency || '',
        },
        bodySite: itm.bodySite?.coding?.[0]?.display || itm.bodySite?.coding?.[0]?.code || '',
        subSite:
          itm.subSite?.[0]?.coding?.[0]?.display || itm.subSite?.[0]?.coding?.[0]?.code || '',
      }))
    : [];

  const total = claim.total
    ? {
        value: claim.total.value || 0,
        currency: claim.total.currency || '',
      }
    : { value: 0, currency: '' };

  const correlationId =
    claim.identifier?.find((id: any) => id.type?.coding?.[0]?.code === 'CORR')?.value ||
    `CORR-${claim.id}-${Date.now()}`;

  return {
    claimId: claim.id || '',
    correlationId,
    fhirRefId: claim.id || '',
    status: claim.status || 'active',
    type: claim.type?.coding?.[0]?.display || claim.type?.coding?.[0]?.code || '',
    subType: claim.subType?.coding?.[0]?.display || claim.subType?.coding?.[0]?.code || '',
    use: claim.use || 'claim',
    patient,
    billablePeriod,
    created: claim.created ? new Date(claim.created) : new Date(),
    enterer,
    insurer,
    provider,
    priority: claim.priority?.coding?.[0]?.display || claim.priority?.coding?.[0]?.code || 'Normal',
    fundsReserve:
      claim.fundsReserve?.coding?.[0]?.display || claim.fundsReserve?.coding?.[0]?.code || 'None',
    related,
    prescription: mapPrescription(claim.prescription),
    originalPrescription: mapPrescription(claim.originalPrescription),
    payee,
    careTeam,
    supportingInfo,
    diagnosis,
    procedure,
    insurance,
    item,
    total,
    createdAt: claim.created ? new Date(claim.created) : new Date(),
    updatedAt: new Date(),
  };
}
