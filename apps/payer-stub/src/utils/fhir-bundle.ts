import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

/**
 * Prepare a FHIR CoverageEligibilityResponse Bundle
 * @param adjudicationData The CoverageEligibilityResponse resource
 * @param requestFhirId The FHIR resource ID of the original CoverageEligibilityRequest
 * @returns The created FHIR Bundle (with ID)
 */

export async function prepareCoverageEligibilityResponseBundle(
  adjudicationData: any,
  requestFhirId: string,
  requestDocFallback?: any,
) {
  const fhirBase = 'http://hapi.fhir.org/baseR4';

  let requestResource: any;
  if (requestDocFallback && typeof requestDocFallback === 'object') {
    requestResource = requestDocFallback;
  } else {
    const reqRes = await axios.get(`${fhirBase}/CoverageEligibilityRequest/${requestFhirId}`);
    requestResource = reqRes.data;
  }

  adjudicationData.resourceType = 'CoverageEligibilityResponse';
  adjudicationData.meta = adjudicationData.meta || {};
  adjudicationData.meta.profile = [
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/CoverageEligibilityResponse',
  ];
  if (!adjudicationData.identifier) {
    adjudicationData.identifier = [
      {
        system: 'https://your-system/coverage-eligibility-response',
        value: adjudicationData.id || uuidv4(),
      },
    ];
  }
  if (!adjudicationData.status) adjudicationData.status = 'active';
  if (!adjudicationData.purpose && requestResource.purpose)
    adjudicationData.purpose = requestResource.purpose;
  if (!adjudicationData.patient && requestResource.patient)
    adjudicationData.patient = requestResource.patient;
  if (!adjudicationData.insurer && requestResource.insurer)
    adjudicationData.insurer = requestResource.insurer;
  if (!adjudicationData.request)
    adjudicationData.request = { reference: `CoverageEligibilityRequest/${requestResource.id}` };
  if (!adjudicationData.outcome) adjudicationData.outcome = 'complete';
  if (!adjudicationData.created) adjudicationData.created = new Date().toISOString();

  if (adjudicationData.insurance && Array.isArray(adjudicationData.insurance)) {
    adjudicationData.insurance = adjudicationData.insurance.map((ins: any) => ({
      coverage: ins.policyNumber ? { reference: `Coverage/${ins.policyNumber}` } : undefined,
      inforce: ins.inforce,
      benefitPeriod: ins.benefitPeriod,
      item: Array.isArray(ins.items)
        ? ins.items.map((item: any) => {
            const fhirItem: any = {};
            if (item.category && (item.category.code || item.category.display)) {
              fhirItem.category = {
                coding: [
                  {
                    code: item.category.code,
                    display: item.category.display,
                  },
                ],
              };
            }
            if (
              item.productOrService &&
              (item.productOrService.code || item.productOrService.display)
            ) {
              fhirItem.productOrService = {
                coding: [
                  {
                    code: item.productOrService.code,
                    display: item.productOrService.display,
                  },
                ],
              };
            }
            if (typeof item.excluded === 'boolean') fhirItem.excluded = item.excluded;
            if (item.name) fhirItem.name = item.name;
            if (item.description) fhirItem.description = item.description;
            if (item.network) fhirItem.network = item.network;
            if (item.unit) fhirItem.unit = item.unit;
            if (item.term) fhirItem.term = item.term;

            if (Array.isArray(item.benefits)) {
              fhirItem.benefit = item.benefits.map((ben: any) => {
                const fhirBenefit: any = {};
                if (ben.type) {
                  fhirBenefit.type = { coding: [{ code: ben.type }] };
                }
                if (ben.allowedMoney) fhirBenefit.allowedMoney = ben.allowedMoney;
                if (ben.allowedUnsignedInt) fhirBenefit.allowedUnsignedInt = ben.allowedUnsignedInt;
                if (ben.allowedString) fhirBenefit.allowedString = ben.allowedString;
                if (ben.usedUnsignedInt) fhirBenefit.usedUnsignedInt = ben.usedUnsignedInt;
                if (ben.usedString) fhirBenefit.usedString = ben.usedString;
                if (ben.usedMoney) fhirBenefit.usedMoney = ben.usedMoney;
                return fhirBenefit;
              });
            }
            if (typeof item.authorizationRequired === 'boolean')
              fhirItem.authorizationRequired = item.authorizationRequired;
            if (Array.isArray(item.authorizationSupporting))
              fhirItem.authorizationSupporting = item.authorizationSupporting;
            if (item.authorizationUrl) fhirItem.authorizationUrl = item.authorizationUrl;
            return fhirItem;
          })
        : [],
    }));
  }

  if (adjudicationData.form && adjudicationData.form.code) {
    adjudicationData.form = {
      coding: [
        {
          code: adjudicationData.form.code,
          display: adjudicationData.form.display || undefined,
        },
      ],
    };
  }

  if (adjudicationData.adjudication) {
    adjudicationData.extension = adjudicationData.extension || [];
    adjudicationData.extension.push({
      url: 'https://your-system/StructureDefinition/adjudication-info',
      valueAdjudication: {
        adjudicatedBy: adjudicationData.adjudication.adjudicatedBy,
        adjudicationNotes: adjudicationData.adjudication.adjudicationNotes,
        adjudicatedAt: adjudicationData.adjudication.adjudicatedAt,
        selectedByAdjudicator: adjudicationData.adjudication.selectedByAdjudicator,
      },
    });
    delete adjudicationData.adjudication;
  }

  if (adjudicationData.errors && Array.isArray(adjudicationData.errors)) {
    adjudicationData.error = adjudicationData.errors.map((err: any) => ({
      code: err.code ? { coding: [{ code: err.code }] } : undefined,
      message: err.message,
    }));
    delete adjudicationData.errors;
  }

  if (adjudicationData.servicedDate) {
    adjudicationData.servicedDate = new Date(adjudicationData.servicedDate)
      .toISOString()
      .split('T')[0];
  }
  if (adjudicationData.servicedPeriod) {
    if (adjudicationData.servicedPeriod.start)
      adjudicationData.servicedPeriod.start = new Date(adjudicationData.servicedPeriod.start)
        .toISOString()
        .split('T')[0];
    if (adjudicationData.servicedPeriod.end)
      adjudicationData.servicedPeriod.end = new Date(adjudicationData.servicedPeriod.end)
        .toISOString()
        .split('T')[0];
  }

  const references: string[] = [];
  if (requestResource.patient?.reference) references.push(requestResource.patient.reference);
  if (requestResource.insurer?.reference) references.push(requestResource.insurer.reference);
  if (requestResource.provider?.reference) references.push(requestResource.provider.reference);
  if (Array.isArray(requestResource.insurance)) {
    requestResource.insurance.forEach((ins: any) => {
      if (ins.coverage?.reference) references.push(ins.coverage.reference);
    });
  }
  if (Array.isArray(requestResource.item)) {
    requestResource.item.forEach((item: any) => {
      if (Array.isArray(item.diagnosis)) {
        item.diagnosis.forEach((diag: any) => {
          if (diag.diagnosisReference?.reference)
            references.push(diag.diagnosisReference.reference);
        });
      }
    });
  }

  const uniqueRefs = Array.from(new Set(references));

  const referencedResources: any[] = [];
  const refMap: Record<string, string> = {};
  for (const ref of uniqueRefs) {
    try {
      const res = await axios.get(`${fhirBase}/${ref}`);
      const resource = res.data;
      const id = resource.id || uuidv4();
      const fullUrl = `urn:uuid:${id}`;
      referencedResources.push({ fullUrl, resource });
      refMap[ref] = fullUrl;
    } catch (err) {}
  }

  const requestId = requestResource.id || uuidv4();
  const responseId = adjudicationData.id || uuidv4();
  const requestFullUrl = `urn:uuid:${requestId}`;
  const responseFullUrl = `urn:uuid:${responseId}`;

  function updateRefs(obj: any) {
    if (Array.isArray(obj)) {
      obj.forEach(updateRefs);
    } else if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        if (key === 'reference' && typeof obj[key] === 'string' && refMap[obj[key]]) {
          obj[key] = refMap[obj[key]];
        } else {
          updateRefs(obj[key]);
        }
      }
    }
  }
  updateRefs(requestResource);
  updateRefs(adjudicationData);

  adjudicationData.request = { reference: requestFullUrl };

  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      { fullUrl: responseFullUrl, resource: adjudicationData },
      { fullUrl: requestFullUrl, resource: requestResource },
      ...referencedResources,
    ],
  };

  try {
    const bundleRes = await axios.post(`${fhirBase}/Bundle`, bundle, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    return bundleRes.data;
  } catch (err) {
    logger.debug?.('Failed to post bundle to FHIR server, returning local bundle:', err);
    return bundle;
  }
}

