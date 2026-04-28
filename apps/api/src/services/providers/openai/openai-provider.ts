import OpenAI from 'openai';
import { env } from '../../../env';
import type { ClassifyResult } from '../../types';
import { failSoft } from '../../types';
import { LlmLogger } from '../../llm-logger';
import { BaseClassifierProvider } from '../base-provider';
import { OpenAISchema } from './openai-schema';
import { parseClassificazioneFromContent } from './openai-parse';
import { OpenAIRetry } from './openai-retry';

const MAX_TOKENS = 512;
const MAX_RETRIES = 1;

export class OpenAIProvider extends BaseClassifierProvider<OpenAI> {
  readonly id = 'openai' as const;

  protected readonly formatReminder =
    'Rispondi sempre con un oggetto JSON che rispetti lo schema fornito.';

  protected createClient(): OpenAI {
    if (!env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY non configurata. Aggiungila in apps/api/.env per usare OpenAI.',
      );
    }
    return new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  private callModel(
    client: OpenAI,
    model: string,
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return client.chat.completions.create({
      model,
      max_tokens: MAX_TOKENS,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: OpenAISchema.DEFINITION,
      },
    });
  }

  protected async performClassify(
    client: OpenAI,
    testo: string,
    model: string,
  ): Promise<ClassifyResult> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: testo },
    ];
    let lastError = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const scope = LlmLogger.start(this.id, model, testo, attempt + 1);

      let completion: OpenAI.Chat.Completions.ChatCompletion;
      let raw: string | null;
      try {
        completion = await this.callModel(client, model, messages);
        raw = completion.choices[0]?.message.content ?? null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.log('error', `chiamata fallita: ${msg}`);
        await scope.close({
          status: 'api_error',
          tokens_input: null,
          tokens_output: null,
          error: msg,
          response_raw: null,
          classificazione: null,
        });
        return failSoft(`Chiamata al modello fallita: ${msg}`);
      }

      const result = parseClassificazioneFromContent(raw);

      await scope.close({
        status: result.ok ? 'ok' : 'parse_error',
        tokens_input: completion.usage?.prompt_tokens ?? null,
        tokens_output: completion.usage?.completion_tokens ?? null,
        error: result.ok ? null : result.error,
        response_raw: completion,
        classificazione: result.ok ? result.classificazione : null,
      });

      if (result.ok) {
        if (attempt > 0) {
          this.log('info', `recuperato al tentativo ${attempt + 1}`);
        }
        return result;
      }

      lastError = result.error;
      this.log(
        'warn',
        `tentativo ${attempt + 1} fallito: ${result.error}`,
      );

      if (attempt < MAX_RETRIES) {
        messages.push({ role: 'assistant', content: raw ?? '' });
        messages.push({
          role: 'user',
          content: OpenAIRetry.buildFeedbackContent(result.error),
        });
      }
    }

    return failSoft(
      `Classificazione fallita dopo ${MAX_RETRIES + 1} tentativi: ${lastError}`,
    );
  }
}
