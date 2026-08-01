-- ═══════════════════════════════════════════════════════════════════════════
-- Astro Bull — Supabase setup (run once in SQL Editor)
-- Dashboard → SQL → New query → paste all → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) Creator sign-ups (feeds /signup + /admin)
create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  wallet text not null,
  handle_tiktok text,
  handle_youtube text,
  handle_snapchat text,
  handle_x text,
  handle_instagram text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  total_earned numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creators_status_idx on public.creators (status);
create index if not exists creators_created_at_idx on public.creators (created_at desc);
create index if not exists creators_email_idx on public.creators (email);

-- 2) Public leaderboard
create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text,
  platform text default 'Multi',
  posts int not null default 0,
  views bigint not null default 0,
  points int not null default 0,
  earned_usd numeric not null default 0,
  featured boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists leaderboard_points_idx on public.leaderboard (points desc);

-- Keep updated_at fresh on creators
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists creators_set_updated_at on public.creators;
create trigger creators_set_updated_at
  before update on public.creators
  for each row execute function public.set_updated_at();

-- 3) Row Level Security
alter table public.creators enable row level security;
alter table public.leaderboard enable row level security;

-- Creators: anyone can sign up (insert)
drop policy if exists "creators_public_insert" on public.creators;
create policy "creators_public_insert"
  on public.creators for insert
  to anon, authenticated
  with check (true);

-- Creators: public read (admin UI + optional public lists)
drop policy if exists "creators_public_select" on public.creators;
create policy "creators_public_select"
  on public.creators for select
  to anon, authenticated
  using (true);

-- Creators: public update status (admin approve/reject via site password)
-- For stronger security later: move admin to Edge Function + service role.
drop policy if exists "creators_public_update" on public.creators;
create policy "creators_public_update"
  on public.creators for update
  to anon, authenticated
  using (true)
  with check (true);

-- Leaderboard: public read only
drop policy if exists "leaderboard_public_select" on public.leaderboard;
create policy "leaderboard_public_select"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

-- Leaderboard writes: service role / Table Editor only (no anon insert/update)

-- 4) Realtime (optional — admin can poll; enable if you want live refresh)
-- alter publication supabase_realtime add table public.creators;

-- 5) Email notification via Database Webhook (optional, recommended)
-- Supabase Dashboard → Database → Webhooks → Create a new hook
--   Table: creators | Event: INSERT
--   Type: HTTP Request
--   URL: your Discord/Zapier/Make webhook OR Supabase Edge Function that emails you
-- Example Discord payload is handled by many "webhook → Discord" zaps automatically.

comment on table public.creators is 'Astro Bull creator sign-ups from /signup';
comment on table public.leaderboard is 'Public creator activity leaderboard';
