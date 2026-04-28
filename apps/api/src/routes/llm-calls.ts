import { Hono } from 'hono';
import type { LlmCall } from '@powering/shared';
import { supabase } from '../lib/supabase';

export const llmCallsRouter = new Hono();

const TABLE = 'powering_llm_calls';
const DEFAULT_LIMIT = 100;

llmCallsRouter.get('/', async (c) => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('started_at', { ascending: false })
    .limit(DEFAULT_LIMIT);

  if (error) {
    console.error('[GET /llm-calls] supabase:', error);
    return c.json({ error: 'Impossibile leggere le chiamate LLM' }, 500);
  }

  return c.json(data as LlmCall[]);
});
