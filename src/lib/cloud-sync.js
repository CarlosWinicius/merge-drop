import { supabase } from "./supabase.js";
import { runtime } from "../config/runtime.js";

let sessionPromise;

async function getAnonymousUser() {
  if (!supabase) return null;
  sessionPromise ||= (async () => {
    const { data: existing } = await supabase.auth.getUser();
    if (existing?.user) return existing.user;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  })();
  try { return await sessionPromise; } catch (_) { sessionPromise = null; return null; }
}

async function syncRun(run) {
  const user = await getAnonymousUser();
  if (!user) return { synced: false, reason: "offline" };
  const profile = await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });
  if (profile.error) return { synced: false, reason: profile.error.message };
  const { error } = await supabase.from("game_runs").insert({
    player_id: user.id,
    score: run.score,
    largest_block: run.largest,
    max_combo: run.maxChain,
    duration_seconds: Math.round(run.durationSeconds),
    level: run.level,
    platform: run.platform || runtime.platform
  });
  return error ? { synced: false, reason: error.message } : { synced: true };
}

export function createRunRepository() {
  return { save: run => syncRun(run) };
}

export async function getLeaderboard(limit = 20) {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("get_leaderboard", { limit_count: limit });
  return error ? [] : data;
}
