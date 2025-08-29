import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  identifierInputSchema,
  periodInputSchema,
  moneyInputSchema,
  quantityInputSchema,
} from './inputSchema.js';

/**
 * CoverageEligibilityRequest Input Schema
 */

// Supporting Info Schema
const supportingInfoInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required().messages({
    'any.required': 'Supporting info sequence is required',
    'number.min': 'Sequence must be a positive integer',
  }),
  information: referenceInputSchema.required().messages({
    'any.required': 'Supporting info reference is required',
  }),
  appliesToAll: Joi.boolean(),
});

// Insurance Schema
const insuranceInputSchema = Joi.object({
  focal: Joi.boolean(),
  coverage: referenceInputSchema.required().messages({
    'any.required': 'Insurance coverage reference is required',
  }),
  businessArrangement: Joi.string(),
});

// Diagnosis Schema
const diagnosisInputSchema = Joi.object({
  diagnosisCodeableConcept: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  diagnosisReference: referenceInputSchema,
});

// Item Schema
const itemInputSchema = Joi.object({
  supportingInfoSequence: Joi.array().items(Joi.number().integer().min(1)),
  category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  productOrService: Joi.alternatives()
    .try(Joi.string(), codeableConceptInputSchema)
    .required()
    .messages({
      'any.required': 'Product or service is required for item',
    }),
  modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  provider: referenceInputSchema,
  quantity: quantityInputSchema,
  unitPrice: moneyInputSchema,
  facility: referenceInputSchema,
  diagnosis: Joi.array().items(diagnosisInputSchema),
  detail: Joi.array().items(referenceInputSchema),
});

// Main CoverageEligibilityRequest Schema
const coverageEligibilityRequestInputSchema = Joi.object({
  resourceType: Joi.string().valid('CoverageEligibilityRequest').required().messages({
    'any.required': 'Resource type is required and must be "CoverageEligibilityRequest"',
    'any.only': 'Resource type must be "CoverageEligibilityRequest"',
  }),
  language: Joi.string()
    .valid(
      'ar',
      'bn',
      'cs',
      'da',
      'de',
      'de-AT',
      'de-CH',
      'de-DE',
      'el',
      'en',
      'en-AU',
      'en-CA',
      'en-GB',
      'en-IN',
      'en-NZ',
      'en-SG',
      'en-US',
      'es',
      'es-AR',
      'es-ES',
      'es-UY',
      'fi',
      'fr',
      'fr-BE',
      'fr-CH',
      'fr-FR',
      'fy',
      'fy-NL',
      'hi',
      'hr',
      'it',
      'it-CH',
      'it-IT',
      'ja',
      'ko',
      'nl',
      'nl-BE',
      'nl-NL',
      'no',
      'no-NO',
      'pa',
      'pl',
      'pt',
      'pt-BR',
      'pt-PT',
      'ru',
      'ru-RU',
      'sr',
      'sr-RS',
      'sv',
      'sv-SE',
      'te',
      'zh',
      'zh-CN',
      'zh-HK',
      'zh-SG',
      'zh-TW',
    )
    .messages({
      'any.only': 'Language must be a valid language code from CommonLanguages value set',
    }),
  identifier: identifierInputSchema.required().messages({
    'any.required': 'Identifier is required',
  }),
  status: Joi.string()
    .valid('active', 'cancelled', 'draft', 'entered-in-error')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: active, cancelled, draft, entered-in-error',
    }),
  priority: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Priority is required',
  }),
  purpose: Joi.array()
    .items(Joi.string().valid('auth-requirements', 'benefits', 'discovery', 'validation'))
    .min(1)
    .required()
    .messages({
      'any.required': 'At least one purpose is required',
      'array.min': 'At least one purpose is required',
      'any.only': 'Purpose must be one of: auth-requirements, benefits, discovery, validation',
    }),
  patient: referenceInputSchema.required().messages({
    'any.required': 'Patient reference is required',
  }),
const coverageEligibilityRequestInputSchema = Joi.object({
  // … other fields …
  servicedDate: Joi.date().iso(),
  servicedPeriod: periodInputSchema,
  created: Joi.date().iso().messages({
    // … existing messages …
  }),
  // … other fields …
}).xor('servicedDate', 'servicedPeriod').messages({
  'object.xor': 'Provide either servicedDate or servicedPeriod, not both',
});
    'date.format': 'Created date must be in ISO format',
  }),
  enterer: referenceInputSchema.required().messages({
    'any.required': 'Enterer reference is required',
  }),
  provider: referenceInputSchema.required().messages({
    'any.required': 'Provider reference is required',
  }),
  insurer: referenceInputSchema.required().messages({
    'any.required': 'Insurer reference is required',
  }),
  facility: referenceInputSchema.required().messages({
    'any.required': 'Facility reference is required',
  }),
  supportingInfo: Joi.array().items(supportingInfoInputSchema),
  insurance: Joi.array().items(insuranceInputSchema).min(1).required().messages({
    'any.required': 'At least one insurance is required',
    'array.min': 'At least one insurance is required',
  }),
  item: Joi.array().items(itemInputSchema),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export default coverageEligibilityRequestInputSchema;
