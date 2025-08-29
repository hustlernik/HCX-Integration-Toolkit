# FHIR Utilities Service 🏥

A scalable FHIR microservice for creating, validating, and managing FHIR resources. This service is part of the HCX Integration Toolkit and supports creating resources that comply with NRCES and NHCX-specific profiles.

## Getting Started

### Prerequisites

- Node.js 16+
- npm 8+ or yarn 1.22+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/hustlernik/Test.git
   ```
2. Navigate to the `fhir-utilities` directory:
   ```bash
   cd HCX-Integration-Toolkit/services/fhir-utilities
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

## Available Scripts

```bash
# Run in production mode
npm start

# Run in development mode with hot-reloading
npm run dev

# Lint code
npm run lint

# Lint and fix code
npm run lint:fix
```

## 🌐 API Endpoints

| Endpoint                             | Method | Description                             |
| ------------------------------------ | ------ | --------------------------------------- |
| `/health`                            | GET    | Health check endpoint                   |
| `/api/patient`                       | POST   | Create a Patient resource               |
| `/api/claim`                         | POST   | Create a Claim resource                 |
| `/api/claim-response`                | POST   | Create a ClaimResponse resource         |
| `/api/coverage-eligibility-request`  | POST   | Create a CoverageEligibilityRequest     |
| `/api/coverage-eligibility-response` | POST   | Create a CoverageEligibilityResponse    |
| `/api/insurance-plan`                | POST   | Create an InsurancePlan resource        |
| `/api/coverage`                      | POST   | Create a Coverage resource              |
| `/api/task`                          | POST   | Create a Task resource                  |
| `/api/payment-notice`                | POST   | Create a PaymentNotice resource         |
| `/api/payment-reconciliation`        | POST   | Create a PaymentReconciliation resource |

## 📝 Creating FHIR Resources

### Example: Creating a Patient Resource

```javascript
// Example request to create a Patient
const patientData = {
  identifier: [
    {
      system: 'https://healthid.ndhm.gov.in',
      value: 'patient-123',
    },
  ],
  name: [
    {
      use: 'official',
      family: 'Doe',
      given: ['John'],
    },
  ],
  gender: 'male',
  birthDate: '1990-01-01',
  telecom: [
    {
      system: 'phone',
      value: '+919876543210',
      use: 'mobile',
    },
  ],
  address: [
    {
      line: ['123 Main St'],
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'IN',
    },
  ],
};

// Using fetch API
const response = await fetch('http://localhost:3000/api/patient', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(patientData),
});

const result = await response.json();
console.log(result);
```

### Example: Creating a CoverageEligibilityRequest

```javascript
const eligibilityRequest = {
  status: 'active',
  purpose: ['validation'],
  patient: {
    reference: 'Patient/patient-123',
  },
  created: new Date().toISOString(),
  provider: {
    reference: 'Organization/org-123',
  },
  insurer: {
    reference: 'Organization/insurer-123',
  },
  insurance: [
    {
      coverage: {
        reference: 'Coverage/coverage-123',
      },
    },
  ],
  item: [
    {
      category: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/ex-benefitcategory',
            code: 'medical',
            display: 'Medical Care',
          },
        ],
      },
    },
  ],
};

const response = await fetch('http://localhost:3000/api/coverage-eligibility-request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(eligibilityRequest),
});
```

## Validation

All resources are validated against FHIR R4 specifications and NHCX-specific profiles. The service will return detailed error messages if validation fails.

### Example Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "patient.reference: Missing required property",
    "insurance[0].coverage.reference: Missing required property"
  ]
}
```

## Viewing Resource Schemas

You can view the input schema for any resource by making a GET request to the schema endpoint:

```bash
# Get schema for Patient resource
curl http://localhost:3000/api/patient/schema

# Get schema for CoverageEligibilityRequest
curl http://localhost:3000/api/coverage-eligibility-request/schema
```

## Testing with Examples

Example input files are available in the `sampleInputs/` directory. These can be used to test the various endpoints.

## External Validation

For additional validation, you can use the official FHIR validator:

[https://validator.fhir.org/](https://validator.fhir.org/)

## NHCX Compliance

When working with NHCX, ensure your resources include the required extensions and conform to the NHCX Implementation Guide. Pay special attention to:

- Required identifiers and references
- Mandatory extensions for NHCX
- Proper coding systems and value sets
- FHIR profiles specified in the NHCX IG
