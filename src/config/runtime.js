const hasWindow = typeof window !== "undefined";

export const runtime = {
  isBrowser: hasWindow,
  platform: hasWindow && /Android/i.test(window.navigator.userAgent) ? "android" : "web",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
};
