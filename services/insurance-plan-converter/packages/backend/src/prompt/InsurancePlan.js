const buildInsurancePlanPrompt = ({ inputKind, inputData, profileUrl }) => {
  const profileLine = profileUrl
    ? `- Set meta.profile to ["${profileUrl}"] to comply with NRCES/NDHM if applicable.`
    : '- If no specific profile is provided, use base FHIR R4 with resourceType="InsurancePlan".';

  return `You are an expert FHIR engineer. Convert the provided insurance plan input into valid FHIR R4 resources.
  
  Output policy:
  - Output ONLY JSON with no commentary.
  - If the input contains multiple insurance plans, output a FHIR Bundle of type \"collection\" containing one entry per InsurancePlan.
  - Otherwise, output a single InsurancePlan resource object.
  - Use ISO 8601 dates.
  - Use appropriate coding systems if present; otherwise leave as plain text where allowed by base R4.
  ${profileLine}
  - Do not include explanations.
  
  Target resource: InsurancePlan (FHIR R4)
  Key elements to consider (non-exhaustive):
  - identifier (e.g., plan IDs/policy numbers)
  - name
  - status
  - type (CodeableConcept)
  - ownedBy / administeredBy (Organization references as strings if only names are available)
  - coverageArea (if available)
  - contact (telecom/address)
  - endpoint / network (if available)
  - coverage (benefits, limits)
  
  Input kind: ${inputKind}
  Input data follows below. Parse and map carefully to FHIR fields.
  
  <<<BEGIN_INPUT>>>
  ${inputData}
  <<<END_INPUT>>>`;
};

export default { buildInsurancePlanPrompt };
