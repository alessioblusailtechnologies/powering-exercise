import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  AiConfigSchema,
  AVAILABLE_AI_OPTIONS,
  isValidAiConfig,
} from '@powering/shared';
import { getAiConfig, setAiConfig } from '../services/ai-config';

export const configRouter = new Hono();

configRouter.get('/ai', async (c) => {
  try {
    const current = await getAiConfig();
    return c.json({ current, available: AVAILABLE_AI_OPTIONS });
  } catch (err) {
    console.error('[GET /config/ai]', err);
    return c.json({ error: 'Impossibile leggere la configurazione' }, 500);
  }
});

configRouter.put(
  '/ai',
  zValidator('json', AiConfigSchema),
  async (c) => {
    const config = c.req.valid('json');
    if (!isValidAiConfig(config)) {
      return c.json(
        { error: `Coppia provider/model non valida: ${config.provider}/${config.model}` },
        400,
      );
    }

    try {
      const saved = await setAiConfig(config);
      return c.json(saved);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('[PUT /config/ai]', msg);
      return c.json({ error: msg }, 500);
    }
  },
);
