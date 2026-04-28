import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../../env';
import type { ClassifyResult } from '../../types';
import { failSoft } from '../../types';
import { LlmLogger } from '../../llm-logger';
import { BaseClassifierProvider } from '../base-provider';
import { AnthropicTool } from './anthropic-tool';
import { AnthropicRetry } from './anthropic-retry';
import { parseClassificazioneFromMessage } from './anthropic-parse';

const MAX_TOKENS = 512;
const MAX_RETRIES = 1;

export class AnthropicProvider extends BaseClassifierProvider<Anthropic> {
  readonly id = 'anthropic' as const;

  protected readonly formatReminder = `Rispondi SEMPRE chiamando lo strumento "${AnthropicTool.NAME}" con i campi corretti. Non rispondere con testo libero.`;

  protected createClient(): Anthropic {
    return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }

  private callModel(
    client: Anthropic,
    model: string,
    messages: Anthropic.MessageParam[],
  ): Promise<Anthropic.Message> {
    return client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: this.systemPrompt,
      tools: [AnthropicTool.DEFINITION],
      tool_choice: { type: 'tool', name: AnthropicTool.NAME },
      messages,
    });
  }

  protected async performClassify(
    client: Anthropic,
    testo: string,
    model: string,
  ): Promise<ClassifyResult> {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: testo },
    ];
    let lastError = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const scope = LlmLogger.start(this.id, model, testo, attempt + 1);

      let response: Anthropic.Message;
      try {
        response = await this.callModel(client, model, messages);
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

      const result = parseClassificazioneFromMessage(response);

      await scope.close({
        status: result.ok ? 'ok' : 'parse_error',
        tokens_input: response.usage.input_tokens,
        tokens_output: response.usage.output_tokens,
        error: result.ok ? null : result.error,
        response_raw: response,
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
        messages.push({ role: 'assistant', content: response.content });
        messages.push(AnthropicRetry.buildFeedbackTurn(response, result.error));
      }
    }

    return failSoft(
      `Classificazione fallita dopo ${MAX_RETRIES + 1} tentativi: ${lastError}`,
    );
  }
}
