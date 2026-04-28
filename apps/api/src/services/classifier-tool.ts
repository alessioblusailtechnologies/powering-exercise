import type Anthropic from '@anthropic-ai/sdk';

/**
 * Definizione del tool che il modello Claude deve chiamare per restituire
 * la classificazione strutturata. È il meccanismo "structured output" di Anthropic:
 * forziamo `tool_choice` su questo tool per ottenere JSON garantito.
 */
export class ClassifierTool {
  static readonly NAME = 'salva_classificazione';

  static readonly DEFINITION: Anthropic.Tool = {
    name: ClassifierTool.NAME,
    description:
      'Salva la classificazione strutturata di una richiesta cliente. Va sempre chiamato.',
    input_schema: {
      type: 'object',
      properties: {
        categoria: {
          type: 'string',
          enum: ['tecnico', 'amministrativo', 'commerciale', 'altro'],
          description: 'La categoria della richiesta.',
        },
        priorita: {
          type: 'string',
          enum: ['bassa', 'media', 'alta'],
          description: "L'urgenza percepita della richiesta.",
        },
        riassunto: {
          type: 'string',
          description:
            'Riassunto in italiano di una sola frase (max 200 caratteri).',
        },
      },
      required: ['categoria', 'priorita', 'riassunto'],
    },
  };
}
