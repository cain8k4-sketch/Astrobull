const STORAGE = "astrobull.signup.v1";
const ADMIN_STORAGE = "astrobull.admin.inbox.v1";

export type CreatorStatus = "pending" | "approved" | "rejected";

export type CreatorSignup = {
  id: string;
  name: string;
  email: string;
  wallet: string;
  handle_tiktok: string;
  handle_youtube: string;
  handle_snapchat: string;
  handle_x: string;
  handle_instagram: string;
  status: CreatorStatus;
  total_earned: number;
  at: string;
};

function uid() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadAllSignups(): CreatorSignup[] {
  try {
    // Prefer admin inbox (shared view); fall back to device signup list
    const admin = localStorage.getItem(ADMIN_STORAGE);
    if (admin) return JSON.parse(admin) as CreatorSignup[];
    const list = JSON.parse(localStorage.getItem(STORAGE) || "[]") as CreatorSignup[];
    return list;
  } catch {
    return [];
  }
}

export function loadLastSignup(): CreatorSignup | null {
  return loadAllSignups()[0] || null;
}

function persistAdmin(list: CreatorSignup[]) {
  try {
    localStorage.setItem(ADMIN_STORAGE, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* ignore */
  }
}

export function saveSignup(
  data: Omit<CreatorSignup, "id" | "at" | "status" | "total_earned">,
): CreatorSignup {
  const entry: CreatorSignup = {
    ...data,
    id: uid(),
    status: "pending",
    total_earned: 0,
    at: new Date().toISOString(),
  };
  try {
    const device = JSON.parse(localStorage.getItem(STORAGE) || "[]") as CreatorSignup[];
    device.unshift(entry);
    localStorage.setItem(STORAGE, JSON.stringify(device.slice(0, 50)));
  } catch {
    /* ignore */
  }
  try {
    const admin = loadAllSignups().filter((x) => x.id !== entry.id);
    admin.unshift(entry);
    persistAdmin(admin);
  } catch {
    /* ignore */
  }
  return entry;
}

export function updateSignupStatus(id: string, status: CreatorStatus) {
  const list = loadAllSignups().map((c) => (c.id === id ? { ...c, status } : c));
  persistAdmin(list);
  return list;
}

export function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

/** Optional Supabase REST insert — set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY */
export async function pushSignupToSupabase(
  entry: CreatorSignup,
): Promise<{ ok: boolean; offline?: boolean; status?: number; message?: string }> {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (!url || !key) return { ok: false, offline: true };

  const payload = {
    name: entry.name,
    email: entry.email,
    wallet: entry.wallet,
    handle_tiktok: entry.handle_tiktok || null,
    handle_youtube: entry.handle_youtube || null,
    handle_snapchat: entry.handle_snapchat || null,
    handle_x: entry.handle_x || null,
    handle_instagram: entry.handle_instagram || null,
    status: entry.status,
    total_earned: entry.total_earned,
  };

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/creators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, status: res.status, message: t.slice(0, 200) };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

/** Opens a mailto draft to notify you of a new signup */
export function notifyOwnerMailto(entry: CreatorSignup, ownerEmail?: string) {
  const to = (ownerEmail || import.meta.env.VITE_OWNER_EMAIL || "").trim();
  if (!to || typeof window === "undefined") return false;
  const subject = encodeURIComponent(`Astro Bull · new creator: ${entry.name}`);
  const body = encodeURIComponent(
    [
      "New creator signup",
      "",
      `Name: ${entry.name}`,
      `Email: ${entry.email}`,
      `Wallet: ${entry.wallet}`,
      `TikTok: ${entry.handle_tiktok || "—"}`,
      `YouTube: ${entry.handle_youtube || "—"}`,
      `Snapchat: ${entry.handle_snapchat || "—"}`,
      `X: ${entry.handle_x || "—"}`,
      `Instagram: ${entry.handle_instagram || "—"}`,
      `Status: ${entry.status}`,
      `Time: ${entry.at}`,
      "",
      "Open Admin inbox on the site to approve / reject.",
    ].join("\n"),
  );
  window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
  return true;
}
