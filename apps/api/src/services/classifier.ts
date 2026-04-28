import Anthropic from '@anthropic-ai/sdk';
import { CLASSIFICAZIONE_FALLBACK } from '@powering/shared';
import { env } from '../env';
import {
  parseClassificazioneFromMessage,
  type ClassifyResult,
} from './classifier-parse';
import { ClassifierTool } from './classifier-tool';
import { ClassifierPrompt } from './classifier-prompt';

export type { ClassifyResult } from './classifier-parse';

// ─── Configurazione ─────────────────────────────────────────────────────────

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 512;

// ─── Client Anthropic ───────────────────────────────────────────────────────

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}

function failSoft(error: string): ClassifyResult {
  return { ok: false, error, classificazione: CLASSIFICAZIONE_FALLBACK };
}

// ─── API pubblica ───────────────────────────────────────────────────────────

/**
 * Classifica il testo di una richiesta cliente chiamando Claude e validando
 * l'output con Zod. In caso di errore di rete o di output non valido ritorna
 * un fallback fail-soft (categoria: altro, priorita: media, riassunto: null).
 */
export async function classify(testo: string): Promise<ClassifyResult> {
  let response: Anthropic.Message;
  try {
    response = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: ClassifierPrompt.SYSTEM,
      tools: [ClassifierTool.DEFINITION],
      tool_choice: { type: 'tool', name: ClassifierTool.NAME },
      messages: [{ role: 'user', content: testo }],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[classifier] errore Anthropic:', msg);
    return failSoft(`Chiamata al modello fallita: ${msg}`);
  }

  const result = parseClassificazioneFromMessage(response);
  if (!result.ok) {
    console.warn('[classifier] output non valido:', result.error);
  }
  return result;
}
