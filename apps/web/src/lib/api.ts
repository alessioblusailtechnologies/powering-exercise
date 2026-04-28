import type {
  AggiornaRichiesta,
  CreaRichiesta,
  Richiesta,
} from '@powering/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body?.error ?? `Richiesta fallita (${res.status} ${res.statusText})`,
    );
  }

  return (await res.json()) as T;
}

export type CreaRichiestaResponse = {
  richiesta: Richiesta;
  classificazione_errore: string | null;
};

export const api = {
  list: () => http<Richiesta[]>('/richieste'),
  get: (id: string) => http<Richiesta>(`/richieste/${id}`),
  create: (body: CreaRichiesta) =>
    http<CreaRichiestaResponse>('/richieste', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: AggiornaRichiesta) =>
    http<Richiesta>(`/richieste/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};
