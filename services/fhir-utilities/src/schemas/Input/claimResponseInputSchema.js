import Joi from 'joi';
import {
  extensionInputSchema,
  codeableConceptInputSchema,
  referenceInputSchema,
  identifierInputSchema,
  periodInputSchema,
  moneyInputSchema,
  quantityInputSchema,
  attachmentInputSchema,
  addressInputSchema,
} from './inputSchema.js';

/**
 * ClaimResponse Input Schema
 */

// Adjudication Schema
const adjudicationInputSchema = Joi.object({
  category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Adjudication category is required',
  }),
  reason: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  amount: moneyInputSchema,
  value: Joi.number(),
});

// Item Detail Schema
const itemDetailInputSchema = Joi.object({
  detailSequence: Joi.number().integer().min(1).required().messages({
    'any.required': 'Detail sequence is required',
    'number.min': 'Detail sequence must be a positive integer',
  }),
  noteNumber: Joi.array().items(Joi.number().integer().min(1)),
  adjudication: Joi.array().items(adjudicationInputSchema).min(1).required().messages({
    'any.required': 'At least one adjudication is required for detail',
    'array.min': 'At least one adjudication is required for detail',
  }),
  subDetail: Joi.array().items(
    Joi.object({
      subDetailSequence: Joi.number().integer().min(1).required().messages({
        'any.required': 'Sub-detail sequence is required',
        'number.min': 'Sub-detail sequence must be a positive integer',
      }),
      noteNumber: Joi.array().items(Joi.number().integer().min(1)),
      adjudication: Joi.array().items(adjudicationInputSchema),
    }),
  ),
});

// Item Schema
const itemInputSchema = Joi.object({
  itemSequence: Joi.number().integer().min(1).required().messages({
    'any.required': 'Item sequence is required',
    'number.min': 'Item sequence must be a positive integer',
  }),
  noteNumber: Joi.array().items(Joi.number().integer().min(1)),
  adjudication: Joi.array().items(adjudicationInputSchema).min(1).required().messages({
    'any.required': 'At least one adjudication is required for item',
    'array.min': 'At least one adjudication is required for item',
  }),
  detail: Joi.array().items(itemDetailInputSchema),
});

// Add Item Detail Schema
const addItemDetailInputSchema = Joi.object({
  productOrService: Joi.alternatives()
    .try(Joi.string(), codeableConceptInputSchema)
    .required()
    .messages({
      'any.required': 'Product or service is required for add item detail',
    }),
  modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  quantity: quantityInputSchema,
  unitPrice: moneyInputSchema,
  factor: Joi.number(),
  net: moneyInputSchema,
  noteNumber: Joi.array().items(Joi.number().integer().min(1)),
  adjudication: Joi.array().items(adjudicationInputSchema).min(1).required().messages({
    'any.required': 'At least one adjudication is required for add item detail',
    'array.min': 'At least one adjudication is required for add item detail',
  }),
  subDetail: Joi.array().items(
    Joi.object({
      productOrService: Joi.alternatives()
        .try(Joi.string(), codeableConceptInputSchema)
        .required()
        .messages({
          'any.required': 'Product or service is required for add item sub-detail',
        }),
      modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
      quantity: quantityInputSchema,
      unitPrice: moneyInputSchema,
      factor: Joi.number(),
      net: moneyInputSchema,
      noteNumber: Joi.array().items(Joi.number().integer().min(1)),
      adjudication: Joi.array().items(adjudicationInputSchema).min(1).required().messages({
        'any.required': 'At least one adjudication is required for add item sub-detail',
        'array.min': 'At least one adjudication is required for add item sub-detail',
      }),
    }),
  ),
});

