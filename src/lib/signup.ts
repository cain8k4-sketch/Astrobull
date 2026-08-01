import { getSupabaseConfig, isSupabaseConfigured, supabaseHeaders } from "./supabase";

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

export type NotifyResult = {
  /** Real email delivered via Web3Forms → your inbox */
  email: boolean;
  /** Discord / Slack / Zapier webhook */
  webhook: boolean;
  /** Only used as last-resort fallback (opens visitor’s mail app) */
  mailto: boolean;
  detail: string;
};

function uid() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function rowToSignup(r: Record<string, unknown>): CreatorSignup {
  return {
    id: String(r.id ?? uid()),
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    wallet: String(r.wallet ?? ""),
    handle_tiktok: String(r.handle_tiktok ?? ""),
    handle_youtube: String(r.handle_youtube ?? ""),
    handle_snapchat: String(r.handle_snapchat ?? ""),
    handle_x: String(r.handle_x ?? ""),
    handle_instagram: String(r.handle_instagram ?? ""),
    status: (String(r.status ?? "pending") as CreatorStatus) || "pending",
    total_earned: Number(r.total_earned ?? 0),
    at: String(r.created_at ?? r.at ?? new Date().toISOString()),
  };
}

function signupSummary(entry: CreatorSignup): string {
  return [
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
    "Admin: https://www.astrobull.xyz/admin",
  ].join("\n");
}

