import Anthropic from '@anthropic-ai/sdk';
import { CLASSIFICAZIONE_FALLBACK } from '@powering/shared';
import { env } from '../env';
import {
  parseClassificazioneFromMessage,
  TOOL_NAME,
  type ClassifyResult,
} from './classifier-parse';

export type { ClassifyResult } from './classifier-parse';

const MODEL = 'claude-haiku-4-5';

const SYSTEM_PROMPT = `Sei un assistente che classifica richieste di clienti per un sistema di ticketing.
Dato il testo di una richiesta, devi determinare:
- categoria: il tipo di richiesta (tecnico, amministrativo, commerciale, altro)
- priorita: l'urgenza percepita (bassa, media, alta)
- riassunto: una frase breve (max 200 caratteri) che riassume il problema in italiano

Rispondi SEMPRE chiamando lo strumento "${TOOL_NAME}" con i campi corretti. Non rispondere con testo libero.`;

const classifyTool: Anthropic.Tool = {
  name: TOOL_NAME,
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

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function classify(testo: string): Promise<ClassifyResult> {
  try {
    const message = await getClient().messages.create({
      model: MODEL,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: [classifyTool],
      tool_choice: { type: 'tool', name: TOOL_NAME },
      messages: [{ role: 'user', content: testo }],
    });

    return parseClassificazioneFromMessage(message);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[classifier] errore chiamata Anthropic:', errorMessage);
    return {
      ok: false,
      error: `Chiamata al modello fallita: ${errorMessage}`,
      classificazione: CLASSIFICAZIONE_FALLBACK,
    };
  }
}
