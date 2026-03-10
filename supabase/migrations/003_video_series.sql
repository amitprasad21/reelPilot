-- ============================================================
-- ReelPilot — Video Series Scheduling
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.video_series (
  id            uuid primary key default uuid_generate_v4(),
  user_id       text not null,

  series_name   text not null,
  video_duration text not null,

  platforms     text[] not null default '{}',

  publish_at    timestamptz,
  generate_at   timestamptz,

  repeat_type   text not null default 'once'
                  check (repeat_type in ('once', 'weekly')),
  repeat_days   text[] not null default '{}',

  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_video_series_user_id on public.video_series (user_id);
create index if not exists idx_video_series_generate_at on public.video_series (generate_at);
