import type { Provider } from '@powering/shared';
import type { ClassifyResult } from '../types';
import { failSoft } from '../types';
import { ClassifierPrompt } from '../classifier-prompt';
import type { ClassifierProvider } from './types';

/**
 * Classe base per i provider di classificazione AI.
 *
 * Fattorizza:
 *   - lazy init del client SDK (con cache);
 *   - composizione del system prompt (base condivisa + reminder format-specific);
 *   - gestione uniforme dell'errore in fase di costruzione client → fail-soft;
 *   - logging con prefisso provider.
 *
 * Le sottoclassi devono fornire:
 *   - `id`: identificativo del provider (matcha l'enum `Provider`);
 *   - `formatReminder`: istruzione finale del prompt sul formato di output
 *     (es. "chiama il tool X" per Anthropic, "rispondi con JSON" per OpenAI);
 *   - `createClient()`: costruzione dell'SDK (può lanciare se config mancante);
 *   - `performClassify()`: logica di classificazione vera e propria.
 */
export abstract class BaseClassifierProvider<TClient>
  implements ClassifierProvider
{
  abstract readonly id: Provider;
  protected abstract readonly formatReminder: string;

  private client: TClient | null = null;

  protected abstract createClient(): TClient;

  protected abstract performClassify(
    client: TClient,
    testo: string,
    model: string,
  ): Promise<ClassifyResult>;

  protected get systemPrompt(): string {
    return `${ClassifierPrompt.BASE}\n\n${this.formatReminder}`;
  }

  protected getClient(): TClient {
    if (!this.client) this.client = this.createClient();
    return this.client;
  }

  protected log(level: 'info' | 'warn' | 'error', msg: string): void {
    const prefix = `[${this.id}]`;
    if (level === 'error') console.error(prefix, msg);
    else if (level === 'warn') console.warn(prefix, msg);
    else console.log(prefix, msg);
  }

  async classify(testo: string, model: string): Promise<ClassifyResult> {
    let client: TClient;
    try {
      client = this.getClient();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.log('error', `errore inizializzazione client: ${msg}`);
      return failSoft(msg);
    }
    return this.performClassify(client, testo, model);
  }
}
