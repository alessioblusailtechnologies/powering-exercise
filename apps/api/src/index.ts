import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './env';
import { configRouter } from './routes/config';
import { richiesteRouter } from './routes/richieste';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  }),
);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/richieste', richiesteRouter);
app.route('/config', configRouter);

app.onError((err, c) => {
  console.error('[unhandled]', err);
  return c.json({ error: 'Errore interno del server' }, 500);
});

export default {
  port: env.PORT,
  fetch: app.fetch,
};

console.log(`API in ascolto su http://localhost:${env.PORT}`);
