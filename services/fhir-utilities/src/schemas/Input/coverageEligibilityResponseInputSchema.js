import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  identifierInputSchema,
  periodInputSchema,
  moneyInputSchema,
} from './inputSchema.js';

/**
 * CoverageEligibilityResponse Input Schema
 */

// Benefit Schema
const benefitInputSchema = Joi.object({
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Benefit type is required',
  }),
  allowedUnsignedInt: Joi.number().integer().min(0),
  allowedString: Joi.string(),
  allowedMoney: moneyInputSchema,
  usedUnsignedInt: Joi.number().integer().min(0),
  usedString: Joi.string(),
  usedMoney: moneyInputSchema,
});

// Item Schema
const itemInputSchema = Joi.object({
  category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  productOrService: Joi.alternatives()
    .try(Joi.string(), codeableConceptInputSchema)
    .required()
    .messages({
      'any.required': 'Product or service is required for item',
    }),
  modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  provider: referenceInputSchema,
  excluded: Joi.boolean(),
  name: Joi.string(),
  description: Joi.string(),
  network: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  unit: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  term: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  benefit: Joi.array().items(benefitInputSchema),
  authorizationRequired: Joi.boolean(),
  authorizationSupporting: Joi.array().items(
    Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  ),
  authorizationUrl: Joi.string().uri(),
});

// Insurance Schema
const insuranceInputSchema = Joi.object({
  coverage: referenceInputSchema.required().messages({
    'any.required': 'Insurance coverage reference is required',
  }),
  inforce: Joi.boolean(),
  benefitPeriod: periodInputSchema,
  item: Joi.array().items(itemInputSchema),
});

// Error Schema
const errorInputSchema = Joi.object({
  code: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Error code is required',
  }),
});

// Main CoverageEligibilityResponse Schema
const coverageEligibilityResponseInputSchema = Joi.object({
  resourceType: Joi.string().valid('CoverageEligibilityResponse').required().messages({
    'any.required': 'Resource type is required and must be "CoverageEligibilityResponse"',
    'any.only': 'Resource type must be "CoverageEligibilityResponse"',
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
  identifier: Joi.array().items(identifierInputSchema),
  status: Joi.string()
    .valid('active', 'cancelled', 'draft', 'entered-in-error')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Status must be one of: active, cancelled, draft, entered-in-error',
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
  servicedDate: Joi.date().iso(),
  servicedPeriod: periodInputSchema,
  created: Joi.date().iso().messages({
    'date.format': 'Created date must be in ISO format',
  }),
  requestor: referenceInputSchema.required().messages({
    'any.required': 'Requestor reference is required',
  }),
  request: referenceInputSchema.required().messages({
    'any.required': 'Request reference is required',
  }),
  outcome: Joi.string().valid('queued', 'complete', 'error', 'partial').required().messages({
    'any.required': 'Outcome is required',
    'any.only': 'Outcome must be one of: queued, complete, error, partial',
  }),
  disposition: Joi.string(),
  insurer: referenceInputSchema.required().messages({
    'any.required': 'Insurer reference is required',
  }),
  insurance: Joi.array().items(insuranceInputSchema),
  preAuthRef: Joi.string(),
  form: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  error: Joi.array().items(errorInputSchema),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export default coverageEligibilityResponseInputSchema;
