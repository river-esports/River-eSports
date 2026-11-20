-- RIVER ESPORTS CMS — run this entire script in Supabase SQL Editor.
-- Browser uses ONLY the anon key. Never expose service_role credentials.
create extension if not exists pgcrypto;

create table if not exists public.tournaments (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 status text not null default 'Upcoming' check (status in ('Upcoming','Live','Completed','Postponed')),
 game text default 'BGMI',
 event_date date,
 prize_pool numeric(12,2),
 registration_url text,
 description text,
 created_at timestamptz not null default now()
);
create table if not exists public.matches (
 id uuid primary key default gen_random_uuid(),
 tournament_name text not null,
 round_name text not null,
 match_date date,
 match_time text,
 map_name text,
 details text,
 created_at timestamptz not null default now()
);
create table if not exists public.results (
 id uuid primary key default gen_random_uuid(),
 tournament_name text not null,
 winner text not null,
 runner_up text,
 third_place text,
 prize_pool numeric(12,2),
 summary text,
 created_at timestamptz not null default now()
);
create table if not exists public.teams (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 category text,
 players text,
 description text,
 created_at timestamptz not null default now()
);
create table if not exists public.news (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 body text,
 image_url text,
 published_at date default current_date,
 created_at timestamptz not null default now()
);
create table if not exists public.sponsors (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 website_url text,
 logo_url text,
 sort_order integer default 0,
 created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
 key text primary key,
 value text
);

alter table public.tournaments enable row level security;
alter table public.matches enable row level security;
alter table public.results enable row level security;
alter table public.teams enable row level security;
alter table public.news enable row level security;
alter table public.sponsors enable row level security;
alter table public.site_settings enable row level security;

-- Public can read published organisation content.
drop policy if exists "Public read tournaments" on public.tournaments;
create policy "Public read tournaments" on public.tournaments for select using (true);
drop policy if exists "Public read matches" on public.matches;
create policy "Public read matches" on public.matches for select using (true);
drop policy if exists "Public read results" on public.results;
create policy "Public read results" on public.results for select using (true);
drop policy if exists "Public read teams" on public.teams;
create policy "Public read teams" on public.teams for select using (true);
drop policy if exists "Public read news" on public.news;
create policy "Public read news" on public.news for select using (true);
drop policy if exists "Public read sponsors" on public.sponsors;
create policy "Public read sponsors" on public.sponsors for select using (true);
drop policy if exists "Public read settings" on public.site_settings;
create policy "Public read settings" on public.site_settings for select using (true);

-- Only authenticated users can manage CMS content.
do $$ declare t text; begin
 foreach t in array array['tournaments','matches','results','teams','news','sponsors','site_settings'] loop
  execute format('drop policy if exists "Authenticated manage %1$s" on public.%1$I',t);
  execute format('create policy "Authenticated manage %1$s" on public.%1$I for all to authenticated using (true) with check (true)',t);
 end loop;
end $$;
