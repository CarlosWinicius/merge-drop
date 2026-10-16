import { MergeDropEngine } from "../game-engine.js";
import { runtime } from "../config/runtime.js";
import { localGameStorage } from "../infrastructure/storage/local-game-storage.js";
import { createRunRepository } from "../lib/cloud-sync.js";

// Ponto de composição: a UI não conhece Supabase, localStorage ou detalhes do engine.
export function createGameSession(canvas, publish) {
  return new MergeDropEngine(canvas, publish, {
    storage: localGameStorage,
    platform: runtime.platform,
    onRunEnd: run => createRunRepository().save(run)
  });
}
