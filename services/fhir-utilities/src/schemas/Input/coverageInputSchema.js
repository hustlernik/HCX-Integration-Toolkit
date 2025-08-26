import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  periodInputSchema,
  identifierInputSchema,
  quantityInputSchema,
  moneyInputSchema,
} from './inputSchema.js';

const coverageInputSchema = Joi.object({
  resourceType: Joi.string().valid('Coverage').required(),
  status: Joi.string().valid('active', 'cancelled', 'draft', 'entered-in-error').required(),
  beneficiary: Joi.alternatives().try(Joi.string(), referenceInputSchema).required(),
  payor: Joi.array()
    .items(Joi.alternatives().try(Joi.string(), referenceInputSchema))
    .min(1)
    .required(),

  identifier: Joi.array().items(identifierInputSchema),
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  policyHolder: Joi.alternatives().try(Joi.string(), referenceInputSchema),
  subscriber: Joi.alternatives().try(Joi.string(), referenceInputSchema),
  subscriberId: Joi.string(),
  dependent: Joi.string(),
  relationship: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  period: periodInputSchema,
  order: Joi.number().integer().positive(),
  network: Joi.string(),

  class: Joi.array().items(
    Joi.object({
      extension: Joi.array().items(extensionInputSchema),
      modifierExtension: Joi.array().items(extensionInputSchema),
      type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
      value: Joi.string().required(),
      name: Joi.string(),
    }),
  ),

  costToBeneficiary: Joi.array().items(
    Joi.object({
      extension: Joi.array().items(extensionInputSchema),
      modifierExtension: Joi.array().items(extensionInputSchema),
      type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
      valueQuantity: quantityInputSchema,
      valueMoney: moneyInputSchema,
      exception: Joi.array().items(
        Joi.object({
          extension: Joi.array().items(extensionInputSchema),
          modifierExtension: Joi.array().items(extensionInputSchema),
          type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required(),
          period: periodInputSchema,
        }),
      ),
    }),
  ),

  subrogation: Joi.boolean(),
  contract: Joi.array().items(Joi.alternatives().try(Joi.string(), referenceInputSchema)),

  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
})
  .custom((value, helpers) => {
    if (value.costToBeneficiary && Array.isArray(value.costToBeneficiary)) {
      for (const cost of value.costToBeneficiary) {
        const hasValueQuantity = cost.valueQuantity !== undefined;
        const hasValueMoney = cost.valueMoney !== undefined;

        if (!hasValueQuantity && !hasValueMoney) {
          return helpers.error('Cost to beneficiary must have either valueQuantity or valueMoney');
        }
        if (hasValueQuantity && hasValueMoney) {
          return helpers.error('Cost to beneficiary cannot have both valueQuantity and valueMoney');
        }
      }
    }

    return value;
  })
  .messages({
    'any.required': '{{#label}} is required according to NDHM profile',
    'array.min': '{{#label}} must have at least {{#limit}} item(s) according to NDHM profile',
  });

export default coverageInputSchema;
