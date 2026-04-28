/**
 * Costruisce il messaggio user di feedback da accodare alla conversazione
 * dopo un parsing/validazione fallita, in modo che alla chiamata successiva
 * il modello veda esattamente cosa ha sbagliato e corregga.
 *
 * OpenAI non ha l'equivalente del blocco `tool_result is_error` di Anthropic:
 * il feedback è un normale messaggio testuale `role: 'user'`.
 */
export class OpenAIRetry {
  private static readonly SCHEMA_REMINDER =
    'categoria deve essere uno tra "tecnico", "amministrativo", "commerciale", "altro"; ' +
    'priorita uno tra "bassa", "media", "alta"; ' +
    'riassunto stringa non vuota di massimo 500 caratteri.';

  static buildFeedbackContent(error: string): string {
    return `Il tuo output precedente non era valido: ${error}. Riprova restituendo SOLO un oggetto JSON conforme allo schema: ${OpenAIRetry.SCHEMA_REMINDER}`;
  }
}
