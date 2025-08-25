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
 * PaymentReconciliation Input Schema
 */

// Detail Schema
const detailInputSchema = Joi.object({
  identifier: identifierInputSchema,
  predecessor: identifierInputSchema,
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Detail type is required',
  }),
  request: referenceInputSchema,
  submitter: referenceInputSchema,
  response: referenceInputSchema,
  date: Joi.date().iso(),
  responsible: referenceInputSchema,
  payee: referenceInputSchema,
  amount: moneyInputSchema,
});

// Process Note Schema
const processNoteInputSchema = Joi.object({
  type: Joi.string().valid('display', 'print', 'printoper').messages({
    'any.only': 'Note type must be one of: display, print, printoper',
  }),
  text: Joi.string(),
});

//PaymentReconciliation Schema
const paymentReconciliationInputSchema = Joi.object({
  resourceType: Joi.string().valid('PaymentReconciliation').required().messages({
    'any.required': 'Resource type is required and must be "PaymentReconciliation"',
    'any.only': 'Resource type must be "PaymentReconciliation"',
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
  period: periodInputSchema,
  created: Joi.date().iso().messages({
    'date.format': 'Created date must be in ISO format',
  }),
  paymentIssuer: referenceInputSchema,
  request: referenceInputSchema,
  requestor: referenceInputSchema,
  outcome: Joi.string().valid('queued', 'complete', 'error', 'partial').messages({
    'any.only': 'Outcome must be one of: queued, complete, error, partial',
  }),
  disposition: Joi.string(),
  paymentDate: Joi.date().iso().required().messages({
    'any.required': 'Payment date is required',
  }),
  paymentAmount: moneyInputSchema.required().messages({
    'any.required': 'Payment amount is required',
  }),
  paymentIdentifier: identifierInputSchema,
  detail: Joi.array().items(detailInputSchema),
  formCode: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  processNote: Joi.array().items(processNoteInputSchema),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export default paymentReconciliationInputSchema;
