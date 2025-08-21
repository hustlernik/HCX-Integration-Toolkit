import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

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
      claimResource = {
        resourceType: 'Claim',
        id: claimFhirId || uuidv4(),
        status: 'active',
        use: 'claim',
      };
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
    } catch {}
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