export async function prepareClaimResponseBundle(
  adjudicationData: any,
  requestFhirId: string,
  requestDocFallback?: any,
) {
  const fhirBase = process.env.FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4';

  let requestResource: any = null;
  try {
    const reqRes = await axios.get(`${fhirBase}/Claim/${requestFhirId}`);
    requestResource = reqRes.data;
  } catch {
    if (requestDocFallback) {
      requestResource = {
        resourceType: 'Claim',
        id: requestFhirId,
        status: requestDocFallback.status || 'active',
        type: requestDocFallback.type ? { coding: [{ code: requestDocFallback.type }] } : undefined,
        use: requestDocFallback.use || 'claim',
        patient: requestDocFallback.patient?.id
          ? { reference: `Patient/${requestDocFallback.patient.id}` }
          : undefined,
        insurer: requestDocFallback.insurer?.id
          ? { reference: `Organization/${requestDocFallback.insurer.id}` }
          : undefined,
        provider: requestDocFallback.provider?.id
          ? { reference: `Organization/${requestDocFallback.provider.id}` }
          : undefined,
        insurance: Array.isArray(requestDocFallback.insurance)
          ? requestDocFallback.insurance.map((ins: any) => ({
              focal: !!ins.focal,
              coverage: ins.coverage?.id ? { reference: `Coverage/${ins.coverage.id}` } : undefined,
            }))
          : undefined,
        item: Array.isArray(requestDocFallback.item)
          ? requestDocFallback.item.map((it: any) => ({
              productOrService: it.productOrService
                ? { coding: [{ code: it.productOrService }] }
                : undefined,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              net: it.net,
            }))
          : undefined,
        total: requestDocFallback.total,
      };
    } else {
      throw new Error('Original Claim not found on FHIR server and no fallback provided');
    }
  }

  adjudicationData.resourceType = 'ClaimResponse';
  adjudicationData.meta = adjudicationData.meta || {};
  adjudicationData.meta.profile = [
    'https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClaimResponse',
  ];
  if (!adjudicationData.identifier) {
    adjudicationData.identifier = [
      {
        system: 'https://your-system/claim-response',
        value: adjudicationData.id || uuidv4(),
      },
    ];
  }
  if (!adjudicationData.status) adjudicationData.status = 'active';
  if (!adjudicationData.patient && requestResource.patient)
    adjudicationData.patient = requestResource.patient;
  if (!adjudicationData.insurer && requestResource.insurer)
    adjudicationData.insurer = requestResource.insurer;
  if (!adjudicationData.request)
    adjudicationData.request = { reference: `Claim/${requestResource.id}` };
  if (!adjudicationData.outcome) adjudicationData.outcome = 'complete';
  if (!adjudicationData.created) adjudicationData.created = new Date().toISOString();

  if (Array.isArray(adjudicationData.adjudication)) {
    adjudicationData.adjudication = adjudicationData.adjudication
      .flatMap((wrap: any) => (Array.isArray(wrap?.adjudication) ? wrap.adjudication : [wrap]))
      .map((a: any) => ({
        category: a?.category ? { coding: [{ code: a.category }] } : undefined,
        reason: a?.reason ? { coding: [{ code: a.reason }] } : undefined,
        amount: a?.amount,
        value: typeof a?.value === 'number' ? a.value : undefined,
      }));
  }

  if (Array.isArray(adjudicationData.item)) {
    adjudicationData.item = adjudicationData.item.map((it: any, index: number) => ({
      itemSequence: index + 1,
      adjudication: Array.isArray(it?.adjudication)
        ? it.adjudication
            .flatMap((wrap: any) =>
              Array.isArray(wrap?.adjudication) ? wrap.adjudication : [wrap],
            )
            .map((a: any) => ({
              category: a?.category ? { coding: [{ code: a.category }] } : undefined,
              reason: a?.reason ? { coding: [{ code: a.reason }] } : undefined,
              amount: a?.amount,
              value: typeof a?.value === 'number' ? a.value : undefined,
            }))
        : [],
    }));
  }

  if (Array.isArray(adjudicationData.addItem)) {
    adjudicationData.addItem = adjudicationData.addItem.map((ai: any) => ({
      productOrService: ai.productOrService
        ? { coding: [{ code: ai.productOrService }] }
        : undefined,
      programCode: Array.isArray(ai.programCode)
        ? ai.programCode.map((c: string) => ({ coding: [{ code: c }] }))
        : undefined,
      quantity: ai.quantity,
      unitPrice: ai.unitPrice,
      factor: ai.factor,
      net: ai.net,
      bodySite: ai.bodySite ? { coding: [{ code: ai.bodySite }] } : undefined,
      subSite: Array.isArray(ai.subSite)
        ? ai.subSite.map((s: string) => ({ coding: [{ code: s }] }))
        : undefined,
      adjudication: Array.isArray(ai?.adjudication)
        ? ai.adjudication
            .flatMap((wrap: any) =>
              Array.isArray(wrap?.adjudication) ? wrap.adjudication : [wrap],
            )
            .map((a: any) => ({
              category: a?.category ? { coding: [{ code: a.category }] } : undefined,
              reason: a?.reason ? { coding: [{ code: a.reason }] } : undefined,
              amount: a?.amount,
              value: typeof a?.value === 'number' ? a.value : undefined,
            }))
        : [],
    }));
  }

  if (Array.isArray(adjudicationData.total)) {
    adjudicationData.total = adjudicationData.total.map((t: any) => ({
      category: t?.category ? { coding: [{ code: t.category }] } : undefined,
      amount: t?.amount,
    }));
  }

  if (Array.isArray(adjudicationData.processNote)) {
    adjudicationData.processNote = adjudicationData.processNote.map((pn: any, idx: number) => ({
      number: pn.number || idx + 1,
      type: pn.type,
      text: pn.text || '',
    }));
  }

  if (adjudicationData.payment) {
    adjudicationData.payment = {
      type: adjudicationData.payment.type
        ? { coding: [{ code: adjudicationData.payment.type }] }
        : undefined,
      adjustment: adjudicationData.payment.adjustment,
      adjustmentReason: adjudicationData.payment.adjustmentReason
        ? { coding: [{ code: adjudicationData.payment.adjustmentReason }] }
        : undefined,
      amount: adjudicationData.payment.amount,
      date: adjudicationData.payment.date,
      identifier: adjudicationData.payment.identifier,
    };
  }

  if (adjudicationData.error) {
    if (Array.isArray(adjudicationData.error)) {
      adjudicationData.error = adjudicationData.error.map((e: any) => ({
        code: e?.code ? { coding: [{ code: e.code }] } : undefined,
      }));
    } else if (typeof adjudicationData.error === 'string') {
      adjudicationData.error = [{ code: { coding: [{ code: adjudicationData.error }] } }];
    }
  }

  const references: string[] = [];
  if (requestResource.patient?.reference) references.push(requestResource.patient.reference);
  if (requestResource.insurer?.reference) references.push(requestResource.insurer.reference);
  if (requestResource.provider?.reference) references.push(requestResource.provider.reference);
  if (Array.isArray(requestResource.insurance)) {
    requestResource.insurance.forEach((ins: any) => {
      if (ins.coverage?.reference) references.push(ins.coverage.reference);
    });
  }
  if (Array.isArray(requestResource.item)) {
    requestResource.item.forEach((item: any) => {
      if (Array.isArray(item.diagnosis)) {
        item.diagnosis.forEach((diag: any) => {
          if (diag.diagnosisReference?.reference)
            references.push(diag.diagnosisReference.reference);
        });
      }
    });
  }
  const uniqueRefs = Array.from(new Set(references));

  const referencedResources: any[] = [];
  const refMap: Record<string, string> = {};
  for (const ref of uniqueRefs) {
    try {
      const res = await axios.get(`${fhirBase}/${ref}`);
      const resource = res.data;
      const id = resource.id || uuidv4();
      const fullUrl = `urn:uuid:${id}`;
      referencedResources.push({ fullUrl, resource });
      refMap[ref] = fullUrl;
    } catch {}
  }

  const requestId = requestResource.id || uuidv4();
  const responseId = adjudicationData.id || uuidv4();
  const requestFullUrl = `urn:uuid:${requestId}`;
  const responseFullUrl = `urn:uuid:${responseId}`;

  const visited = new WeakSet<object>();
  const MAX_DEPTH = 1000;
  function updateRefs(obj: any, depth: number = 0) {
    if (!obj) return;
    if (depth > MAX_DEPTH) return;
    if (Array.isArray(obj)) {
      for (const item of obj) updateRefs(item, depth + 1);
      return;
    }
    if (typeof obj === 'object') {
      if (visited.has(obj)) return;
      visited.add(obj);
      for (const key of Object.keys(obj)) {
        const val = (obj as any)[key];
        if (key === 'reference' && typeof val === 'string' && refMap[val]) {
          (obj as any)[key] = refMap[val];
        } else {
          updateRefs(val, depth + 1);
        }
      }
    }
  }
  updateRefs(requestResource, 0);
  updateRefs(adjudicationData, 0);

  adjudicationData.request = requestFullUrl;

  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      { fullUrl: responseFullUrl, resource: adjudicationData },
      { fullUrl: requestFullUrl, resource: requestResource },
      ...referencedResources,
    ],
  };

  const bundleRes = await axios.post(`${fhirBase}/Bundle`, bundle, {
    headers: { 'Content-Type': 'application/fhir+json' },
  });
  return bundleRes.data;
}

