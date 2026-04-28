import {
  AiConfigSchema,
  DEFAULT_AI_CONFIG,
  isValidAiConfig,
  type AiConfig,
} from '@powering/shared';
import { supabase } from '../lib/supabase';

const TABLE = 'powering_ai_config';
const SINGLETON_ID = true;

/**
 * Legge la configurazione AI corrente da Supabase.
 * Se la riga non esiste (es. migration non eseguita), ritorna i default.
 */
export async function getAiConfig(): Promise<AiConfig> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('provider, model')
    .eq('id', SINGLETON_ID)
    .maybeSingle();

  if (error) {
    console.error('[ai-config] errore lettura:', error);
    return DEFAULT_AI_CONFIG;
  }
  if (!data) return DEFAULT_AI_CONFIG;

  const parsed = AiConfigSchema.safeParse(data);
  if (!parsed.success || !isValidAiConfig(parsed.data)) {
    console.warn(
      '[ai-config] config in DB non valida, uso default',
      parsed.success ? parsed.data : parsed.error.issues,
    );
    return DEFAULT_AI_CONFIG;
  }
  return parsed.data;
}

/**
 * Aggiorna la configurazione AI (upsert sulla riga singleton).
 * Lancia se la coppia provider/model non è ammessa.
 */
export async function setAiConfig(config: AiConfig): Promise<AiConfig> {
  if (!isValidAiConfig(config)) {
    throw new Error(
      `Coppia provider/model non valida: ${config.provider}/${config.model}`,
    );
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        id: SINGLETON_ID,
        provider: config.provider,
        model: config.model,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select('provider, model')
    .single();

  if (error || !data) {
    throw new Error(`Errore aggiornamento config AI: ${error?.message}`);
  }

  return AiConfigSchema.parse(data);
}
