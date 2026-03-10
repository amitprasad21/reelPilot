-- ============================================================
-- ReelPilot — Voices table
-- Stores AI voice metadata for all providers
-- ============================================================

create table if not exists public.voices (
  id          uuid primary key default uuid_generate_v4(),
  voice_id    text not null unique,
  name        text not null,
  language    text not null,
  gender      text not null default 'unknown',
  tone        text,
  provider    text not null,
  preview_url text,
  created_at  timestamptz not null default now()
);

-- Index for fast language filtering (used by the UI)
create index if not exists idx_voices_language on public.voices (language);
create index if not exists idx_voices_provider on public.voices (provider);

-- Allow all authenticated users to read voices (public catalogue)
alter table public.voices enable row level security;

create policy "voices: select for authenticated"
  on public.voices for select
  to authenticated
  using (true);
