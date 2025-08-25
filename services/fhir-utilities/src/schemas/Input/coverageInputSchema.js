import { object, string, alternatives, array, number, boolean } from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  periodInputSchema,
  identifierInputSchema,
  quantityInputSchema,
  moneyInputSchema,
} from './inputSchema';

const coverageInputSchema = object({
  resourceType: string().valid('Coverage').required(),
  status: string().valid('active', 'cancelled', 'draft', 'entered-in-error').required(),
  beneficiary: alternatives().try(string(), referenceInputSchema).required(),
  payor: array().items(alternatives().try(string(), referenceInputSchema)).min(1).required(),

  identifier: array().items(identifierInputSchema),
  type: alternatives().try(string(), codeableConceptInputSchema),
  policyHolder: alternatives().try(string(), referenceInputSchema),
  subscriber: alternatives().try(string(), referenceInputSchema),
  subscriberId: string(),
  dependent: string(),
  relationship: alternatives().try(string(), codeableConceptInputSchema),
  period: periodInputSchema,
  order: number().integer().positive(),
  network: string(),

  class: array().items(
    object({
      extension: array().items(extensionInputSchema),
      modifierExtension: array().items(extensionInputSchema),
      type: alternatives().try(string(), codeableConceptInputSchema).required(),
      value: string().required(),
      name: string(),
    }),
  ),

  costToBeneficiary: array().items(
    object({
      extension: array().items(extensionInputSchema),
      modifierExtension: array().items(extensionInputSchema),
      type: alternatives().try(string(), codeableConceptInputSchema),
      valueQuantity: quantityInputSchema,
      valueMoney: moneyInputSchema,
      exception: array().items(
        object({
          extension: array().items(extensionInputSchema),
          modifierExtension: array().items(extensionInputSchema),
          type: alternatives().try(string(), codeableConceptInputSchema).required(),
          period: periodInputSchema,
        }),
      ),
    }),
  ),

  subrogation: boolean(),
  contract: array().items(alternatives().try(string(), referenceInputSchema)),

  extension: array().items(extensionInputSchema),
  modifierExtension: array().items(extensionInputSchema),
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
