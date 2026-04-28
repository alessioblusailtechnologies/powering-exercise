import type {
  Classificazione,
  LlmCallStatus,
  Provider,
} from '@powering/shared';
import { supabase } from '../lib/supabase';

const TABLE = 'powering_llm_calls';

export type LlmCallSummary = {
  status: LlmCallStatus;
  tokens_input: number | null;
  tokens_output: number | null;
  error: string | null;
  response_raw: unknown;
  classificazione: Classificazione | null;
};

/**
 * Scope di una singola chiamata LLM. Il timing parte alla costruzione,
 * la riga viene scritta su DB alla `close()`.
 *
 * Errori di scrittura non vengono propagati: la classificazione non deve
 * fallire se il log non riesce.
 */
export class LlmCallScope {
  private readonly startedAt = Date.now();

  constructor(
    private readonly provider: Provider,
    private readonly model: string,
    private readonly testo: string,
    private readonly attempt: number,
  ) {}

  async close(summary: LlmCallSummary): Promise<void> {
    const record = {
      provider: this.provider,
      model: this.model,
      started_at: new Date(this.startedAt).toISOString(),
      duration_ms: Date.now() - this.startedAt,
      attempt: this.attempt,
      testo_input: this.testo,
      ...summary,
    };
    try {
      const { error } = await supabase.from(TABLE).insert(record);
      if (error) console.error('[llm-logger] errore scrittura:', error);
    } catch (err) {
      console.error('[llm-logger] eccezione scrittura:', err);
    }
  }
}

export const LlmLogger = {
  start(
    provider: Provider,
    model: string,
    testo: string,
    attempt: number,
  ): LlmCallScope {
    return new LlmCallScope(provider, model, testo, attempt);
  },
};
