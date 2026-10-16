-- Reforço de segurança: execute depois do schema.sql.
-- O cliente não precisa consultar game_runs diretamente; o ranking usa a RPC.

drop policy if exists profiles_select_public on public.profiles;
drop policy if exists game_runs_select_public on public.game_runs;

create policy profiles_select_authenticated on public.profiles
  for select to authenticated using (true);

-- Partidas brutas ficam privadas. O ranking público passa pela função limitada.
revoke select on public.game_runs from anon, authenticated;
revoke select on public.profiles from anon;
grant select on public.profiles to authenticated;

-- Limites de plausibilidade reduzem abuso acidental e payloads extremos.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'game_runs_score_reasonable') then
    alter table public.game_runs add constraint game_runs_score_reasonable check (score between 0 and 1000000000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'game_runs_block_reasonable') then
    alter table public.game_runs add constraint game_runs_block_reasonable check (largest_block between 2 and 1048576);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'game_runs_combo_reasonable') then
    alter table public.game_runs add constraint game_runs_combo_reasonable check (max_combo between 0 and 10000);
  end if;
end;
$$;

alter table public.profiles force row level security;
alter table public.game_runs force row level security;
