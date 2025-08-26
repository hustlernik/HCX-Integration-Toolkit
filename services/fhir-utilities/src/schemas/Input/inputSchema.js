import Joi from 'joi';

export const annotationInputSchema = Joi.object({
  authorReference: Joi.object({
    type: Joi.string(),
    reference: Joi.string().required(),
    identifier: Joi.string(),
    display: Joi.string(),
  }),
  authorString: Joi.string(),
  time: Joi.date().iso(),
  text: Joi.string().required(),
});

/**
 * Input Schema
 */
export const extensionInputSchema = Joi.object({
  url: Joi.string().uri().required(),
  valueBase64Binary: Joi.string(),
  valueBoolean: Joi.boolean(),
  valueCanonical: Joi.string().uri(),
  valueCode: Joi.string(),
  valueDate: Joi.date().iso(),
  valueDateTime: Joi.date().iso(),
  valueDecimal: Joi.number(),
  valueId: Joi.string(),
  valueInstant: Joi.date().iso(),
  valueInteger: Joi.number().integer(),
  valueMarkdown: Joi.string(),
  valueOid: Joi.string(),
  valuePositiveInt: Joi.number().integer().min(1),
  valueString: Joi.string(),
  valueTime: Joi.string(),
  valueUnsignedInt: Joi.number().integer().min(0),
  valueUri: Joi.string().uri(),
  valueUrl: Joi.string().uri(),
  valueUuid: Joi.string(),
  valueAddress: Joi.object({
    use: Joi.string().valid('home', 'work', 'temp', 'old', 'billing').default('home'),
    type: Joi.string().valid('postal', 'physical', 'both').default('physical'),
    text: Joi.string(),
    line: Joi.array().items(Joi.string()),
    city: Joi.string(),
    district: Joi.string(),
    state: Joi.string(),
    postalCode: Joi.string(),
    country: Joi.string().default('IN'),
    period: Joi.object({
      start: Joi.date().iso(),
      end: Joi.date().iso(),
    }),
  }),
  valueAge: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string(),
    system: Joi.string().uri(),
    code: Joi.string(),
  }),
  valueAnnotation: annotationInputSchema,
  valueAttachment: Joi.object({
    contentType: Joi.string(),
    language: Joi.string(),
    data: Joi.string().base64().messages({
      'string.base64': 'Data must be a valid Base64 encoded string',
    }),
    url: Joi.string().uri(),
    size: Joi.number().integer().positive(),
    hash: Joi.string(),
    title: Joi.string(),
    creation: Joi.date().iso(),
  }),
  valueCodeableConcept: Joi.alternatives().try(
    Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }),
    Joi.object({
      coding: Joi.array()
        .items(
          Joi.object({
            system: Joi.string().uri(),
            version: Joi.string(),
            code: Joi.string().required(),
            display: Joi.string(),
            userSelected: Joi.boolean(),
          }),
        )
        .min(1),
      text: Joi.string(),
    }),
  ),
  valueCoding: Joi.object({
    system: Joi.string().uri(),
    version: Joi.string(),
    code: Joi.string(),
    display: Joi.string(),
    userSelected: Joi.boolean(),
  }),
  valueContactPoint: Joi.object({
    system: Joi.string().valid('phone', 'fax', 'email', 'pager', 'url', 'sms', 'other').required(),
    value: Joi.string().required(),
    use: Joi.string().valid('home', 'work', 'temp', 'old', 'mobile').default('home'),
    rank: Joi.number().integer().min(1),
    period: Joi.object({
      start: Joi.date().iso(),
      end: Joi.date().iso(),
    }),
  }),
  valueCount: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string(),
    system: Joi.string().uri(),
    code: Joi.string(),
  }),
  valueDistance: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string(),
    system: Joi.string().uri(),
    code: Joi.string(),
  }),
  valueDuration: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string(),
    system: Joi.string().uri(),
    code: Joi.string(),
  }),
  valueHumanName: Joi.object({
    use: Joi.string()
      .valid('usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden')
      .default('official'),
    text: Joi.string(),
    family: Joi.string().required(),
    given: Joi.array().items(Joi.string()).min(1).required(),
    prefix: Joi.array().items(Joi.string()),
    suffix: Joi.array().items(Joi.string()),
    period: Joi.object({
      start: Joi.date().iso(),
      end: Joi.date().iso(),
    }),
  }),
  valueIdentifier: Joi.object({
    use: Joi.string().valid('usual', 'official', 'temp', 'secondary', 'old').default('official'),
    type: Joi.alternatives().try(
      Joi.string(),
      Joi.object({
        code: Joi.string().required(),
        display: Joi.string(),
        text: Joi.string(),
      }),
    ),
    value: Joi.string().required(),
    period: Joi.object({
      start: Joi.date().iso(),
      end: Joi.date().iso(),
    }),
    assigner: Joi.object({
      type: Joi.string(),
      reference: Joi.string().required(),
      identifier: Joi.string(),
      display: Joi.string(),
    }),
  }),
  valueMoney: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string(),
    system: Joi.string().uri(),
    code: Joi.string(),
  }),
  valuePeriod: Joi.object({
    start: Joi.date().iso(),
    end: Joi.date().iso(),
  }),
  valueQuantity: Joi.object({
    value: Joi.number().required(),
    unit: Joi.string(),
    system: Joi.string().uri(),
    code: Joi.string(),
  }),
  valueRange: Joi.object({
    low: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
    high: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
  }),
  valueRatio: Joi.object({
    numerator: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
    denominator: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
  }),
  valueReference: Joi.object({
    type: Joi.string(),
    reference: Joi.string().required(),
    identifier: Joi.string(),
    display: Joi.string(),
  }),
  valueSampledData: Joi.object({
    origin: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
    period: Joi.number().required(),
    factor: Joi.number(),
    lowerLimit: Joi.number(),
    upperLimit: Joi.number(),
    dimensions: Joi.number().integer().min(1),
    data: Joi.string(),
  }),
  valueSignature: Joi.object({
    type: Joi.array().items(
      Joi.object({
        system: Joi.string().uri(),
        version: Joi.string(),
        code: Joi.string(),
        display: Joi.string(),
      }),
    ),
    when: Joi.date().iso(),
    who: Joi.object({
      type: Joi.string(),
      reference: Joi.string().required(),
      identifier: Joi.string(),
      display: Joi.string(),
    }),
    onBehalfOf: Joi.object({
      type: Joi.string(),
      reference: Joi.string().required(),
      identifier: Joi.string(),
      display: Joi.string(),
    }),
    targetFormat: Joi.string(),
    sigFormat: Joi.string(),
    data: Joi.string(),
  }),
  valueTiming: Joi.object({
    event: Joi.array().items(Joi.date().iso()),
    repeat: Joi.object({
      boundsDuration: Joi.object({
        value: Joi.number().required(),
        unit: Joi.string(),
        system: Joi.string().uri(),
        code: Joi.string(),
      }),
      boundsRange: Joi.object({
        low: Joi.object({
          value: Joi.number().required(),
          unit: Joi.string(),
          system: Joi.string().uri(),
          code: Joi.string(),
        }),
        high: Joi.object({
          value: Joi.number().required(),
          unit: Joi.string(),
          system: Joi.string().uri(),
          code: Joi.string(),
        }),
      }),
      boundsPeriod: Joi.object({
        start: Joi.date().iso(),
        end: Joi.date().iso(),
      }),
      count: Joi.number().integer(),
      countMax: Joi.number().integer(),
      duration: Joi.number(),
      durationMax: Joi.number(),
      durationUnit: Joi.string().valid('h', 'd', 'wk', 'mo', 'a'),
      frequency: Joi.number().integer(),
      frequencyMax: Joi.number().integer(),
      period: Joi.number(),
      periodMax: Joi.number(),
      periodUnit: Joi.string().valid('h', 'd', 'wk', 'mo', 'a'),
      dayOfWeek: Joi.array().items(
        Joi.string().valid('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'),
      ),
      timeOfDay: Joi.array().items(Joi.string()),
      when: Joi.array().items(
        Joi.string().valid(
          'MORN',
          'MORN.early',
          'MORN.late',
          'NOON',
          'AFT',
          'AFT.early',
          'AFT.late',
          'EVE',
          'EVE.early',
          'EVE.late',
          'NIGHT',
          'PHS',
          'HS',
          'WAKE',
          'C',
          'CM',
          'CD',
          'CV',
          'AC',
          'ACM',
          'ACD',
          'ACV',
          'PC',
          'PCM',
          'PCD',
          'PCV',
        ),
      ),
      offset: Joi.number().integer(),
    }),
    code: Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }),
  }),
  valueContactDetail: Joi.object({
    name: Joi.string(),
    telecom: Joi.array().items(
      Joi.object({
        system: Joi.string()
          .valid('phone', 'fax', 'email', 'pager', 'url', 'sms', 'other')
          .required(),
        value: Joi.string().required(),
        use: Joi.string().valid('home', 'work', 'temp', 'old', 'mobile').default('home'),
        rank: Joi.number().integer().min(1),
        period: Joi.object({
          start: Joi.date().iso(),
          end: Joi.date().iso(),
        }),
      }),
    ),
  }),
  valueContributor: Joi.object({
    type: Joi.string().valid('author', 'editor', 'reviewer', 'endorser'),
    name: Joi.string().required(),
    contact: Joi.array().items(
      Joi.object({
        system: Joi.string()
          .valid('phone', 'fax', 'email', 'pager', 'url', 'sms', 'other')
          .required(),
        value: Joi.string().required(),
        use: Joi.string().valid('home', 'work', 'temp', 'old', 'mobile').default('home'),
        rank: Joi.number().integer().min(1),
        period: Joi.object({
          start: Joi.date().iso(),
          end: Joi.date().iso(),
        }),
      }),
    ),
  }),
  valueDataRequirement: Joi.object({
    type: Joi.string().required(),
    profile: Joi.array().items(Joi.string().uri()),
    subjectCodeableConcept: Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }),
    subjectReference: Joi.object({
      type: Joi.string(),
      reference: Joi.string().required(),
      identifier: Joi.string(),
      display: Joi.string(),
    }),
    mustSupport: Joi.array().items(Joi.string()),
    codeFilter: Joi.array().items(
      Joi.object({
        path: Joi.string(),
        searchParam: Joi.string(),
        valueSet: Joi.string().uri(),
        code: Joi.array().items(
          Joi.object({
            code: Joi.string().required(),
            display: Joi.string(),
            text: Joi.string(),
          }),
        ),
      }),
    ),
    dateFilter: Joi.array().items(
      Joi.object({
        path: Joi.string(),
        searchParam: Joi.string(),
        valueDateTime: Joi.date().iso(),
        valuePeriod: Joi.object({
          start: Joi.date().iso(),
          end: Joi.date().iso(),
        }),
        valueDuration: Joi.object({
          value: Joi.number().required(),
          unit: Joi.string(),
          system: Joi.string().uri(),
          code: Joi.string(),
        }),
      }),
    ),
    limit: Joi.number().integer().min(1),
    sort: Joi.array().items(
      Joi.object({
        path: Joi.string().required(),
        direction: Joi.string().valid('ascending', 'descending'),
      }),
    ),
  }),
  valueExpression: Joi.object({
    description: Joi.string(),
    name: Joi.string(),
    language: Joi.string().valid('text/cql', 'text/fhirpath', 'application/x-fhir-query'),
    expression: Joi.string(),
    reference: Joi.string().uri(),
  }),
  valueParameterDefinition: Joi.object({
    name: Joi.string().required(),
    use: Joi.string().required(),
    min: Joi.number().integer(),
    max: Joi.string(),
    documentation: Joi.string(),
    type: Joi.string().required(),
    profile: Joi.string().uri(),
  }),
  valueRelatedArtifact: Joi.object({
    type: Joi.string()
      .valid(
        'documentation',
        'justification',
        'citation',
        'predecessor',
        'successor',
        'derived-from',
        'depends-on',
        'composed-of',
      )
      .required(),
    label: Joi.string(),
    display: Joi.string(),
    citation: Joi.string(),
    url: Joi.string().uri(),
    document: Joi.object({
      contentType: Joi.string(),
      url: Joi.string().uri(),
      size: Joi.number().integer(),
      title: Joi.string(),
    }),
    resource: Joi.string().uri(),
  }),
  valueTriggerDefinition: Joi.object({
    type: Joi.string()
      .valid(
        'named-event',
        'periodic',
        'data-changed',
        'data-added',
        'data-modified',
        'data-removed',
        'data-accessed',
        'data-access-ended',
      )
      .required(),
    name: Joi.string(),
    timingTiming: Joi.object({
      event: Joi.array().items(Joi.date().iso()),
      repeat: Joi.object({
        boundsDuration: Joi.object({
          value: Joi.number().required(),
          unit: Joi.string(),
          system: Joi.string().uri(),
          code: Joi.string(),
        }),
        boundsRange: Joi.object({
          low: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
          high: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
        }),
        boundsPeriod: Joi.object({
          start: Joi.date().iso(),
          end: Joi.date().iso(),
        }),
        count: Joi.number().integer(),
        countMax: Joi.number().integer(),
        duration: Joi.number(),
        durationMax: Joi.number(),
        durationUnit: Joi.string().valid('h', 'd', 'wk', 'mo', 'a'),
        frequency: Joi.number().integer(),
        frequencyMax: Joi.number().integer(),
        period: Joi.number(),
        periodMax: Joi.number(),
        periodUnit: Joi.string().valid('h', 'd', 'wk', 'mo', 'a'),
        dayOfWeek: Joi.array().items(
          Joi.string().valid('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'),
        ),
        timeOfDay: Joi.array().items(Joi.string()),
        when: Joi.array().items(
          Joi.string().valid(
            'MORN',
            'MORN.early',
            'MORN.late',
            'NOON',
            'AFT',
            'AFT.early',
            'AFT.late',
            'EVE',
            'EVE.early',
            'EVE.late',
            'NIGHT',
            'PHS',
            'HS',
            'WAKE',
            'C',
            'CM',
            'CD',
            'CV',
            'AC',
            'ACM',
            'ACD',
            'ACV',
            'PC',
            'PCM',
            'PCD',
            'PCV',
          ),
        ),
        offset: Joi.number().integer(),
      }),
      code: Joi.object({
        code: Joi.string().required(),
        display: Joi.string(),
        text: Joi.string(),
      }),
    }),
    timingReference: Joi.object({
      type: Joi.string(),
      reference: Joi.string().required(),
      identifier: Joi.string(),
      display: Joi.string(),
    }),
    timingDate: Joi.date().iso(),
    timingDateTime: Joi.date().iso(),
    data: Joi.array().items(
      Joi.object({
        type: Joi.string()
          .valid('string', 'Coding', 'Quantity', 'Reference', 'boolean', 'Expression')
          .required(),
        profile: Joi.array().items(Joi.string().uri()),
        subjectCodeableConcept: Joi.object({
          code: Joi.string().required(),
          display: Joi.string(),
          text: Joi.string(),
        }),
        subjectReference: Joi.object({
          type: Joi.string(),
          reference: Joi.string().required(),
          identifier: Joi.string(),
          display: Joi.string(),
        }),
        mustSupport: Joi.array().items(Joi.string()),
        codeFilter: Joi.array().items(
          Joi.object({
            path: Joi.string(),
            searchParam: Joi.string(),
            valueSet: Joi.string().uri(),
            code: Joi.array().items(
              Joi.object({
                code: Joi.string().required(),
                display: Joi.string(),
                text: Joi.string(),
              }),
            ),
          }),
        ),
        dateFilter: Joi.array().items(
          Joi.object({
            path: Joi.string(),
            searchParam: Joi.string(),
            valueDateTime: Joi.date().iso(),
            valuePeriod: Joi.object({
              start: Joi.date().iso(),
              end: Joi.date().iso(),
            }),
            valueDuration: Joi.object({
              value: Joi.number().required(),
              unit: Joi.string(),
              system: Joi.string().uri(),
              code: Joi.string(),
            }),
          }),
        ),
        limit: Joi.number().integer().min(1),
        sort: Joi.array().items(
          Joi.object({
            path: Joi.string().required(),
            direction: Joi.string().valid('ascending', 'descending'),
          }),
        ),
      }),
    ),
    condition: Joi.object({
      expression: Joi.string(),
      language: Joi.string().valid('text/cql', 'text/fhirpath', 'application/x-fhir-query'),
    }),
  }),
  valueUsageContext: Joi.object({
    code: Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }).required(),
    valueCodeableConcept: Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }),
    valueQuantity: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
    valueRange: Joi.object({
      low: Joi.object({
        value: Joi.number().required(),
        unit: Joi.string(),
        system: Joi.string().uri(),
        code: Joi.string(),
      }),
      high: Joi.object({
        value: Joi.number().required(),
        unit: Joi.string(),
        system: Joi.string().uri(),
        code: Joi.string(),
      }),
    }),
    valueReference: Joi.object({
      type: Joi.string(),
      reference: Joi.string().required(),
      identifier: Joi.string(),
      display: Joi.string(),
    }),
  }),
  valueDosage: Joi.object({
    sequence: Joi.number().integer(),
    text: Joi.string(),
    additionalInstruction: Joi.array().items(
      Joi.object({
        code: Joi.string().required(),
        display: Joi.string(),
        text: Joi.string(),
      }),
    ),
    patientInstruction: Joi.string(),
    timing: Joi.object({
      event: Joi.array().items(Joi.date().iso()),
      repeat: Joi.object({
        boundsDuration: Joi.object({
          value: Joi.number().required(),
          unit: Joi.string(),
          system: Joi.string().uri(),
          code: Joi.string(),
        }),
        boundsRange: Joi.object({
          low: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
          high: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
        }),
        boundsPeriod: Joi.object({
          start: Joi.date().iso(),
          end: Joi.date().iso(),
        }),
        count: Joi.number().integer(),
        countMax: Joi.number().integer(),
        duration: Joi.number(),
        durationMax: Joi.number(),
        durationUnit: Joi.string().valid('h', 'd', 'wk', 'mo', 'a'),
        frequency: Joi.number().integer(),
        frequencyMax: Joi.number().integer(),
        period: Joi.number(),
        periodMax: Joi.number(),
        periodUnit: Joi.string().valid('h', 'd', 'wk', 'mo', 'a'),
        dayOfWeek: Joi.array().items(
          Joi.string().valid('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'),
        ),
        timeOfDay: Joi.array().items(Joi.string()),
        when: Joi.array().items(
          Joi.string().valid(
            'MORN',
            'MORN.early',
            'MORN.late',
            'NOON',
            'AFT',
            'AFT.early',
            'AFT.late',
            'EVE',
            'EVE.early',
            'EVE.late',
            'NIGHT',
            'PHS',
            'HS',
            'WAKE',
            'C',
            'CM',
            'CD',
            'CV',
            'AC',
            'ACM',
            'ACD',
            'ACV',
            'PC',
            'PCM',
            'PCD',
            'PCV',
          ),
        ),
        offset: Joi.number().integer(),
      }),
      code: Joi.object({
        code: Joi.string().required(),
        display: Joi.string(),
        text: Joi.string(),
      }),
    }),
    asNeededBoolean: Joi.boolean(),
    asNeededCodeableConcept: Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }),
    site: Joi.array().items(
      Joi.object({
        code: Joi.string().required(),
        display: Joi.string(),
        text: Joi.string(),
      }),
    ),
    route: Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }),
    method: Joi.object({
      code: Joi.string().required(),
      display: Joi.string(),
      text: Joi.string(),
    }),
    doseAndRate: Joi.array().items(
      Joi.object({
        type: Joi.object({
          code: Joi.string().required(),
          display: Joi.string(),
          text: Joi.string(),
        }),
        doseRange: Joi.object({
          low: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
          high: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
        }),
        doseQuantity: Joi.object({
          value: Joi.number().required(),
          unit: Joi.string(),
          system: Joi.string().uri(),
          code: Joi.string(),
        }),
        rateRatio: Joi.object({
          numerator: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
          denominator: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
        }),
        rateRange: Joi.object({
          low: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
          high: Joi.object({
            value: Joi.number().required(),
            unit: Joi.string(),
            system: Joi.string().uri(),
            code: Joi.string(),
          }),
        }),
        rateQuantity: Joi.object({
          value: Joi.number().required(),
          unit: Joi.string(),
          system: Joi.string().uri(),
          code: Joi.string(),
        }),
      }),
    ),
    maxDosePerPeriod: Joi.object({
      numerator: Joi.object({
        value: Joi.number().required(),
        unit: Joi.string(),
        system: Joi.string().uri(),
        code: Joi.string(),
      }),
      denominator: Joi.object({
        value: Joi.number().required(),
        unit: Joi.string(),
        system: Joi.string().uri(),
        code: Joi.string(),
      }),
    }),
    maxDosePerAdministration: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
    maxDosePerLifetime: Joi.object({
      value: Joi.number().required(),
      unit: Joi.string(),
      system: Joi.string().uri(),
      code: Joi.string(),
    }),
  }),
  valueMeta: Joi.object({
    versionId: Joi.string(),
    lastUpdated: Joi.date().iso(),
    source: Joi.string().uri(),
    profile: Joi.array().items(Joi.string().uri()),
    security: Joi.array().items(
      Joi.object({
        system: Joi.string().uri(),
        version: Joi.string(),
        code: Joi.string(),
        display: Joi.string(),
      }),
    ),
    tag: Joi.array().items(
      Joi.object({
        system: Joi.string().uri(),
        version: Joi.string(),
        code: Joi.string(),
        display: Joi.string(),
      }),
    ),
  }),
});

