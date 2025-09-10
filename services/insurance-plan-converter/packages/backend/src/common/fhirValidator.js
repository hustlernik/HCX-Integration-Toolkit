function validateFhirResource(resource) {
  const errors = [];
  const warnings = [];

  if (!resource || typeof resource !== 'object') {
    return { isValid: false, errors: ['Resource is not an object'], warnings };
  }
  if (resource.resourceType !== 'InsurancePlan') {
    return { isValid: false, errors: ['resourceType must be InsurancePlan'], warnings };
  }

  return { isValid: true, errors, warnings };
}

export { validateFhirResource };
