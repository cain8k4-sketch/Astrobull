import { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Repeat2, AtSign, Megaphone } from "lucide-react";
import {
  MAIN_X_HANDLE,
  MAIN_X_URL,
  loadXSnapshot,
  saveXSnapshot,
  xMentionsSearchUrl,
  xPostsSearchUrl,
  xProfileUrl,
  xRepliesSearchUrl,
  xRetweetsSearchUrl,
  type XTrackSnapshot,
} from "@/lib/x-track";
import { useReveal } from "@/hooks/use-reveal";

export default function XAccountTracker() {
  const ref = useReveal<HTMLDivElement>();
  const [snap, setSnap] = useState<XTrackSnapshot | null>(null);
  const [posts, setPosts] = useState("");
  const [mentions, setMentions] = useState("");
  const [rts, setRts] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const s = loadXSnapshot();
    setSnap(s);
    setPosts(s.posts != null ? String(s.posts) : "");
    setMentions(s.mentions != null ? String(s.mentions) : "");
    setRts(s.retweets != null ? String(s.retweets) : "");
    setNote(s.note || "");
  }, []);

  function save() {
    const next = saveXSnapshot({
      posts: posts === "" ? null : Number(posts) || 0,
      mentions: mentions === "" ? null : Number(mentions) || 0,
      retweets: rts === "" ? null : Number(rts) || 0,
      note: note.trim() || "Manual snapshot from X searches",
    });
    setSnap(next);
  }

  const cards = [
    {
      label: "Posts",
      Icon: Megaphone,
      href: xPostsSearchUrl(),
      value: snap?.posts,
      hint: `from:${MAIN_X_HANDLE}`,
    },
    {
      label: "Mentions",
      Icon: AtSign,
      href: xMentionsSearchUrl(),
      value: snap?.mentions,
      hint: `@${MAIN_X_HANDLE}`,
    },
    {
      label: "Retweets",
      Icon: Repeat2,
      href: xRetweetsSearchUrl(),
      value: snap?.retweets,
      hint: "native RTs",
    },
  ] as const;

  return (
    <section
      id="x-track"
      className="border-t border-white/5 bg-bg px-4 py-16 sm:px-8 md:px-14 md:py-20"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 w-2 rotate-45 bg-fg shadow-[0_0_10px_#fff]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted sm:text-xs">
            Main account radar
          </span>
        </div>
        <h2
          className="font-display uppercase leading-none text-fg"
          style={{ fontSize: "clamp(2.2rem, 8vw, 3.8rem)" }}
        >
          @{MAIN_X_HANDLE}
          <span className="animate-flicker"> track</span>
        </h2>
        <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
          Watch the official herd account for{" "}
          <span className="text-fg">posts</span>,{" "}
          <span className="text-fg">mentions</span>, and{" "}
          <span className="text-fg">retweets</span>. Live X search opens in a
          new tab (no API key required). Save a snapshot after you count.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={MAIN_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-fg no-underline hover:border-fg"
          >
            <ExternalLink size={12} /> Profile
          </a>
          <a
            href={xRepliesSearchUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted no-underline hover:text-fg"
          >
            Replies to us
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {cards.map(({ label, Icon, href, value, hint }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-white/10 bg-surface p-4 no-underline transition-colors hover:border-red/50"
            >
              <div className="flex items-center justify-between">
                <Icon size={14} className="text-red" />
                <ExternalLink size={12} className="text-dim" />
              </div>
              <p className="mt-3 font-display text-2xl uppercase text-fg">
                {value != null ? value.toLocaleString() : "—"}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                {label}
              </p>
              <p className="mt-1 font-mono text-[9px] text-dim">{hint}</p>
            </a>
          ))}
        </div>

        <div className="mt-8 rounded-md border border-white/10 bg-surface p-4 sm:p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-dim">
            Snapshot counters (manual / admin)
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="font-mono text-[9px] uppercase text-dim">Posts</span>
              <input
                value={posts}
                onChange={(e) => setPosts(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-sm border border-white/15 bg-bg px-2 py-2 font-mono text-sm text-fg outline-none focus:border-red"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] uppercase text-dim">Mentions</span>
              <input
                value={mentions}
                onChange={(e) => setMentions(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-sm border border-white/15 bg-bg px-2 py-2 font-mono text-sm text-fg outline-none focus:border-red"
              />
            </label>
            <label className="block">
              <span className="font-mono text-[9px] uppercase text-dim">Retweets</span>
              <input
                value={rts}
                onChange={(e) => setRts(e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-sm border border-white/15 bg-bg px-2 py-2 font-mono text-sm text-fg outline-none focus:border-red"
              />
            </label>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note e.g. counted from X at 9am"
            className="mt-3 w-full rounded-sm border border-white/15 bg-bg px-3 py-2 font-mono text-xs text-fg outline-none placeholder:text-dim focus:border-red"
          />
          <button
            type="button"
            onClick={save}
            className="mt-3 inline-flex items-center gap-2 rounded-sm bg-red px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white hover:bg-red-hot"
          >
            <RefreshCw size={12} />
            Save snapshot
          </button>
          {snap?.updatedAt ? (
            <p className="mt-2 font-mono text-[10px] text-dim">
              Last saved {new Date(snap.updatedAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