export const codeableConceptInputSchema = Joi.alternatives().try(
  Joi.string(),
  Joi.object({
    system: Joi.string().uri(),
    code: Joi.string().required(),
    display: Joi.string(),
    text: Joi.string(),
  }),
  Joi.object({
    coding: Joi.array()
      .items(
        Joi.object({
          system: Joi.string().uri(),
          version: Joi.string(),
          code: Joi.string().required(),
          display: Joi.string(),
          userSelected: Joi.boolean(),
        }),
      )
      .min(1),
    text: Joi.string(),
  }),
  Joi.object({
    text: Joi.string().required(),
  }),
);

export const referenceInputSchema = Joi.object({
  type: Joi.string(),
  reference: Joi.string().required(),
  identifier: Joi.string(),
  display: Joi.string(),
});

export const periodInputSchema = Joi.object({
  start: Joi.date().iso(),
  end: Joi.date().iso(),
});

export const identifierInputSchema = Joi.object({
  id: Joi.string(),
  use: Joi.string().valid('usual', 'official', 'temp', 'secondary', 'old').default('official'),
  type: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  system: Joi.string().uri(),
  value: Joi.string().required().messages({
    'any.required': 'Identifier value is required',
  }),
  period: periodInputSchema,
  assigner: referenceInputSchema,
  extension: Joi.array().items(extensionInputSchema),
});

