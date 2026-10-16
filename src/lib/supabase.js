import { createClient } from "@supabase/supabase-js";
import { runtime } from "../config/runtime.js";

const { supabaseUrl: url, supabaseAnonKey: anonKey } = runtime;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const cloudEnabled = Boolean(supabase);
