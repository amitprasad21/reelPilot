-- ============================================================
-- ReelPilot — Generated Video Assets
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

create table if not exists public.generated_video_assets (
  id                     uuid primary key default uuid_generate_v4(),
  series_id              uuid not null references public.video_series (id) on delete cascade,
  user_id                text not null,
  title                  text not null,
  script                 text,
  duration_target        text,
  voice_provider         text,
  voice_id               text,
  voiceover_url          text,
  voiceover_storage_path text,
  transcript             text,
  captions_json          jsonb not null default '[]'::jsonb,
  scenes_json            jsonb not null default '[]'::jsonb,
  images_json            jsonb not null default '[]'::jsonb,
  status                 text not null default 'completed'
                         check (status in ('pending', 'completed', 'failed')),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists idx_generated_video_assets_series_id
  on public.generated_video_assets (series_id);

create index if not exists idx_generated_video_assets_user_id
  on public.generated_video_assets (user_id);

create index if not exists idx_generated_video_assets_created_at
  on public.generated_video_assets (created_at desc);

-- Reuse shared trigger function from initial schema.
drop trigger if exists trg_generated_video_assets_updated_at on public.generated_video_assets;
create trigger trg_generated_video_assets_updated_at
  before update on public.generated_video_assets
  for each row execute procedure public.handle_updated_at();

alter table public.generated_video_assets enable row level security;

-- Policies guarded with DO blocks so rerunning migration is safe.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'generated_video_assets'
      and policyname = 'generated_video_assets: select own'
  ) then
    create policy "generated_video_assets: select own"
      on public.generated_video_assets for select
      using (auth.uid()::text = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'generated_video_assets'
      and policyname = 'generated_video_assets: insert own'
  ) then
    create policy "generated_video_assets: insert own"
      on public.generated_video_assets for insert
      with check (auth.uid()::text = user_id);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'generated_video_assets'
      and policyname = 'generated_video_assets: update own'
  ) then
    create policy "generated_video_assets: update own"
      on public.generated_video_assets for update
      using (auth.uid()::text = user_id);
  end if;
end
$$;

-- Storage bucket for generated scene images.
insert into storage.buckets (id, name, public)
values ('generated-images', 'generated-images', true)
on conflict (id) do nothing;
