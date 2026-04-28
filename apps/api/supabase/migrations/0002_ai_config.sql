-- Migration: tabella di configurazione del modello AI (singleton).
-- Eseguire nel SQL editor di Supabase.

create table if not exists powering_ai_config (
  id boolean primary key default true,
  provider text not null check (provider in ('anthropic', 'openai')),
  model text not null,
  updated_at timestamptz not null default now(),
  constraint powering_ai_config_singleton check (id = true)
);

-- Seed iniziale (Anthropic Haiku come default).
insert into powering_ai_config (id, provider, model)
values (true, 'anthropic', 'claude-haiku-4-5')
on conflict (id) do nothing;
