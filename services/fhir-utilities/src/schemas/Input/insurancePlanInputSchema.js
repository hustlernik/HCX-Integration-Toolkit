import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  periodInputSchema,
  identifierInputSchema,
  quantityInputSchema,
  nameInputSchema,
  contactPointInputSchema,
  addressInputSchema,
  moneyInputSchema,
} from './inputSchema.js';

/**
 * Insurance Plan Input Schema
 */

const claimExclusionExtensionSchema = Joi.object({
  url: Joi.string()
    .valid('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-Exclusion')
    .required(),
  valueCodeableConcept: codeableConceptInputSchema,
});

const claimSupportingInfoRequirementExtensionSchema = Joi.object({
  url: Joi.string()
    .valid('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-SupportingInfoRequirement')
    .required(),
  valueCodeableConcept: codeableConceptInputSchema,
});

const claimConditionExtensionSchema = Joi.object({
  url: Joi.string()
    .valid('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-Condition')
    .required(),
  valueCodeableConcept: codeableConceptInputSchema,
});

const insurancePlanContactSchema = Joi.object({
  id: Joi.string(),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
  purpose: codeableConceptInputSchema,
  name: nameInputSchema,
  telecom: Joi.array().items(contactPointInputSchema),
  address: addressInputSchema,
});

const insurancePlanInputSchema = Joi.object({
  resourceType: Joi.string().valid('InsurancePlan').required().messages({
    'any.only': 'Resource type must be InsurancePlan',
  }),

  implicitRules: Joi.string().uri(),
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

  extension: Joi.array().items(
    Joi.alternatives().try(
      extensionInputSchema,
      claimExclusionExtensionSchema,
      claimSupportingInfoRequirementExtensionSchema,
    ),
  ),
  modifierExtension: Joi.array().items(extensionInputSchema),

  identifier: Joi.array().items(identifierInputSchema).min(1).max(1).required().messages({
    'any.required': 'Exactly one identifier is required (NDHM mandatory element)',
    'array.min': 'Exactly one identifier is required (NDHM mandatory element)',
    'array.max': 'Only one identifier is allowed according to NDHM profile',
  }),

  status: Joi.string().valid('draft', 'active', 'retired', 'unknown').required().messages({
    'any.required': 'Status is required according to NDHM profile',
  }),

  type: Joi.alternatives().try(codeableConceptInputSchema).required().messages({
    'any.required': 'Type is required according to NDHM profile',
  }),

  name: Joi.string().required().messages({
    'any.required': 'Name is required according to NDHM profile',
  }),

  alias: Joi.array().items(Joi.string()),

  period: periodInputSchema.required().messages({
    'any.required': 'Period is required according to NDHM profile',
  }),

  ownedBy: referenceInputSchema.required().messages({
    'any.required': 'OwnedBy is required according to NDHM profile',
  }),

  administeredBy: referenceInputSchema,

  coverageArea: Joi.array().items(referenceInputSchema),

  contact: Joi.array().items(insurancePlanContactSchema),

  network: Joi.array().items(referenceInputSchema),

  endpoint: Joi.array().items(referenceInputSchema),

  coverage: Joi.array()
    .items(
      Joi.object({
        extension: Joi.array().items(
          Joi.alternatives().try(
            extensionInputSchema,
            claimConditionExtensionSchema,
            claimSupportingInfoRequirementExtensionSchema,
          ),
        ),
        modifierExtension: Joi.array().items(extensionInputSchema),

        type: codeableConceptInputSchema.required(),
        network: Joi.array().items(referenceInputSchema),

        benefit: Joi.array()
          .items(
            Joi.object({
              extension: Joi.array().items(
                Joi.alternatives().try(
                  extensionInputSchema,
                  claimConditionExtensionSchema,
                  claimSupportingInfoRequirementExtensionSchema,
                ),
              ),
              modifierExtension: Joi.array().items(extensionInputSchema),

              type: codeableConceptInputSchema.required(),
            }),
          )
          .min(1)
          .required()
          .messages({
            'array.min': 'At least one benefit is required for coverage',
          }),
      }),
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'Coverage is required according to NDHM profile',
      'array.min': 'At least one coverage is required according to NDHM profile',
    }),

  plan: Joi.array().items(
    Joi.object({
      extension: Joi.array().items(
        Joi.alternatives().try(
          extensionInputSchema,
          claimExclusionExtensionSchema,
          claimConditionExtensionSchema,
          claimSupportingInfoRequirementExtensionSchema,
        ),
      ),
      modifierExtension: Joi.array().items(extensionInputSchema),

      identifier: Joi.array().items(identifierInputSchema),
      type: codeableConceptInputSchema.required(),
      coverageArea: Joi.array().items(referenceInputSchema),
      network: Joi.array().items(referenceInputSchema),

      generalCost: Joi.array().items(
        Joi.object({
          modifierExtension: Joi.array().items(extensionInputSchema),
          type: codeableConceptInputSchema,
          groupSize: Joi.number().integer().min(1),
          cost: moneyInputSchema,
          comment: Joi.string(),
        }),
      ),

      specificCost: Joi.array().items(
        Joi.object({
          modifierExtension: Joi.array().items(extensionInputSchema),
          category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
          benefit: Joi.array().items(
            Joi.object({
              modifierExtension: Joi.array().items(extensionInputSchema),
              type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
              cost: Joi.array().items(
                Joi.object({
                  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
                  applicability: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
                  qualifiers: Joi.array().items(codeableConceptInputSchema),
                  value: quantityInputSchema,
                }),
              ),
            }),
          ),
        }),
      ),
    }),
  ),
}).custom((value, helpers) => {
  const hasIdentifier =
    value.identifier && Array.isArray(value.identifier) && value.identifier.length > 0;
  const hasName = value.name && value.name.trim().length > 0;

  if (!hasIdentifier && !hasName) {
    return helpers.error('any.invalid', {
      message: 'InsurancePlan must have at least one identifier or name (ipn-1 constraint)',
    });
  }

  return value;
}, 'insuranceplan-constraint');

export default insurancePlanInputSchema;