export function loadAllSignups(): CreatorSignup[] {
  try {
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

/** Insert signup into Supabase `creators` table */
export async function pushSignupToSupabase(
  entry: CreatorSignup,
): Promise<{
  ok: boolean;
  offline?: boolean;
  status?: number;
  message?: string;
  id?: string;
}> {
  const cfg = getSupabaseConfig();
  if (!cfg) return { ok: false, offline: true };

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
    const res = await fetch(`${cfg.url}/rest/v1/creators`, {
      method: "POST",
      headers: supabaseHeaders(cfg.key, {
        Prefer: "return=representation",
      }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, status: res.status, message: t.slice(0, 280) };
    }
    const rows = (await res.json().catch(() => [])) as Array<Record<string, unknown>>;
    const id = rows?.[0]?.id ? String(rows[0].id) : undefined;
    if (id) {
      const local = loadAllSignups().map((c) =>
        c.id === entry.id || (c.email === entry.email && c.at === entry.at)
          ? { ...c, id }
          : c,
      );
      if (!local.some((c) => c.id === id)) {
        local.unshift({ ...entry, id });
      }
      persistAdmin(local);
    }
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

/** Load creators for admin — prefers Supabase, falls back to device */
export async function fetchCreatorsFromSupabase(): Promise<{
  rows: CreatorSignup[];
  source: "live" | "local";
  message?: string;
}> {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    return { rows: loadAllSignups(), source: "local", message: "Supabase not configured" };
  }

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/creators?select=*&order=created_at.desc&limit=200`,
      { headers: supabaseHeaders(cfg.key) },
    );
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        rows: loadAllSignups(),
        source: "local",
        message: `Cloud fetch failed (${res.status}): ${t.slice(0, 120)}`,
      };
    }
    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      const local = loadAllSignups();
      return {
        rows: local,
        source: local.length ? "local" : "live",
        message: local.length
          ? "Cloud empty — showing this device only"
          : "No sign-ups yet",
      };
    }
    const rows = data.map(rowToSignup);
    persistAdmin(rows);
    return { rows, source: "live" };
  } catch (e) {
    return {
      rows: loadAllSignups(),
      source: "local",
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

/** Update status in Supabase + local */
export async function updateSignupStatusCloud(
  id: string,
  status: CreatorStatus,
): Promise<{ rows: CreatorSignup[]; cloudOk: boolean; message?: string }> {
  const local = updateSignupStatus(id, status);
  const cfg = getSupabaseConfig();
  if (!cfg) return { rows: local, cloudOk: false, message: "Local only (no Supabase)" };

  if (id.startsWith("c_")) {
    return { rows: local, cloudOk: false, message: "Local entry — not in cloud" };
  }

  try {
    const res = await fetch(`${cfg.url}/rest/v1/creators?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: supabaseHeaders(cfg.key, { Prefer: "return=minimal" }),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return {
        rows: local,
        cloudOk: false,
        message: `Cloud update failed (${res.status}): ${t.slice(0, 120)}`,
      };
    }
    return { rows: local, cloudOk: true };
  } catch (e) {
    return {
      rows: local,
      cloudOk: false,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

/**
 * Real email to YOU via Web3Forms (free).
 * 1. Sign up at https://web3forms.com with your admin email
 * 2. Copy Access Key → VITE_WEB3FORMS_ACCESS_KEY in Vercel
 * 3. Redeploy
 */
export async function notifyOwnerEmail(entry: CreatorSignup): Promise<boolean> {
  const accessKey = (import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim();
  if (!accessKey) return false;

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Astro Bull · new creator: ${entry.name}`,
        from_name: "Astro Bull Signups",
        name: entry.name,
        email: entry.email,
        message: signupSummary(entry),
        wallet: entry.wallet,
        handle_tiktok: entry.handle_tiktok || "",
        handle_youtube: entry.handle_youtube || "",
        handle_snapchat: entry.handle_snapchat || "",
        handle_x: entry.handle_x || "",
        handle_instagram: entry.handle_instagram || "",
        botcheck: "",
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return data?.success !== false;
  } catch {
    return false;
  }
}

/** Last resort: opens the *visitor’s* mail app (not automatic to you). */
export function notifyOwnerMailto(entry: CreatorSignup, ownerEmail?: string) {
  const to = (ownerEmail || import.meta.env.VITE_OWNER_EMAIL || "").trim();
  if (!to || typeof window === "undefined") return false;
  const subject = encodeURIComponent(`Astro Bull · new creator: ${entry.name}`);
  const body = encodeURIComponent(signupSummary(entry));
  window.open(`mailto:${to}?subject=${subject}&body=${body}`, "_blank");
  return true;
}

/** Discord / Slack / Zapier / Make webhook */
export async function notifyOwnerWebhook(entry: CreatorSignup): Promise<boolean> {
  const hook = (import.meta.env.VITE_NOTIFY_WEBHOOK_URL as string | undefined)?.trim();
  if (!hook) return false;

  const text = [
    `**Astro Bull · new creator**`,
    `**${entry.name}** · ${entry.email}`,
    `Wallet: \`${entry.wallet}\``,
    [
      entry.handle_tiktok && `TikTok: ${entry.handle_tiktok}`,
      entry.handle_youtube && `YouTube: ${entry.handle_youtube}`,
      entry.handle_snapchat && `Snap: ${entry.handle_snapchat}`,
      entry.handle_x && `X: ${entry.handle_x}`,
      entry.handle_instagram && `IG: ${entry.handle_instagram}`,
    ]
      .filter(Boolean)
      .join(" · ") || "No handles",
    `Admin: https://www.astrobull.xyz/admin`,
  ].join("\n");

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text,
        text,
        name: entry.name,
        email: entry.email,
        wallet: entry.wallet,
        status: entry.status,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Prefer real channels first.
 * - Web3Forms → your inbox (automatic)
 * - Discord webhook (automatic)
 * - mailto only if nothing else is configured (visitor must click send)
 */
export async function notifyOwnerAll(entry: CreatorSignup): Promise<NotifyResult> {
  const email = await notifyOwnerEmail(entry);
  const webhook = await notifyOwnerWebhook(entry);

  // Only fall back to mailto when no automatic channel is configured
  const autoConfigured =
    !!(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim() ||
    !!(import.meta.env.VITE_NOTIFY_WEBHOOK_URL as string | undefined)?.trim();

  let mailto = false;
  if (!email && !webhook && !autoConfigured) {
    mailto = notifyOwnerMailto(entry);
  }

  const parts: string[] = [];
  if (email) parts.push("email sent to your inbox");
  if (webhook) parts.push("webhook notified");
  if (mailto) parts.push("email draft opened (visitor must send)");
  if (!parts.length) {
    parts.push(
      autoConfigured
        ? "notify configured but failed — check Web3Forms key / webhook"
        : "no notify env set (add VITE_WEB3FORMS_ACCESS_KEY)",
    );
  }

  return {
    email,
    webhook,
    mailto,
    detail: parts.join("; "),
  };
}

/** What notification env vars are present (for admin UI) */
export function getNotifyConfigStatus() {
  return {
    web3forms: !!(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined)?.trim(),
    webhook: !!(import.meta.env.VITE_NOTIFY_WEBHOOK_URL as string | undefined)?.trim(),
    ownerEmail: !!(import.meta.env.VITE_OWNER_EMAIL as string | undefined)?.trim(),
    adminPasswordSet:
      !!(import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim() &&
      (import.meta.env.VITE_ADMIN_PASSWORD as string).trim() !== "astro-herd",
  };
}

export { isSupabaseConfigured };
