-- Migration: log delle chiamate LLM per la sezione "Observability".
-- Eseguire nel SQL editor di Supabase.

create table if not exists powering_llm_calls (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('anthropic', 'openai')),
  model text not null,
  started_at timestamptz not null default now(),
  duration_ms integer not null,
  tokens_input integer,
  tokens_output integer,
  status text not null check (status in ('ok', 'parse_error', 'api_error')),
  attempt integer not null default 1,
  error text,
  testo_input text not null,
  response_raw jsonb,
  classificazione jsonb
);

create index if not exists powering_llm_calls_started_at_idx
  on powering_llm_calls (started_at desc);
