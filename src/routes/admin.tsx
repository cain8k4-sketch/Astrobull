import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Inbox, LogOut, X } from "lucide-react";
import {
  loadAllSignups,
  updateSignupStatus,
  type CreatorSignup,
  type CreatorStatus,
} from "@/lib/signup";
import { shortAddr } from "@/lib/wallet";
import { cn } from "@/lib/utils";

const ADMIN_PASS_KEY = "astrobull.admin.ok";
/** Change this before going public — or set VITE_ADMIN_PASSWORD */
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

  useEffect(() => {
    try {
      if (sessionStorage.getItem(ADMIN_PASS_KEY) === "1") setAuthed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (authed) setList(loadAllSignups());
  }, [authed]);

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
      setList(loadAllSignups());
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

  function setStatus(id: string, status: CreatorStatus) {
    setList(updateSignupStatus(id, status));
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
            {list.filter((c) => c.status === "pending").length} pending · {list.length}{" "}
            total
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-red"
        >
          <LogOut size={12} /> Lock
        </button>
      </div>

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
        {shown.length === 0 ? (
          <p className="border border-white/10 px-4 py-8 text-center font-mono text-xs text-muted">
            No creators in this filter yet. Sign-ups land here after someone uses{" "}
            <Link to="/signup" className="text-green underline">
              /signup
            </Link>
            .
          </p>
        ) : (
          shown.map((c) => (
            <article
              key={c.id}
              className="border border-white/10 bg-surface px-4 py-4"
            >
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
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "approved")}
                  className="inline-flex items-center gap-1 border border-green/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-green hover:bg-green/10"
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "rejected")}
                  className="inline-flex items-center gap-1 border border-red/40 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-red hover:bg-red/10"
                >
                  <X size={12} /> Reject
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "pending")}
                  className="border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted"
                >
                  Reset pending
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <p className="mt-8 font-mono text-[10px] leading-relaxed text-dim">
        Cloud: set <code className="text-muted">VITE_SUPABASE_URL</code> +{" "}
        <code className="text-muted">VITE_SUPABASE_ANON_KEY</code> for live DB. Notify: set{" "}
        <code className="text-muted">VITE_OWNER_EMAIL</code> for mailto alerts on signup.
        Password: <code className="text-muted">VITE_ADMIN_PASSWORD</code> (default
        astro-herd — change it).
      </p>
      <Link
        to="/"
        className="mt-4 inline-block font-mono text-[11px] uppercase tracking-widest text-muted no-underline hover:text-green"
      >
        ← Home
      </Link>
    </main>
  );
}
