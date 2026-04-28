import Anthropic from '@anthropic-ai/sdk';
import { CLASSIFICAZIONE_FALLBACK } from '@powering/shared';
import { env } from '../env';
import {
  parseClassificazioneFromMessage,
  type ClassifyResult,
} from './classifier-parse';
import { ClassifierTool } from './classifier-tool';
import { ClassifierPrompt } from './classifier-prompt';
import { ClassifierRetry } from './classifier-retry';

export type { ClassifyResult } from './classifier-parse';

// ─── Configurazione ─────────────────────────────────────────────────────────

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 512;
const MAX_RETRIES = 1;

// ─── Client Anthropic ───────────────────────────────────────────────────────

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return _client;
}

function callModel(
  messages: Anthropic.MessageParam[],
): Promise<Anthropic.Message> {
  return getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: ClassifierPrompt.SYSTEM,
    tools: [ClassifierTool.DEFINITION],
    tool_choice: { type: 'tool', name: ClassifierTool.NAME },
    messages,
  });
}

function failSoft(error: string): ClassifyResult {
  return { ok: false, error, classificazione: CLASSIFICAZIONE_FALLBACK };
}

// ─── API pubblica ───────────────────────────────────────────────────────────

/**
 * Classifica il testo di una richiesta cliente.
 *
 * Flusso:
 *   1. Chiama Claude forzando l'uso del tool `salva_classificazione`.
 *   2. Valida l'output con Zod.
 *   3. Se la validazione fallisce, ritenta una volta accodando un turno di
 *      feedback (vedi `ClassifierRetry`) che spiega l'errore al modello.
 *   4. Se anche il retry fallisce, ritorna fallback fail-soft.
 *
 * Errori di rete/API non vengono ritentati: vanno direttamente al fallback.
 */
export async function classify(testo: string): Promise<ClassifyResult> {
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: testo },
  ];
  let lastError = '';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let response: Anthropic.Message;
    try {
      response = await callModel(messages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[classifier] errore Anthropic:', msg);
      return failSoft(`Chiamata al modello fallita: ${msg}`);
    }

    const result = parseClassificazioneFromMessage(response);
    if (result.ok) {
      if (attempt > 0) {
        console.log(`[classifier] recuperato al tentativo ${attempt + 1}`);
      }
      return result;
    }

    lastError = result.error;
    console.warn(
      `[classifier] tentativo ${attempt + 1} fallito: ${result.error}`,
    );

    if (attempt < MAX_RETRIES) {
      messages.push({ role: 'assistant', content: response.content });
      messages.push(ClassifierRetry.buildFeedbackTurn(response, result.error));
    }
  }

  return failSoft(
    `Classificazione fallita dopo ${MAX_RETRIES + 1} tentativi: ${lastError}`,
  );
}
