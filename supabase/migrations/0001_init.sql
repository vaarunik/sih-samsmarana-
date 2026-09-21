-- ============================================================
-- SAMSMARANA — Supabase schema migration (PostgreSQL)
-- ============================================================
-- This migration mirrors the Prisma/SQLite schema used by the local
-- demo and expresses it as PostgreSQL + Row Level Security so the
-- project owner can run the same model on Supabase.
--
-- Run in: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- ============================================================

-- Extensions ---------------------------------------------------
create extension if not exists "pgcrypto";

-- Profiles (elder / caregiver / family) -----------------------
create table if not exists public.profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade,
  role            text not null default 'ELDER' check (role in ('ELDER','CAREGIVER','FAMILY')),
  name            text not null,
  age             int  not null default 70,
  language        text not null default 'en',
  region_group    text not null default 'South India',
  region_state    text not null default 'Karnataka',
  interests       jsonb not null default '[]'::jsonb,
  preferred_activities jsonb not null default '[]'::jsonb,
  caregiver_name     text,
  caregiver_relation text,
  family_name        text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Activity attempts (synced from offline-first IndexedDB) -----
create table if not exists public.activity_attempts (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  activity_id   text not null,
  category      text not null,
  title         text not null,
  difficulty    int  not null default 1,
  accuracy      double precision not null default 0,
  response_ms   int  not null default 0,
  completed     boolean not null default false,
  skipped       boolean not null default false,
  score         int  not null default 0,
  sync_state    text not null default 'synced' check (sync_state in ('synced','pending')),
  sync_id       text not null unique,            -- idempotent offline sync
  created_at    timestamptz not null default now()
);
create index if not exists idx_attempts_profile_created
  on public.activity_attempts (profile_id, created_at desc);

-- AI video generation records (Coming Soon feature) -----------
create table if not exists public.video_generations (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  activity_id   text not null,
  category      text not null,
  prompt        text not null,
  model         text not null,
  operation_id  text,
  status        text not null default 'preparing'
                  check (status in ('preparing','generating','ready','failed','unavailable')),
  video_url     text,
  questions     jsonb not null default '[]'::jsonb,
  message       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_videos_profile_created
  on public.video_generations (profile_id, created_at desc);

-- Reminders (non-medical, supportive only) -------------------
create table if not exists public.reminders (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type       text not null check (type in ('medication','appointment','meal','hydration','activity','routine')),
  title      text not null,
  time       text not null,
  days       jsonb not null default '[]'::jsonb,
  enabled    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_reminders_profile on public.reminders (profile_id);

-- Family engagement messages ---------------------------------
create table if not exists public.family_messages (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  from_name  text not null,
  type       text not null check (type in ('text','voice','photo','clip','occasion','note')),
  content    text not null,
  caption    text,
  created_at timestamptz not null default now()
);
create index if not exists idx_family_profile_created
  on public.family_messages (profile_id, created_at desc);

-- Caregiver ↔ elder relationships ----------------------------
create table if not exists public.caregiver_relationships (
  id           uuid primary key default gen_random_uuid(),
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  elder_id     uuid not null references public.profiles(id) on delete cascade,
  relation     text,
  created_at   timestamptz not null default now(),
  unique (caregiver_id, elder_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles            enable row level security;
alter table public.activity_attempts   enable row level security;
alter table public.video_generations   enable row level security;
alter table public.reminders           enable row level security;
alter table public.family_messages     enable row level security;
alter table public.caregiver_relationships enable row level security;

-- A user can read/update their own profile row.
create policy "profiles self read"
  on public.profiles for select
  using (auth.uid() = user_id);
create policy "profiles self update"
  on public.profiles for update
  using (auth.uid() = user_id);
create policy "profiles self insert"
  on public.profiles for insert
  with check (auth.uid() = user_id);

-- A user can fully manage attempts/reminders/videos/family for their own profile.
create policy "attempts owner all"
  on public.activity_attempts for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "videos owner all"
  on public.video_generations for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "reminders owner all"
  on public.reminders for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));
create policy "family owner all"
  on public.family_messages for all
  using (profile_id in (select id from public.profiles where user_id = auth.uid()));

-- Caregivers can read (not write) their linked elder's data.
create policy "caregiver reads elder attempts"
  on public.activity_attempts for select
  using (
    profile_id in (
      select elder_id from public.caregiver_relationships
      where caregiver_id in (select id from public.profiles where user_id = auth.uid())
    )
  );
create policy "caregiver reads elder reminders"
  on public.reminders for select
  using (
    profile_id in (
      select elder_id from public.caregiver_relationships
      where caregiver_id in (select id from public.profiles where user_id = auth.uid())
    )
  );

-- updated_at trigger -----------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_videos_touch on public.video_generations;
create trigger trg_videos_touch before update on public.video_generations
  for each row execute function public.touch_updated_at();