export async function prepareCommunicationRequestBundle(
  input: {
    reasonCode: string;
    reasonDisplay?: string;
    message: string;
    dueDate?: string;
    correlationId?: string;
    priority?: 'routine' | 'urgent' | 'asap' | 'stat';
    category?: { code: string; display?: string; system?: string };
    medium?: Array<{ code: string; display?: string; system?: string }>;
    attachments?: Array<{ title?: string; contentType: string; data: string }>;
  },
  claimFhirId: string,
  claimDocFallback?: any,
) {
  const fhirBase = 'http://hapi.fhir.org/baseR4';

  let claimResource: any = null;
  try {
    const res = await axios.get(`${fhirBase}/Claim/${claimFhirId}`);
    claimResource = res.data;
  } catch {
    if (claimDocFallback) {
      claimResource = {
        resourceType: 'Claim',
        id: claimFhirId,
        status: claimDocFallback.status || 'active',
        use: claimDocFallback.use || 'claim',
        patient: claimDocFallback.patient?.id
          ? { reference: `Patient/${claimDocFallback.patient.id}` }
          : undefined,
        insurer: claimDocFallback.insurer?.id
          ? { reference: `Organization/${claimDocFallback.insurer.id}` }
          : undefined,
        provider: claimDocFallback.provider?.id
          ? { reference: `Organization/${claimDocFallback.provider.id}` }
          : undefined,
      };
    } else {
      throw new Error('Claim not found for CommunicationRequest');
    }
  }

  const commReq: any = {
    resourceType: 'CommunicationRequest',
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/CommunicationRequest'],
    },
    status: 'active',
    authoredOn: new Date().toISOString(),
    subject: claimResource.patient,
    about: [{ reference: `Claim/${claimResource.id}` }],

    reasonCode: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason',
            code: input.reasonCode,
            display: input.reasonDisplay,
          },
        ],
      },
    ],
    payload: [
      { contentString: input.message || 'Please provide additional information.' },
      ...(input.attachments || []).map((att) => ({
        contentAttachment: {
          title: att.title,
          contentType: att.contentType,
          data: att.data,
          url: (att as any).url,
          language: (att as any).language,
          creation: (att as any).creation,
        },
      })),
    ],
  };
  if (input.category) {
    commReq.category = [
      {
        coding: [
          {
            code: input.category.code,
            display: input.category.display,
            system: input.category.system,
          },
        ],
      },
    ];
  }

  if (input.medium && input.medium.length > 0) {
    commReq.medium = input.medium.map((m) => ({
      coding: [{ code: m.code, display: m.display, system: m.system }],
    }));
  }

  if (input.priority) {
    commReq.priority = input.priority;
  }
  if (input.dueDate) {
    commReq.occurrenceDateTime = input.dueDate;
  }

  if (input.correlationId) {
    commReq.identifier = [{ system: 'urn:ietf:rfc:3986', value: input.correlationId }];
  }

  if (claimResource.insurer) {
    commReq.requester = claimResource.insurer; // Organization reference
  }
  if (claimResource.provider) {
    commReq.recipient = [claimResource.provider];
  }

  const refs: string[] = [];
  if (claimResource.patient?.reference) refs.push(claimResource.patient.reference);
  if (claimResource.insurer?.reference) refs.push(claimResource.insurer.reference);
  if (claimResource.provider?.reference) refs.push(claimResource.provider.reference);
  const uniqueRefs = Array.from(new Set(refs));

  const refEntries: any[] = [];
  for (const ref of uniqueRefs) {
    try {
      const res = await axios.get(`${fhirBase}/${ref}`);
      refEntries.push({ fullUrl: `urn:uuid:${res.data.id}`, resource: res.data });
    } catch (err) {
      logger.debug?.(`Failed to fetch resource ${ref}:`, err);
    }
  }

  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      { fullUrl: `urn:uuid:${commReq.id || uuidv4()}`, resource: commReq },
      { fullUrl: `urn:uuid:${claimResource.id}`, resource: claimResource },
      ...refEntries,
    ],
  };

  try {
    const postRes = await axios.post(`${fhirBase}/Bundle`, bundle, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    return postRes.data;
  } catch {
    return bundle;
  }
}

