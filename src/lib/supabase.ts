/** Shared Supabase REST helpers (browser-safe anon key only). */

export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isSupabaseConfigured(): boolean {
  return !!getSupabaseConfig();
}

export function supabaseHeaders(
  key: string,
  extra?: Record<string, string>,
): Record<string, string> {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}
