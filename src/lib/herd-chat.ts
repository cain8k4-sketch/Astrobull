/**
 * Herd chat — local multi-tab (BroadcastChannel) + optional Supabase table `herd_chat`.
 * SQL for Supabase:
 *   create table if not exists herd_chat (
 *     id uuid primary key default gen_random_uuid(),
 *     handle text not null,
 *     text text not null,
 *     created_at timestamptz default now()
 *   );
 *   -- public read + insert (anon)
 */

import { getSupabaseConfig, supabaseHeaders } from "./supabase";

export type ChatMessage = {
  id: string;
  handle: string;
  text: string;
  createdAt: string;
  local?: boolean;
};

const LOCAL_KEY = "astrobull.herd.chat.v1";
const CHANNEL = "astrobull-herd-chat";
const MAX_LOCAL = 80;

function uid() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadLocalChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return seedMessages();
    const p = JSON.parse(raw) as ChatMessage[];
    if (Array.isArray(p) && p.length) return p.slice(-MAX_LOCAL);
  } catch {
    /* ignore */
  }
  return seedMessages();
}

function seedMessages(): ChatMessage[] {
  const t = Date.now();
  return [
    {
      id: "seed-1",
      handle: "@herd",
      text: "Welcome to herd chat. GM GM ASTROBULLS. Break the chains.",
      createdAt: new Date(t - 60_000).toISOString(),
    },
    {
      id: "seed-2",
      handle: "@chainbreaker",
      text: "Create free. Get featured. Get paid. Holding optional.",
      createdAt: new Date(t - 30_000).toISOString(),
    },
  ];
}

export function saveLocalChat(list: ChatMessage[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(-MAX_LOCAL)));
  } catch {
    /* ignore */
  }
}

export function appendLocal(msg: ChatMessage): ChatMessage[] {
  const next = [...loadLocalChat().filter((m) => m.id !== msg.id), msg].slice(
    -MAX_LOCAL,
  );
  saveLocalChat(next);
  return next;
}

/** Multi-tab same browser */
export function broadcastChat(msg: ChatMessage) {
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.postMessage({ type: "chat", msg });
    bc.close();
  } catch {
    /* ignore */
  }
}

export function subscribeChat(
  onMsg: (msg: ChatMessage) => void,
): () => void {
  try {
    const bc = new BroadcastChannel(CHANNEL);
    bc.onmessage = (ev) => {
      const d = ev.data as { type?: string; msg?: ChatMessage };
      if (d?.type === "chat" && d.msg) onMsg(d.msg);
    };
    return () => bc.close();
  } catch {
    return () => {};
  }
}

export async function fetchCloudChat(): Promise<{
  rows: ChatMessage[];
  source: "live" | "local";
  message?: string;
}> {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    return { rows: loadLocalChat(), source: "local" };
  }
  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/herd_chat?select=*&order=created_at.asc&limit=100`,
      { headers: supabaseHeaders(cfg.key) },
    );
    if (!res.ok) {
      return {
        rows: loadLocalChat(),
        source: "local",
        message: `Cloud chat not ready (${res.status}) — local herd mode`,
      };
    }
    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || !data.length) {
      return {
        rows: loadLocalChat(),
        source: "local",
        message: "Cloud empty — chat locally until first cloud messages land",
      };
    }
    const rows: ChatMessage[] = data.map((r) => ({
      id: String(r.id),
      handle: String(r.handle ?? "anon"),
      text: String(r.body ?? ""),
      createdAt: String(r.created_at ?? new Date().toISOString()),
    }));
    return { rows, source: "live" };
  } catch {
    return {
      rows: loadLocalChat(),
      source: "local",
      message: "Could not reach cloud — local herd mode",
    };
  }
}

export async function postChat(opts: {
  handle: string;
  text: string;
}): Promise<{ ok: boolean; msg?: ChatMessage; error?: string }> {
  const handle = (opts.handle || "anon").trim().slice(0, 32);
  const body = opts.body.trim().slice(0, 400);
  if (!body) return { ok: false, error: "Empty message" };

  const local: ChatMessage = {
    id: uid(),
    handle: handle.startsWith("@") ? handle : `@${handle}`,
    text,
    createdAt: new Date().toISOString(),
    local: true,
  };
  appendLocal(local);
  broadcastChat(local);

  const cfg = getSupabaseConfig();
  if (cfg) {
    try {
      const res = await fetch(`${cfg.url}/rest/v1/herd_chat`, {
        method: "POST",
        headers: {
          ...supabaseHeaders(cfg.key),
          Prefer: "return=representation",
        },
        text: JSON.stringify({
          handle: local.handle,
          text: local.body,
        }),
      });
      if (res.ok) {
        const rows = (await res.json()) as Array<Record<string, unknown>>;
        const r = rows?.[0];
        if (r) {
          return {
            ok: true,
            msg: {
              id: String(r.id),
              handle: String(r.handle),
              text: String(r.body),
              createdAt: String(r.created_at ?? local.createdAt),
            },
          };
        }
      }
    } catch {
      /* fall through local ok */
    }
  }

  return { ok: true, msg: local };
}
