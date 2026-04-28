import type { Classificazione } from '@powering/shared';
import { CLASSIFICAZIONE_FALLBACK } from '@powering/shared';

export type ClassifyResult =
  | { ok: true; classificazione: Classificazione }
  | {
      ok: false;
      error: string;
      classificazione: typeof CLASSIFICAZIONE_FALLBACK;
    };

export function failSoft(error: string): ClassifyResult {
  return { ok: false, error, classificazione: CLASSIFICAZIONE_FALLBACK };
}
