import type Anthropic from '@anthropic-ai/sdk';
import { AnthropicTool } from './anthropic-tool';

/**
 * Costruisce il turno di feedback da accodare alla conversazione quando
 * l'output del modello non passa la validazione Zod, in modo che alla
 * chiamata successiva il modello veda cosa ha sbagliato e corregga.
 */
export class AnthropicRetry {
  private static readonly SCHEMA_REMINDER =
    'categoria deve essere uno tra "tecnico", "amministrativo", "commerciale", "altro"; ' +
    'priorita uno tra "bassa", "media", "alta"; ' +
    'riassunto stringa non vuota di massimo 500 caratteri.';

  /**
   * Dato il messaggio dell'assistant che ha prodotto output invalido e il
   * messaggio di errore della validazione, ritorna il `MessageParam` user
   * da accodare per il retry.
   *
   * - Se aveva chiamato il tool (con dati sbagliati) → blocco `tool_result`
   *   con `is_error: true` referenziato al `tool_use_id` originale.
   * - Se non aveva chiamato il tool → reminder testuale.
   */
  static buildFeedbackTurn(
    response: Anthropic.Message,
    error: string,
  ): Anthropic.MessageParam {
    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );

    if (toolUse) {
      return {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            is_error: true,
            content: `${error}. Riprova rispettando lo schema: ${AnthropicRetry.SCHEMA_REMINDER}`,
          },
        ],
      };
    }

    return {
      role: 'user',
      content: `Errore: ${error}. Devi chiamare lo strumento "${AnthropicTool.NAME}" con i tre campi. Riprova.`,
    };
  }
}