export const nameInputSchema = Joi.object({
  id: Joi.string(),
  use: Joi.string()
    .valid('usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden')
    .default('official'),
  text: Joi.string(),
  family: Joi.string(),
  given: Joi.array().items(Joi.string()),
  prefix: Joi.array().items(Joi.string()),
  suffix: Joi.array().items(Joi.string()),
  period: periodInputSchema,
  extension: Joi.array().items(extensionInputSchema),
}).custom((value, helpers) => {
  const hasText = value.text && value.text.trim().length > 0;
  const hasFamily = value.family && value.family.trim().length > 0;
  const hasGiven =
    value.given &&
    Array.isArray(value.given) &&
    value.given.length > 0 &&
    value.given.some((name) => name && name.trim().length > 0);

  if (!hasText && !hasFamily && !hasGiven) {
    return helpers.error('any.invalid', {
      message: 'Name must contain at least one of: text, family, or given name',
    });
  }

  if (value.use === 'official' && !hasFamily && !hasText) {
    return helpers.error('any.invalid', {
      message: 'Official name should include family name or full text',
    });
  }

  return value;
}, 'name-constraint');

export const contactPointInputSchema = Joi.object({
  id: Joi.string(),
  system: Joi.string().valid('phone', 'fax', 'email', 'pager', 'url', 'sms', 'other').required(),
  value: Joi.string().required(),
  use: Joi.string().valid('home', 'work', 'temp', 'old', 'mobile').default('home'),
  rank: Joi.number().integer().min(1),
  period: Joi.object({
    start: Joi.date().iso(),
    end: Joi.date().iso(),
  }),
  extension: Joi.array().items(extensionInputSchema),
});

