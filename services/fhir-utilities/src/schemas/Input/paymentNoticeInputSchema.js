import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  identifierInputSchema,
  moneyInputSchema,
} from './inputSchema.js';

/**
 * PaymentNotice Input Schema

 */

const paymentNoticeInputSchema = Joi.object({
  resourceType: Joi.string().valid('PaymentNotice').required().messages({
    'any.required': 'Resource type is required and must be "PaymentNotice"',
    'any.only': 'Resource type must be "PaymentNotice"',
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
  request: referenceInputSchema,
  response: referenceInputSchema,
  created: Joi.date().iso().messages({
    'date.format': 'Created date must be in ISO format',
  }),
  provider: referenceInputSchema,
  payment: referenceInputSchema.required().messages({
    'any.required': 'Payment reference is required',
  }),
  paymentDate: Joi.date().iso(),
  payee: referenceInputSchema,
  recipient: referenceInputSchema.required().messages({
    'any.required': 'Recipient reference is required',
  }),
  amount: moneyInputSchema.required().messages({
    'any.required': 'Amount is required',
  }),
  paymentStatus: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export default paymentNoticeInputSchema;
