-- Migration: tabella powering_richieste
-- Eseguire nel SQL editor del progetto Supabase oppure tramite supabase CLI.

create type powering_categoria as enum (
  'tecnico',
  'amministrativo',
  'commerciale',
  'altro'
);

create type powering_priorita as enum (
  'bassa',
  'media',
  'alta'
);

create table if not exists powering_richieste (
  id uuid primary key default gen_random_uuid(),
  testo text not null check (length(testo) > 0),
  categoria powering_categoria not null,
  priorita powering_priorita not null,
  riassunto text,
  data_creazione timestamptz not null default now(),
  classificazione_errore boolean not null default false
);

create index if not exists powering_richieste_data_creazione_idx
  on powering_richieste (data_creazione desc);
