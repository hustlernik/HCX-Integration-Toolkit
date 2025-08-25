import { object, string, array, alternatives, number } from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  periodInputSchema,
  identifierInputSchema,
  quantityInputSchema,
  contactInputSchema,
} from './inputSchema';

/**
 * Insurance Plan Input Schema
 */

const claimExclusionExtensionSchema = object({
  url: string()
    .valid('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-Exclusion')
    .required(),
  valueCodeableConcept: codeableConceptInputSchema,
});

const claimSupportingInfoRequirementExtensionSchema = object({
  url: string()
    .valid('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-SupportingInfoRequirement')
    .required(),
  valueCodeableConcept: codeableConceptInputSchema,
});

const claimConditionExtensionSchema = object({
  url: string()
    .valid('https://nrces.in/ndhm/fhir/r4/StructureDefinition/Claim-Condition')
    .required(),
  valueCodeableConcept: codeableConceptInputSchema,
});

const insurancePlanInputSchema = object({
  resourceType: string().valid('InsurancePlan').required().messages({
    'any.only': 'Resource type must be InsurancePlan',
  }),

  implicitRules: string().uri(),
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

  extension: array().items(
    alternatives().try(
      extensionInputSchema,
      claimExclusionExtensionSchema,
      claimSupportingInfoRequirementExtensionSchema,
    ),
  ),
  modifierExtension: array().items(extensionInputSchema),

  identifier: array().items(identifierInputSchema).min(1).max(1).required().messages({
    'any.required': 'Exactly one identifier is required (NDHM mandatory element)',
    'array.min': 'Exactly one identifier is required (NDHM mandatory element)',
    'array.max': 'Only one identifier is allowed according to NDHM profile',
  }),

  status: string().valid('draft', 'active', 'retired', 'unknown').required().messages({
    'any.required': 'Status is required according to NDHM profile',
  }),

  type: alternatives().try(string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Type is required according to NDHM profile',
  }),

  name: string().required().messages({
    'any.required': 'Name is required according to NDHM profile',
  }),

  alias: array().items(string()),

  period: periodInputSchema.required().messages({
    'any.required': 'Period is required according to NDHM profile',
  }),

  ownedBy: referenceInputSchema.required().messages({
    'any.required': 'OwnedBy is required according to NDHM profile',
  }),

  administeredBy: referenceInputSchema,

  coverageArea: array().items(referenceInputSchema),

  contact: array().items(contactInputSchema),

  network: array().items(referenceInputSchema),

  endpoint: array().items(referenceInputSchema),

  coverage: array()
    .items(
      object({
        extension: array().items(
          alternatives().try(
            extensionInputSchema,
            claimConditionExtensionSchema,
            claimSupportingInfoRequirementExtensionSchema,
          ),
        ),
        modifierExtension: array().items(extensionInputSchema),

        type: alternatives().try(string(), codeableConceptInputSchema).required(),
        network: array().items(referenceInputSchema),

        benefit: array()
          .items(
            object({
              extension: array().items(
                alternatives().try(
                  extensionInputSchema,
                  claimConditionExtensionSchema,
                  claimSupportingInfoRequirementExtensionSchema,
                ),
              ),
              modifierExtension: array().items(extensionInputSchema),

              type: alternatives().try(string(), codeableConceptInputSchema).required(),
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

  plan: array().items(
    object({
      extension: array().items(
        alternatives().try(
          extensionInputSchema,
          claimExclusionExtensionSchema,
          claimConditionExtensionSchema,
          claimSupportingInfoRequirementExtensionSchema,
        ),
      ),
      modifierExtension: array().items(extensionInputSchema),

      identifier: array().items(identifierInputSchema),
      type: alternatives().try(string(), codeableConceptInputSchema).required(),
      coverageArea: array().items(referenceInputSchema),
      network: array().items(referenceInputSchema),

      generalCost: array().items(
        object({
          modifierExtension: array().items(extensionInputSchema),
          type: alternatives().try(string(), codeableConceptInputSchema),
          groupSize: number().integer().min(1),
          cost: quantityInputSchema,
          comment: string(),
        }),
      ),

      specificCost: array().items(
        object({
          modifierExtension: array().items(extensionInputSchema),
          category: alternatives().try(string(), codeableConceptInputSchema).required(),
          benefit: array().items(
            object({
              modifierExtension: array().items(extensionInputSchema),
              type: alternatives().try(string(), codeableConceptInputSchema).required(),
              cost: array().items(
                object({
                  type: alternatives().try(string(), codeableConceptInputSchema).required(),
                  applicability: alternatives().try(string(), codeableConceptInputSchema),
                  qualifiers: array().items(codeableConceptInputSchema),
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
