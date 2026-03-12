-- ============================================================
-- ReelPilot — Add status column to video_series
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

alter table public.video_series
  add column if not exists status text not null default 'active'
    check (status in ('active', 'paused'));