export async function prepareCommunicationResponseBundle(
  input: {
    message: string;
    attachments?: any[];
    responseToRequestId: string;
    status?: string;
  },
  claimFhirId: string,
  claimDocFallback?: any,
) {
  const fhirBase = 'http://hapi.fhir.org/baseR4';

  let claimResource: any = null;
  try {
    const res = await axios.get(`${fhirBase}/Claim/${claimFhirId}`);
    claimResource = res.data;
  } catch {
    if (claimDocFallback) {
      claimResource = {
        resourceType: 'Claim',
        id: claimFhirId,
        status: claimDocFallback.status || 'active',
        use: claimDocFallback.use || 'claim',
        patient: claimDocFallback.patient?.id
          ? { reference: `Patient/${claimDocFallback.patient.id}` }
          : undefined,
        insurer: claimDocFallback.insurer?.id
          ? { reference: `Organization/${claimDocFallback.insurer.id}` }
          : undefined,
        provider: claimDocFallback.provider?.id
          ? { reference: `Organization/${claimDocFallback.provider.id}` }
          : undefined,
      };
    } else {
      throw new Error('Claim not found for Communication response');
    }
  }

  const communication: any = {
    resourceType: 'Communication',
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Communication'],
    },
    status: input.status || 'completed',
    subject: claimResource.patient,
    about: [{ reference: `Claim/${claimResource.id}` }],
    payload: [
      { contentString: input.message || 'Response from provider with requested information.' },
    ],
    sent: new Date().toISOString(),
    inResponseTo: input.responseToRequestId
      ? [{ reference: `CommunicationRequest/${input.responseToRequestId}` }]
      : undefined,
  };

  if (input.attachments && input.attachments.length > 0) {
    const attachmentPayloads = input.attachments.map((attachment: any) => ({
      contentAttachment: {
        contentType: attachment.contentType || 'application/pdf',
        url: attachment.url,
        title: attachment.title || 'Supporting Document',
        size: attachment.size,
      },
    }));
    communication.payload.push(...attachmentPayloads);
  }

  const refs: string[] = [];
  if (claimResource.patient?.reference) refs.push(claimResource.patient.reference);
  if (claimResource.insurer?.reference) refs.push(claimResource.insurer.reference);
  if (claimResource.provider?.reference) refs.push(claimResource.provider.reference);
  const uniqueRefs = Array.from(new Set(refs));

  const refEntries: any[] = [];
  for (const ref of uniqueRefs) {
    try {
      const res = await axios.get(`${fhirBase}/${ref}`);
      refEntries.push({ fullUrl: `urn:uuid:${res.data.id}`, resource: res.data });
    } catch (err) {
      logger.debug?.(`Failed to fetch resource ${ref}:`, err);
    }
  }

  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      { fullUrl: `urn:uuid:${communication.id || uuidv4()}`, resource: communication },
      { fullUrl: `urn:uuid:${claimResource.id}`, resource: claimResource },
      ...refEntries,
    ],
  };

  try {
    const postRes = await axios.post(`${fhirBase}/Bundle`, bundle, {
      headers: { 'Content-Type': 'application/fhir+json' },
    });
    return postRes.data;
  } catch {
    return bundle;
  }
}
