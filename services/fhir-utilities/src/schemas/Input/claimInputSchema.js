import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  identifierInputSchema,
  periodInputSchema,
  moneyInputSchema,
  quantityInputSchema,
  addressInputSchema,
} from './inputSchema.js';

/**
 * Claim Input Schema
 */

// Supporting Info Schema
const supportingInfoInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required(),
  category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
  code: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
  timingDate: Joi.date().iso(),
  timingPeriod: periodInputSchema,
  valueBoolean: Joi.boolean(),
  valueString: Joi.string(),
  valueQuantity: quantityInputSchema,
  valueAttachment: Joi.object({
    contentType: Joi.string(),
    url: Joi.string().uri(),
    size: Joi.number().integer(),
    title: Joi.string(),
  }),
  valueReference: referenceInputSchema,
  reason: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
});

// Diagnosis Schema
const diagnosisInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required(),
  diagnosisCodeableConcept: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  diagnosisReference: referenceInputSchema,
  type: Joi.array()
    .items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema))
    .min(1)
    .required(),
  onAdmission: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  packageCode: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
});

// Procedure Schema
const procedureInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required(),
  type: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  date: Joi.date().iso(),
  procedureCodeableConcept: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  procedureReference: referenceInputSchema,
  udi: Joi.array().items(referenceInputSchema),
});

// Insurance Schema
const insuranceInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required(),
  focal: Joi.boolean().required(),
  identifier: identifierInputSchema,
  coverage: referenceInputSchema.required(),
  businessArrangement: Joi.string(),
  preAuthRef: Joi.array().items(Joi.string()),
  claimResponse: referenceInputSchema,
});

// Accident Schema
const accidentInputSchema = Joi.object({
  date: Joi.date().iso().required(),
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  locationAddress: addressInputSchema,
  locationReference: referenceInputSchema,
});

// Care Team Schema
const careTeamInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required(),
  provider: referenceInputSchema.required(),
  responsible: Joi.boolean(),
  role: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  qualification: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
});

// Payee Schema
const payeeInputSchema = Joi.object({
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
  party: referenceInputSchema,
});

// Related Claim Schema
const relatedClaimInputSchema = Joi.object({
  claim: referenceInputSchema,
  relationship: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  reference: identifierInputSchema,
});

// Item Detail Schema
const itemDetailInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required(),
  revenue: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  productOrService: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
  modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  programCode: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  quantity: quantityInputSchema,
  unitPrice: moneyInputSchema,
  factor: Joi.number(),
  net: moneyInputSchema,
  udi: Joi.array().items(referenceInputSchema),
  subDetail: Joi.array().items(
    Joi.object({
      sequence: Joi.number().integer().min(1).required(),
      revenue: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
      category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
      productOrService: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
      modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
      programCode: Joi.array().items(
        Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
      ),
      quantity: quantityInputSchema,
      unitPrice: moneyInputSchema,
      factor: Joi.number(),
      net: moneyInputSchema,
      udi: Joi.array().items(referenceInputSchema),
    }),
  ),
});

// Item Schema
const itemInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required(),
  careTeamSequence: Joi.array().items(Joi.number().integer().min(1)),
  diagnosisSequence: Joi.array().items(Joi.number().integer().min(1)),
  procedureSequence: Joi.array().items(Joi.number().integer().min(1)),
  informationSequence: Joi.array().items(Joi.number().integer().min(1)),
  revenue: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  productOrService: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
  modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  programCode: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  servicedDate: Joi.date().iso(),
  servicedPeriod: periodInputSchema,
  locationCodeableConcept: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  locationAddress: addressInputSchema,
  locationReference: referenceInputSchema,
  quantity: quantityInputSchema,
  unitPrice: moneyInputSchema,
  factor: Joi.number(),
  net: moneyInputSchema,
  udi: Joi.array().items(referenceInputSchema),
  bodySite: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  subSite: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  encounter: Joi.array().items(referenceInputSchema),
  detail: Joi.array().items(itemDetailInputSchema),
  id: Joi.string(),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
}).oxor('locationCodeableConcept', 'locationAddress', 'locationReference');

const claimInputSchema = Joi.object({
  resourceType: Joi.string().valid('Claim').required().messages({
    'any.required': 'Resource type is required and must be "Claim"',
    'any.only': 'Resource type must be "Claim"',
  }),
  language: Joi.string(),
  identifier: Joi.array().items(identifierInputSchema).min(1).required().messages({
    'any.required': 'At least one identifier is required (NDHM mandatory element)',
    'array.min': 'At least one identifier is required (NDHM mandatory element)',
  }),
  status: Joi.string()
    .valid('active', 'cancelled', 'draft', 'entered-in-error')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: active, cancelled, draft, entered-in-error',
    }),
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Type is required (NDHM mandatory element)',
  }),
  subType: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  use: Joi.string().valid('claim', 'preauthorization', 'predetermination').required().messages({
    'any.required': 'Use is required',
    'any.only': 'Use must be one of: claim, preauthorization, predetermination',
  }),
  patient: referenceInputSchema.required().messages({
    'any.required': 'Patient is required (NDHM mandatory element)',
  }),
  billablePeriod: periodInputSchema,
  created: Joi.date().iso().messages({
    'date.format': 'Created date must be in ISO format',
  }),
  enterer: referenceInputSchema,
  insurer: referenceInputSchema.required().messages({
    'any.required': 'Insurer is required (NDHM mandatory element)',
  }),
  provider: referenceInputSchema.required().messages({
    'any.required': 'Provider is required (NDHM mandatory element)',
  }),
  priority: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Priority is required (NDHM mandatory element)',
  }),
  fundsReserve: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  related: Joi.array().items(relatedClaimInputSchema),
  prescription: referenceInputSchema,
  originalPrescription: referenceInputSchema,
  payee: payeeInputSchema,
  referral: referenceInputSchema,
  facility: referenceInputSchema,
  careTeam: Joi.array().items(careTeamInputSchema),
  supportingInfo: Joi.array().items(supportingInfoInputSchema),
  diagnosis: Joi.array().items(diagnosisInputSchema).min(1).required().messages({
    'any.required': 'At least one diagnosis is required (NDHM mandatory element)',
    'array.min': 'At least one diagnosis is required (NDHM mandatory element)',
  }),
  procedure: Joi.array().items(procedureInputSchema),
  insurance: Joi.array().items(insuranceInputSchema).min(1).required().messages({
    'any.required': 'At least one insurance is required (NDHM mandatory element)',
    'array.min': 'At least one insurance is required (NDHM mandatory element)',
  }),
  accident: accidentInputSchema,
  item: Joi.array().items(itemInputSchema).min(1).required().messages({
    'any.required': 'At least one item is required (NDHM mandatory element)',
    'array.min': 'At least one item is required (NDHM mandatory element)',
  }),
  total: moneyInputSchema,
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export default claimInputSchema;
