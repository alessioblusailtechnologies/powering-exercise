import { ClassificazioneSchema } from '@powering/shared';
import type { ClassifyResult } from '../../types';
import { failSoft } from '../../types';

/**
 * Parsa e valida il contenuto testuale di una risposta OpenAI in chat completion
 * (campo `choices[0].message.content`).
 * Pura: niente network, niente env — testabile con stringhe.
 */
export function parseClassificazioneFromContent(
  raw: string | null,
): ClassifyResult {
  if (!raw) return failSoft('Risposta OpenAI vuota');

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return failSoft(`Output non è JSON valido: ${raw.slice(0, 200)}`);
  }

  const validated = ClassificazioneSchema.safeParse(parsedJson);
  if (!validated.success) {
    const issues = validated.error.issues.map((i) => i.message).join(', ');
    return failSoft(`Output AI non valido: ${issues}`);
  }

  return { ok: true, classificazione: validated.data };
}
