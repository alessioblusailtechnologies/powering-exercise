import { describe, expect, it } from 'bun:test';
import type Anthropic from '@anthropic-ai/sdk';
import { parseClassificazioneFromMessage } from './classifier-parse';

function fakeMessage(content: Anthropic.ContentBlock[]): Anthropic.Message {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'claude-haiku-4-5',
    stop_reason: 'tool_use',
    stop_sequence: null,
    usage: { input_tokens: 0, output_tokens: 0 },
    content,
  } as Anthropic.Message;
}

function toolUseBlock(input: unknown): Anthropic.ToolUseBlock {
  return {
    type: 'tool_use',
    id: 'toolu_test',
    name: 'salva_classificazione',
    input,
  } as Anthropic.ToolUseBlock;
}

describe('parseClassificazioneFromMessage', () => {
  it('estrae una classificazione valida dal tool use', () => {
    const message = fakeMessage([
      toolUseBlock({
        categoria: 'tecnico',
        priorita: 'alta',
        riassunto: 'Problema di connettività del dispositivo.',
      }),
    ]);

    const result = parseClassificazioneFromMessage(message);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.classificazione).toEqual({
        categoria: 'tecnico',
        priorita: 'alta',
        riassunto: 'Problema di connettività del dispositivo.',
      });
    }
  });

  it('ritorna fallback se il modello risponde solo con testo', () => {
    const message = fakeMessage([
      { type: 'text', text: 'Mi dispiace, non posso classificare.', citations: [] } as unknown as Anthropic.TextBlock,
    ]);

    const result = parseClassificazioneFromMessage(message);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.classificazione).toEqual({
        categoria: 'altro',
        priorita: 'media',
        riassunto: null,
      });
      expect(result.error).toContain('strumento');
    }
  });

  it('ritorna fallback se la categoria non è nell\'enum', () => {
    const message = fakeMessage([
      toolUseBlock({
        categoria: 'urgenza_massima',
        priorita: 'alta',
        riassunto: 'Test.',
      }),
    ]);

    const result = parseClassificazioneFromMessage(message);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Output AI non valido');
      expect(result.classificazione.categoria).toBe('altro');
    }
  });

  it('ritorna fallback se mancano campi obbligatori', () => {
    const message = fakeMessage([
      toolUseBlock({
        categoria: 'tecnico',
        priorita: 'alta',
      }),
    ]);

    const result = parseClassificazioneFromMessage(message);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Output AI non valido');
    }
  });

  it('ritorna fallback se il riassunto è vuoto', () => {
    const message = fakeMessage([
      toolUseBlock({
        categoria: 'tecnico',
        priorita: 'media',
        riassunto: '',
      }),
    ]);

    const result = parseClassificazioneFromMessage(message);

    expect(result.ok).toBe(false);
  });
});
