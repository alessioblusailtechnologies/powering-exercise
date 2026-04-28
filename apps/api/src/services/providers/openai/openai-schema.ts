/**
 * Schema usato come `response_format` di OpenAI per garantire output strutturato.
 * Con `strict: true` il modello è forzato a campionare token che rispettano
 * lo schema (enum, required, additionalProperties).
 */
export class OpenAISchema {
  static readonly NAME = 'classificazione_richiesta';

  static readonly DEFINITION = {
    name: OpenAISchema.NAME,
    strict: true,
    schema: {
      type: 'object',
      properties: {
        categoria: {
          type: 'string',
          enum: ['tecnico', 'amministrativo', 'commerciale', 'altro'],
        },
        priorita: {
          type: 'string',
          enum: ['bassa', 'media', 'alta'],
        },
        riassunto: { type: 'string' },
      },
      required: ['categoria', 'priorita', 'riassunto'],
      additionalProperties: false,
    },
  } as const;
}
