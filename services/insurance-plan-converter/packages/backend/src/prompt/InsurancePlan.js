export const buildInsurancePlanPrompt = ({ inputKind, inputData, profileUrl }) => {
  const profileLine = profileUrl
    ? `- Set meta.profile to ["${profileUrl}"].`
    : '- Set meta.profile to ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/InsurancePlan"].';

  return `You are an expert FHIR engineer. Convert the provided insurance plan input into valid FHIR R4 resources that are strictly compliant with NRCES/NDHM implementation guides.
  
  Respond ONLY with a single valid JSON object. Do not include markdown, explanations, or extra text.

  Output policy:
  - Output ONLY JSON with no commentary or explanation.
  - The output MUST conform to the NRCES/NDHM InsurancePlan StructureDefinition and SHALL validate successfully.
  - ${profileLine}
  - Every resource MUST include:
    * "id" (short unique id string).
    * "meta.profile".
    * "text" with a valid XHTML narrative div (text.div SHALL wrap in <div xmlns="http://www.w3.org/1999/xhtml">…</div>).
  - Use ISO 8601 dates for all date fields.
  - All CodeableConcept fields MUST contain:
    * coding.system (from the required or example ValueSets),
    * coding.code,
    * coding.display,
    * text (when available).
    Plain "text" alone is NOT sufficient — coding SHALL be populated.
  - Identifiers MUST contain a system URI and a value.
  - References (e.g., ownedBy, administeredBy) SHALL contain reference and display.
  - If the input contains multiple insurance plans, output a FHIR Bundle of type "collection" containing one entry per InsurancePlan.
  - Otherwise, output a single InsurancePlan resource object.
  - Populate all mandatory and required elements according to NRCES/NDHM rules.
  - Do not include explanations, comments, or text outside valid JSON.

  Required ValueSet Bindings (apply strictly):
  - InsurancePlan.language → CommonLanguages (preferred)  
    http://hl7.org/fhir/ValueSet/languages
  - InsurancePlan.status → PublicationStatus (required)  
    http://hl7.org/fhir/ValueSet/publication-status|4.0.1
  - InsurancePlan.type → InsurancePlanType (example)  
    https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-insuranceplan-type
  - InsurancePlan.contact.purpose → ContactEntityType (extensible)  
    http://hl7.org/fhir/ValueSet/contactentity-type
  - InsurancePlan.coverage.type → CoverageType (example)  
    https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-coverage-type
  - InsurancePlan.coverage.benefit.type → BenefitType (example)  
    https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefit-type
  - InsurancePlan.plan.type → PlanType (example)  
    https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-plan-type
  - InsurancePlan.plan.specificCost.category → BenefitCategory (example)  
    https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-benefitcategory
  - InsurancePlan.plan.specificCost.benefit.type → ProductorService (example)  
    https://nrces.in/ndhm/fhir/r4/ValueSet/ndhm-productorservice
  - InsurancePlan.plan.specificCost.benefit.cost.applicability → BenefitCostApplicability (required)  
    http://hl7.org/fhir/ValueSet/insuranceplan-applicability|4.0.1

  Constraints to enforce:
  - dom-2: Contained resources SHALL NOT contain nested Resources.
  - dom-3: Contained resources SHALL be referenced elsewhere or reference the container.
  - dom-4: Contained resources SHALL NOT have meta.versionId or meta.lastUpdated.
  - dom-5: Contained resources SHALL NOT have a security label.
  - dom-6: A resource SHALL have narrative text.div.
  - ele-1: All elements must have a @value or children.
  - ext-1: Extensions must have either extensions or value[x], not both.
  - ipn-1: The organization SHALL have at least a name or an identifier (preferably both).

  Input kind: ${inputKind}
  Input data follows below. Parse, normalize, and map carefully to FHIR fields while ensuring NRCES/NDHM compliance.

  <<<BEGIN_INPUT>>>
  ${inputData}
  <<<END_INPUT>>>`;
};
