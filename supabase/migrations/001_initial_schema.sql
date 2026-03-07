-- ============================================================
-- ReelPilot — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enable required extensions ───────────────────────────────
create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────
-- Mirrors auth.users; created automatically via trigger below.
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  full_name    text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── series ───────────────────────────────────────────────────
create table if not exists public.series (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  title        text not null,
  description  text,
  niche        text,
  status       text not null default 'active'
                 check (status in ('active', 'paused', 'archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── videos ───────────────────────────────────────────────────
create table if not exists public.videos (
  id                uuid primary key default uuid_generate_v4(),
  series_id         uuid not null references public.series (id) on delete cascade,
  user_id           uuid not null references public.profiles (id) on delete cascade,
  title             text not null,
  script            text,
  voiceover_url     text,
  video_url         text,
  thumbnail_url     text,
  status            text not null default 'draft'
                      check (status in (
                        'draft', 'generating', 'rendering',
                        'ready', 'scheduled', 'published', 'failed'
                      )),
  scheduled_at      timestamptz,
  published_at      timestamptz,
  youtube_video_id  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── scenes ───────────────────────────────────────────────────
create table if not exists public.scenes (
  id          uuid primary key default uuid_generate_v4(),
  video_id    uuid not null references public.videos (id) on delete cascade,
  "order"     integer not null default 0,
  prompt      text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_series_user_id   on public.series  (user_id);
create index if not exists idx_videos_series_id on public.videos  (series_id);
create index if not exists idx_videos_user_id   on public.videos  (user_id);
create index if not exists idx_videos_status    on public.videos  (status);
create index if not exists idx_scenes_video_id  on public.scenes  (video_id);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create or replace trigger trg_series_updated_at
  before update on public.series
  for each row execute procedure public.handle_updated_at();

create or replace trigger trg_videos_updated_at
  before update on public.videos
  for each row execute procedure public.handle_updated_at();

-- ── Auto-create profile on sign-up ───────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.series   enable row level security;
alter table public.videos   enable row level security;
alter table public.scenes   enable row level security;

-- profiles: users can only read/update their own row
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- series: full CRUD for owner only
create policy "series: select own"
  on public.series for select
  using (auth.uid() = user_id);

create policy "series: insert own"
  on public.series for insert
  with check (auth.uid() = user_id);

create policy "series: update own"
  on public.series for update
  using (auth.uid() = user_id);

create policy "series: delete own"
  on public.series for delete
  using (auth.uid() = user_id);

-- videos: full CRUD for owner only
create policy "videos: select own"
  on public.videos for select
  using (auth.uid() = user_id);

create policy "videos: insert own"
  on public.videos for insert
  with check (auth.uid() = user_id);

create policy "videos: update own"
  on public.videos for update
  using (auth.uid() = user_id);

create policy "videos: delete own"
  on public.videos for delete
  using (auth.uid() = user_id);

-- scenes: inherit access from parent video
create policy "scenes: select via video owner"
  on public.scenes for select
  using (
    exists (
      select 1 from public.videos v
      where v.id = scenes.video_id
        and v.user_id = auth.uid()
    )
  );

create policy "scenes: insert via video owner"
  on public.scenes for insert
  with check (
    exists (
      select 1 from public.videos v
      where v.id = scenes.video_id
        and v.user_id = auth.uid()
    )
  );

create policy "scenes: update via video owner"
  on public.scenes for update
  using (
    exists (
      select 1 from public.videos v
      where v.id = scenes.video_id
        and v.user_id = auth.uid()
    )
  );

create policy "scenes: delete via video owner"
  on public.scenes for delete
  using (
    exists (
      select 1 from public.videos v
      where v.id = scenes.video_id
        and v.user_id = auth.uid()
    )
  );