// Add Item Schema
const addItemInputSchema = Joi.object({
  itemSequence: Joi.array().items(Joi.number().integer().min(1)),
  detailSequence: Joi.array().items(Joi.number().integer().min(1)),
  subdetailSequence: Joi.array().items(Joi.number().integer().min(1)),
  provider: Joi.array().items(referenceInputSchema),
  productOrService: Joi.alternatives()
    .try(Joi.string(), codeableConceptInputSchema)
    .required()
    .messages({
      'any.required': 'Product or service is required for add item',
    }),
  modifier: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  programCode: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
const addItemInputSchema = Joi.object({
  // ... other fields ...
  servicedDate: Joi.date().iso(),
  servicedPeriod: periodInputSchema,
  // ... other fields ...
})
.xor('servicedDate', 'servicedPeriod')
.messages({
  'object.xor': 'Provide either servicedDate or servicedPeriod, but not both',
});
  locationCodeableConcept: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  locationAddress: addressInputSchema,
  locationReference: referenceInputSchema,
  quantity: quantityInputSchema,
  unitPrice: moneyInputSchema,
  factor: Joi.number(),
  net: moneyInputSchema,
  bodySite: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  subSite: Joi.array().items(Joi.alternatives().try(Joi.string(), codeableConceptInputSchema)),
  noteNumber: Joi.array().items(Joi.number().integer().min(1)),
  adjudication: Joi.array().items(adjudicationInputSchema).min(1).required().messages({
    'any.required': 'At least one adjudication is required for add item',
    'array.min': 'At least one adjudication is required for add item',
  }),
  detail: Joi.array().items(addItemDetailInputSchema),
});

// Total Schema
const totalInputSchema = Joi.object({
  category: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Total category is required',
  }),
  amount: moneyInputSchema.required().messages({
    'any.required': 'Total amount is required',
  }),
});

// Payment Schema
const paymentInputSchema = Joi.object({
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Payment type is required',
  }),
  adjustment: moneyInputSchema,
  adjustmentReason: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  date: Joi.date().iso(),
  amount: moneyInputSchema.required().messages({
    'any.required': 'Payment amount is required',
  }),
  identifier: identifierInputSchema,
});

// Process Note Schema
const processNoteInputSchema = Joi.object({
  number: Joi.number().integer().min(1),
  type: Joi.string().valid('display', 'print', 'printoper').messages({
    'any.only': 'Note type must be one of: display, print, printoper',
  }),
  text: Joi.string().required().messages({
    'any.required': 'Note text is required',
  }),
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
});

// Insurance Schema
const insuranceInputSchema = Joi.object({
  sequence: Joi.number().integer().min(1).required().messages({
    'any.required': 'Insurance sequence is required',
    'number.min': 'Insurance sequence must be a positive integer',
  }),
  focal: Joi.boolean().required().messages({
    'any.required': 'Focal indicator is required',
  }),
  coverage: referenceInputSchema.required().messages({
    'any.required': 'Insurance coverage reference is required',
  }),
  businessArrangement: Joi.string(),
  claimResponse: referenceInputSchema,
});

// Error Schema
const errorInputSchema = Joi.object({
  itemSequence: Joi.number().integer().min(1),
  detailSequence: Joi.number().integer().min(1),
  subDetailSequence: Joi.number().integer().min(1),
  code: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Error code is required',
  }),
});

// Main ClaimResponse Schema
const claimResponseInputSchema = Joi.object({
  resourceType: Joi.string().valid('ClaimResponse').required().messages({
    'any.required': 'Resource type is required and must be "ClaimResponse"',
    'any.only': 'Resource type must be "ClaimResponse"',
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
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema).required().messages({
    'any.required': 'Type is required',
  }),
  subType: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  use: Joi.string().valid('claim', 'preauthorization', 'predetermination').required().messages({
    'any.required': 'Use is required',
    'any.only': 'Use must be one of: claim, preauthorization, predetermination',
  }),
  patient: referenceInputSchema.required().messages({
    'any.required': 'Patient reference is required',
  }),
  created: Joi.date().iso().messages({
    'date.format': 'Created date must be in ISO format',
  }),
  insurer: referenceInputSchema.required().messages({
    'any.required': 'Insurer reference is required',
  }),
  requestor: referenceInputSchema,
  request: referenceInputSchema,
  outcome: Joi.string().valid('queued', 'complete', 'error', 'partial').required().messages({
    'any.required': 'Outcome is required',
    'any.only': 'Outcome must be one of: queued, complete, error, partial',
  }),
  disposition: Joi.string(),
  preAuthRef: Joi.string(),
  preAuthPeriod: periodInputSchema,
  payeeType: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  item: Joi.array().items(itemInputSchema),
  addItem: Joi.array().items(addItemInputSchema),
  adjudication: Joi.array().items(adjudicationInputSchema),
  total: Joi.array().items(totalInputSchema),
  payment: paymentInputSchema,
  fundsReserve: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  formCode: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  form: attachmentInputSchema,
  processNote: Joi.array().items(processNoteInputSchema),
  communicationRequest: Joi.array().items(referenceInputSchema),
  insurance: Joi.array().items(insuranceInputSchema),
  error: Joi.array().items(errorInputSchema),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export default claimResponseInputSchema;
