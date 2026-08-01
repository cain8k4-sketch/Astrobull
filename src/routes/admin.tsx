import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Inbox, LogOut, RefreshCw, X } from "lucide-react";
import {
  fetchCreatorsFromSupabase,
  isSupabaseConfigured,
  updateSignupStatusCloud,
  type CreatorSignup,
  type CreatorStatus,
} from "@/lib/signup";
import { shortAddr } from "@/lib/wallet";
import { cn } from "@/lib/utils";

const ADMIN_PASS_KEY = "astrobull.admin.ok";
/** Set VITE_ADMIN_PASSWORD in Vercel — do not leave the default in production */
const DEFAULT_ADMIN_PASSWORD =
  (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim() ||
  "astro-herd";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin inbox — Astro Bull" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [list, setList] = useState<CreatorSignup[]>([]);
  const [filter, setFilter] = useState<"all" | CreatorStatus>("pending");
  const [source, setSource] = useState<"live" | "local">("local");
  const [cloudMsg, setCloudMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const cloudOn = isSupabaseConfigured();

  const refresh = useCallback(async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await fetchCreatorsFromSupabase();
      setList(res.rows);
      setSource(res.source);
      setCloudMsg(res.message ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(ADMIN_PASS_KEY) === "1") setAuthed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (authed) void refresh();
  }, [authed, refresh]);

  const shown = useMemo(() => {
    if (filter === "all") return list;
    return list.filter((c) => c.status === filter);
  }, [list, filter]);

  function login(ev: FormEvent) {
    ev.preventDefault();
    if (pass === DEFAULT_ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem(ADMIN_PASS_KEY, "1");
      } catch {
        /* ignore */
      }
      setAuthed(true);
      setErr(null);
    } else {
      setErr("Wrong password.");
    }
  }

  function logout() {
    try {
      sessionStorage.removeItem(ADMIN_PASS_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
    setPass("");
  }

  async function setStatus(id: string, status: CreatorStatus) {
    setActionMsg(null);
    const res = await updateSignupStatusCloud(id, status);
    setList(res.rows);
    if (res.cloudOk) {
      setActionMsg(`Saved ${status} to cloud.`);
      setSource("live");
    } else if (res.message) {
      setActionMsg(res.message);
    }
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
          Private
        </p>
        <h1 className="mt-2 font-display text-4xl uppercase text-fg">Admin inbox</h1>
        <p className="mt-2 font-mono text-xs text-muted">
          Review creator sign-ups. Password only — not public.
        </p>
        <form onSubmit={login} className="mt-6 space-y-3">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Admin password"
            autoComplete="current-password"
            className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none focus:border-red"
          />
          <button
            type="submit"
            className="w-full bg-red py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white"
          >
            Unlock
          </button>
          {err ? <p className="font-mono text-xs text-red-hot">{err}</p> : null}
        </form>
        <p className="mt-4 font-mono text-[10px] text-dim">
          Password from <code className="text-muted">VITE_ADMIN_PASSWORD</code> in Vercel.
          {DEFAULT_ADMIN_PASSWORD === "astro-herd" ? (
            <span className="mt-1 block text-gold">
              Still on default — change it before going public.
            </span>
          ) : null}
        </p>
        <Link
          to="/"
          className="mt-8 block text-center font-mono text-[11px] uppercase tracking-widest text-muted no-underline"
        >
          ← Home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
            <Inbox size={12} /> Admin inbox
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase text-fg">Creators</h1>
          <p className="mt-1 font-mono text-xs text-muted">
            {list.filter((c) => c.status === "pending").length} pending · {list.length} total
            {" · "}
            <span className={source === "live" ? "text-green" : "text-gold"}>
              {source === "live" ? "cloud" : "this device"}
            </span>
            {cloudOn ? null : (
              <span className="text-dim"> · Supabase not set</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-green disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : undefined} />{" "}
            Refresh
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-red"
          >
            <LogOut size={12} /> Lock
          </button>
        </div>
      </div>

      {cloudMsg ? (
        <p className="mt-3 border border-white/10 bg-surface px-3 py-2 font-mono text-[11px] text-muted">
          {cloudMsg}
        </p>
      ) : null}
      {actionMsg ? (
        <p className="mt-2 font-mono text-[11px] text-green">{actionMsg}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-widest",
              filter === f
                ? "border-red bg-red/20 text-red"
                : "border-white/15 text-muted hover:border-white/30",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && list.length === 0 ? (
          <p className="border border-white/10 px-4 py-8 text-center font-mono text-xs text-muted">
            Loading creators…
          </p>
        ) : shown.length === 0 ? (
          <p className="border border-white/10 px-4 py-8 text-center font-mono text-xs text-muted">
            No creators in this filter yet. Sign-ups land here after someone uses{" "}
            <Link to="/signup" className="text-green underline">
              /signup
            </Link>
            .
          </p>
        ) : (
          shown.map((c) => (
            <article key={c.id} className="border border-white/10 bg-surface px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl uppercase text-fg">{c.name}</h2>
                  <p className="font-mono text-[11px] text-muted">{c.email}</p>
                </div>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-widest",
                    c.status === "pending" && "text-gold",
                    c.status === "approved" && "text-green",
                    c.status === "rejected" && "text-red",
                  )}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-2 break-all font-mono text-[11px] text-fg">
                {shortAddr(c.wallet)} · <span className="text-dim">{c.wallet}</span>
              </p>
              <ul className="mt-2 space-y-0.5 font-mono text-[11px] text-muted">
                {c.handle_tiktok ? <li>TikTok: {c.handle_tiktok}</li> : null}
                {c.handle_youtube ? <li>YouTube: {c.handle_youtube}</li> : null}
                {c.handle_snapchat ? <li>Snap: {c.handle_snapchat}</li> : null}
                {c.handle_x ? <li>X: {c.handle_x}</li> : null}
                {c.handle_instagram ? <li>IG: {c.handle_instagram}</li> : null}
              </ul>
              <p className="mt-2 font-mono text-[10px] text-dim">
                {new Date(c.at).toLocaleString()}
                {c.id.startsWith("c_") ? " · local id" : " · cloud id"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void setStatus(c.id, "approved")}
                  className="inline-flex items-center gap-1 border border-green/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-green hover:bg-green/10"
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => void setStatus(c.id, "rejected")}
                  className="inline-flex items-center gap-1 border border-red/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-red hover:bg-red/10"
                >
                  <X size={12} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => void setStatus(c.id, "pending")}
                  className="border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted"
                >
                  Reset pending
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-8 space-y-2 border border-white/10 bg-surface px-4 py-4 font-mono text-[10px] leading-relaxed text-dim">
        <p className="text-muted uppercase tracking-widest">Setup checklist</p>
        <p>
          1. Supabase SQL: run <code className="text-muted">supabase/setup.sql</code> in the
          SQL Editor.
        </p>
        <p>
          2. Vercel env: <code className="text-muted">VITE_SUPABASE_URL</code>,{" "}
          <code className="text-muted">VITE_SUPABASE_ANON_KEY</code>,{" "}
          <code className="text-muted">VITE_ADMIN_PASSWORD</code>,{" "}
          <code className="text-muted">VITE_OWNER_EMAIL</code> (mailto), optional{" "}
          <code className="text-muted">VITE_NOTIFY_WEBHOOK_URL</code> (Discord/Zapier).
        </p>
        <p>3. Redeploy Vercel after adding env vars.</p>
        <p>
          Cloud: {cloudOn ? <span className="text-green">configured</span> : (
            <span className="text-gold">not configured</span>
          )}
        </p>
      </div>
      <Link
        to="/"
        className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest text-muted no-underline hover:text-green"
      >
        ← Home
      </Link>
    </main>
  );
}
