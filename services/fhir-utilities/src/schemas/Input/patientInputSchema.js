import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  linkInputSchema,
  attachmentInputSchema,
  contactInputSchema,
  communicationInputSchema,
  identifierInputSchema,
  nameInputSchema,
  contactPointInputSchema,
  addressInputSchema,
} from './inputSchema.js';

/**
 * Patient Input Schema
 */

const patientInputSchema = Joi.object({
  resourceType: Joi.string().valid('Patient').required().messages({
    'any.required': 'Resource type is required and must be "Patient"',
    'any.only': 'Resource type must be "Patient"',
  }),
  identifier: Joi.array().items(identifierInputSchema).min(1).required().messages({
    'any.required': 'At least one identifier is required (NDHM mandatory element)',
    'array.min': 'At least one identifier is required (NDHM mandatory element)',
  }),
  active: Joi.boolean().default(true),
  name: Joi.array().items(nameInputSchema).min(1).required().messages({
    'any.required': 'At least one name is required (NDHM mandatory element)',
    'array.min': 'At least one name is required (NDHM mandatory element)',
  }),
  telecom: Joi.array().items(contactPointInputSchema),
  gender: Joi.string().valid('male', 'female', 'other', 'unknown').required().messages({
    'any.required': 'Gender is required (NDHM mandatory element)',
    'any.only': 'Gender must be one of: male, female, other, unknown',
  }),
const patientInputSchema = Joi.object({
  birthDate: Joi.date().iso().required().messages({
    'any.required': 'Birth date is required (NDHM mandatory element)',
    'date.format': 'Birth date must be in ISO format (YYYY-MM-DD)',
  }),
  deceasedBoolean: Joi.boolean(),
  deceasedDateTime: Joi.date().iso(),
  address: Joi.array().items(addressInputSchema),
})
  .oxor('deceasedBoolean', 'deceasedDateTime')
  .oxor('multipleBirthBoolean', 'multipleBirthInteger');
  maritalStatus: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  language: Joi.alternatives().try(
    Joi.string()
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
    codeableConceptInputSchema,
  ),
  multipleBirthBoolean: Joi.boolean(),
  multipleBirthInteger: Joi.number().integer(),
  photo: Joi.array().items(attachmentInputSchema),
  contact: Joi.array().items(contactInputSchema),
  communication: Joi.array().items(communicationInputSchema),
  generalPractitioner: Joi.array().items(referenceInputSchema),
  managingOrganization: referenceInputSchema,
  link: Joi.array().items(linkInputSchema),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export default patientInputSchema;
