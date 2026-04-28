import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  AggiornaRichiestaSchema,
  CreaRichiestaSchema,
  type Richiesta,
} from '@powering/shared';
import { supabase, TABLE_RICHIESTE } from '../lib/supabase';
import { classify } from '../services/classifier';

export const richiesteRouter = new Hono();

const IdParamSchema = z.object({ id: z.string().uuid() });

richiesteRouter.get('/', async (c) => {
  const { data, error } = await supabase
    .from(TABLE_RICHIESTE)
    .select('*')
    .order('data_creazione', { ascending: false });

  if (error) {
    console.error('[GET /richieste] supabase:', error);
    return c.json({ error: 'Impossibile leggere le richieste' }, 500);
  }

  return c.json(data as Richiesta[]);
});

richiesteRouter.get(
  '/:id',
  zValidator('param', IdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const { data, error } = await supabase
      .from(TABLE_RICHIESTE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[GET /richieste/:id] supabase:', error);
      return c.json({ error: 'Impossibile leggere la richiesta' }, 500);
    }
    if (!data) {
      return c.json({ error: 'Richiesta non trovata' }, 404);
    }

    return c.json(data as Richiesta);
  },
);

richiesteRouter.post(
  '/',
  zValidator('json', CreaRichiestaSchema),
  async (c) => {
    const { testo } = c.req.valid('json');

    const result = await classify(testo);
    const { categoria, priorita, riassunto } = result.classificazione;

    const { data, error } = await supabase
      .from(TABLE_RICHIESTE)
      .insert({
        testo,
        categoria,
        priorita,
        riassunto,
        classificazione_errore: !result.ok,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[POST /richieste] supabase:', error);
      return c.json({ error: 'Impossibile salvare la richiesta' }, 500);
    }

    return c.json(
      {
        richiesta: data as Richiesta,
        classificazione_errore: result.ok ? null : result.error,
      },
      201,
    );
  },
);

richiesteRouter.patch(
  '/:id',
  zValidator('param', IdParamSchema),
  zValidator('json', AggiornaRichiestaSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const aggiornamento = c.req.valid('json');

    const { data, error } = await supabase
      .from(TABLE_RICHIESTE)
      .update({
        ...aggiornamento,
        classificazione_errore: false,
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[PATCH /richieste/:id] supabase:', error);
      return c.json({ error: 'Impossibile aggiornare la richiesta' }, 500);
    }
    if (!data) {
      return c.json({ error: 'Richiesta non trovata' }, 404);
    }

    return c.json(data as Richiesta);
  },
);