export const addressInputSchema = Joi.object({
  id: Joi.string(),
  use: Joi.string().valid('home', 'work', 'temp', 'old', 'billing').default('home'),
  type: Joi.string().valid('postal', 'physical', 'both').default('physical'),
  text: Joi.string(),
  line: Joi.array().items(Joi.string()),
  city: Joi.string(),
  district: Joi.string(),
  state: Joi.string(),
  postalCode: Joi.string(),
  country: Joi.string().default('IN'),
  period: periodInputSchema,
  extension: Joi.array().items(extensionInputSchema),
});

export const contactInputSchema = Joi.object({
  id: Joi.string(),
  relationship: Joi.alternatives().try(
    Joi.string(),
    codeableConceptInputSchema,
    Joi.array().items(codeableConceptInputSchema),
  ),
  name: nameInputSchema,
  telecom: Joi.array().items(contactPointInputSchema),
  address: addressInputSchema,
  gender: Joi.string().valid('male', 'female', 'other', 'unknown'),
  organization: referenceInputSchema,
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
}).custom((value, helpers) => {
  const hasName = value.name && Object.keys(value.name).length > 0;
  const hasTelecom = value.telecom && Array.isArray(value.telecom) && value.telecom.length > 0;
  const hasAddress = value.address && Object.keys(value.address).length > 0;
  const hasOrganization = value.organization && Object.keys(value.organization).length > 0;

  if (!hasName && !hasTelecom && !hasAddress && !hasOrganization) {
    return helpers.error('any.invalid', {
      message:
        'Contact must contain at least one of: name, telecom, address, or organization (pat-1 constraint)',
    });
  }

  return value;
}, 'contact-constraint');

