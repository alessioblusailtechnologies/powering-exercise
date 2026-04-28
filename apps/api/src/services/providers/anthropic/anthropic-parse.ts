import type Anthropic from '@anthropic-ai/sdk';
import { CLASSIFICAZIONE_FALLBACK, ClassificazioneSchema } from '@powering/shared';
import type { ClassifyResult } from '../../types';
import { AnthropicTool } from './anthropic-tool';

export type { ClassifyResult } from '../../types';

/**
 * Estrae e valida la classificazione da un messaggio Anthropic.
 * Pura: niente env, niente network — testabile con fixture.
 */
export function parseClassificazioneFromMessage(
  message: Anthropic.Message,
): ClassifyResult {
  const toolUseBlock = message.content.find(
    (block): block is Anthropic.ToolUseBlock =>
      block.type === 'tool_use' && block.name === AnthropicTool.NAME,
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
