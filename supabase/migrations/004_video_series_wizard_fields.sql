-- ============================================================
-- ReelPilot — Add wizard steps 1-5 data to video_series
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table public.video_series
  add column if not exists niche text,
  add column if not exists language text,
  add column if not exists voice_id text,
  add column if not exists bg_tracks text[] not null default '{}',
  add column if not exists video_style text,
  add column if not exists caption_style text;