export const communicationInputSchema = Joi.object({
  id: Joi.string(), // 0..1 string for inter-element referencing
  language: Joi.alternatives().try(Joi.string(), codeableConceptInputSchema),
  preferred: Joi.boolean().default(false),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export const linkInputSchema = Joi.object({
  id: Joi.string(),
  other: referenceInputSchema.required(),
  type: Joi.string().valid('replaced-by', 'replaces', 'refer', 'seealso').required(),
  extension: Joi.array().items(extensionInputSchema),
  modifierExtension: Joi.array().items(extensionInputSchema),
});

export const attachmentInputSchema = Joi.object({
  contentType: Joi.string(),
  language: Joi.string(),
  data: Joi.string().base64().messages({
    'string.base64': 'Data must be a valid Base64 encoded string',
  }),
  url: Joi.string().uri(),
  size: Joi.number().integer().positive(),
  hash: Joi.string(),
  title: Joi.string(),
  creation: Joi.date().iso(),
});

export const quantityInputSchema = Joi.object({
  value: Joi.number().required(),
  unit: Joi.string(),
  system: Joi.string().uri(),
  code: Joi.string(),
});

export const metaInputSchema = Joi.object({
  versionId: Joi.string(),
  lastUpdated: Joi.date().iso(),
  source: Joi.string().uri(),
  profile: Joi.array().items(Joi.string().uri()),
  security: Joi.array().items(
    Joi.object({
      system: Joi.string().uri(),
      version: Joi.string(),
      code: Joi.string(),
      display: Joi.string(),
    }),
  ),
  tag: Joi.array().items(
    Joi.object({
      system: Joi.string().uri(),
      version: Joi.string(),
      code: Joi.string(),
      display: Joi.string(),
    }),
  ),
});

export const moneyInputSchema = Joi.object({
  value: Joi.number().required(),
  currency: Joi.string(),
});
