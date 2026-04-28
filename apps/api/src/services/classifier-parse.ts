import type Anthropic from '@anthropic-ai/sdk';
import {
  CLASSIFICAZIONE_FALLBACK,
  ClassificazioneSchema,
  type Classificazione,
} from '@powering/shared';

export const TOOL_NAME = 'salva_classificazione';

export type ClassifyResult =
  | { ok: true; classificazione: Classificazione }
  | {
      ok: false;
      error: string;
      classificazione: typeof CLASSIFICAZIONE_FALLBACK;
    };

/**
 * Estrae e valida la classificazione da un messaggio Anthropic.
 * Pura: niente env, niente network — testabile con fixture.
 */
export function parseClassificazioneFromMessage(
  message: Anthropic.Message,
): ClassifyResult {
  const toolUseBlock = message.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === 'tool_use' && block.name === TOOL_NAME,
  );

  if (!toolUseBlock) {
    return {
      ok: false,
      error: 'Il modello non ha chiamato lo strumento di classificazione',
      classificazione: CLASSIFICAZIONE_FALLBACK,
    };
  }

  const parsed = ClassificazioneSchema.safeParse(toolUseBlock.input);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Output AI non valido: ${parsed.error.issues.map((i) => i.message).join(', ')}`,
      classificazione: CLASSIFICAZIONE_FALLBACK,
    };
  }

  return { ok: true, classificazione: parsed.data };
}
