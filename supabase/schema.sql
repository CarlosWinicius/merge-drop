-- Merge Drop: banco remoto mínimo para perfil, recordes e partidas.
-- Execute no SQL Editor do Supabase antes de ativar a sincronização.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Jogador',
  best_score integer not null default 0 check (best_score >= 0),
  best_block integer not null default 2 check (best_block >= 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_runs (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 0),
  largest_block integer not null check (largest_block >= 2),
  max_combo integer not null default 0 check (max_combo >= 0),
  duration_seconds integer not null default 0 check (duration_seconds between 0 and 86400),
  level integer not null default 1 check (level between 1 and 999),
  platform text not null default 'web' check (platform in ('web', 'android', 'ios', 'desktop')),
  created_at timestamptz not null default now()
);

create index if not exists game_runs_score_idx on public.game_runs(score desc, created_at desc);
create index if not exists game_runs_player_idx on public.game_runs(player_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.sync_profile_stats()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
  set best_score = greatest(best_score, new.score),
      best_block = greatest(best_block, new.largest_block)
  where id = new.player_id;
  return new;
end;
$$;

drop trigger if exists game_runs_sync_profile_stats on public.game_runs;
create trigger game_runs_sync_profile_stats after insert on public.game_runs
for each row execute function public.sync_profile_stats();

create or replace function public.get_leaderboard(limit_count integer default 50)
returns table (rank bigint, player_id uuid, display_name text, best_score integer, best_block integer)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by p.best_score desc, p.best_block desc, p.created_at asc),
         p.id, p.display_name, p.best_score, p.best_block
  from public.profiles p
  where p.best_score > 0
  order by p.best_score desc, p.best_block desc, p.created_at asc
  limit least(greatest(limit_count, 1), 100);
$$;

alter table public.profiles enable row level security;
alter table public.game_runs enable row level security;

drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles for select using (true);
drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists game_runs_insert_self on public.game_runs;
create policy game_runs_insert_self on public.game_runs for insert with check (auth.uid() = player_id);
drop policy if exists game_runs_select_public on public.game_runs;
create policy game_runs_select_public on public.game_runs for select using (true);

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.game_runs to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert on public.game_runs to authenticated;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
