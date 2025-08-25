import { object, alternatives, string, number, array, boolean, date } from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  identifierInputSchema,
  periodInputSchema,
  moneyInputSchema,
} from './inputSchema';

/**
 * CoverageEligibilityResponse Input Schema
 */

// Benefit Schema
const benefitInputSchema = object({
  type: alternatives().try(string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Benefit type is required',
  }),
  allowedUnsignedInt: number().integer().min(0),
  allowedString: string(),
  allowedMoney: moneyInputSchema,
  usedUnsignedInt: number().integer().min(0),
  usedString: string(),
  usedMoney: moneyInputSchema,
});

// Item Schema
const itemInputSchema = object({
  category: alternatives().try(string(), codeableConceptInputSchema),
  productOrService: alternatives().try(string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Product or service is required for item',
  }),
  modifier: array().items(alternatives().try(string(), codeableConceptInputSchema)),
  provider: referenceInputSchema,
  excluded: boolean(),
  name: string(),
  description: string(),
  network: alternatives().try(string(), codeableConceptInputSchema),
  unit: alternatives().try(string(), codeableConceptInputSchema),
  term: alternatives().try(string(), codeableConceptInputSchema),
  benefit: array().items(benefitInputSchema),
  authorizationRequired: boolean(),
  authorizationSupporting: array().items(alternatives().try(string(), codeableConceptInputSchema)),
  authorizationUrl: string().uri(),
});

// Insurance Schema
const insuranceInputSchema = object({
  coverage: referenceInputSchema.required().messages({
    'any.required': 'Insurance coverage reference is required',
  }),
  inforce: boolean(),
  benefitPeriod: periodInputSchema,
  item: array().items(itemInputSchema),
});

// Error Schema
const errorInputSchema = object({
  code: alternatives().try(string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Error code is required',
  }),
});

// Main CoverageEligibilityResponse Schema
const coverageEligibilityResponseInputSchema = object({
  resourceType: string().valid('CoverageEligibilityResponse').required().messages({
    'any.required': 'Resource type is required and must be "CoverageEligibilityResponse"',
    'any.only': 'Resource type must be "CoverageEligibilityResponse"',
  }),
  language: string()
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
  identifier: array().items(identifierInputSchema),
  status: string().valid('active', 'cancelled', 'draft', 'entered-in-error').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be one of: active, cancelled, draft, entered-in-error',
  }),
  purpose: array()
    .items(string().valid('auth-requirements', 'benefits', 'discovery', 'validation'))
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
  servicedDate: date().iso(),
  servicedPeriod: periodInputSchema,
  created: date().iso().messages({
    'date.format': 'Created date must be in ISO format',
  }),
  requestor: referenceInputSchema.required().messages({
    'any.required': 'Requestor reference is required',
  }),
  request: referenceInputSchema.required().messages({
    'any.required': 'Request reference is required',
  }),
  outcome: string().valid('queued', 'complete', 'error', 'partial').required().messages({
    'any.required': 'Outcome is required',
    'any.only': 'Outcome must be one of: queued, complete, error, partial',
  }),
  disposition: string(),
  insurer: referenceInputSchema.required().messages({
    'any.required': 'Insurer reference is required',
  }),
  insurance: array().items(insuranceInputSchema),
  preAuthRef: string(),
  form: alternatives().try(string(), codeableConceptInputSchema),
  error: array().items(errorInputSchema),
  extension: array().items(extensionInputSchema),
  modifierExtension: array().items(extensionInputSchema),
});

export default coverageEligibilityResponseInputSchema;
