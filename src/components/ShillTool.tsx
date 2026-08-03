import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Megaphone,
  RefreshCw,
  Trophy,
} from "lucide-react";
import {
  buildShillPack,
  loadShillBoard,
  PLATFORM_LABEL,
  recordShill,
  type ShillEntry,
  type ShillPack,
  type ShillPlatform,
  xIntentUrl,
} from "@/lib/shiller-engine";
import { cn } from "@/lib/utils";

const PLATFORMS: ShillPlatform[] = [
  "x",
  "tiktok",
  "telegram",
  "youtube",
  "snapchat",
];

export default function ShillTool() {
  const [platform, setPlatform] = useState<ShillPlatform>("x");
  const [handle, setHandle] = useState("");
  const [vibe, setVibe] = useState("");
  const [mention, setMention] = useState("");
  const [pack, setPack] = useState<ShillPack | null>(null);
  const [board, setBoard] = useState<ShillEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setBoard(loadShillBoard());
  }, []);

  function generate() {
    const next = buildShillPack({ platform, vibe, mention });
    setPack(next);
    setCopied(false);
    setStatus(null);
  }

  async function copyPack() {
    if (!pack) return;
    try {
      await navigator.clipboard.writeText(pack.fullPost);
      setCopied(true);
      const next = recordShill({
        handle: handle || "anon",
        displayName: handle || "Anon",
        platform,
      });
      setBoard(next);
      setStatus(
        `Copied · +points on shill board as @${(handle || "anon").replace(/^@/, "")}`,
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("Copy failed — select the text manually");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 md:px-14 md:py-16">
      <div className="mb-3 flex items-center gap-3">
        <Megaphone size={14} className="text-red" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
          Shill engine
        </span>
      </div>

      <h1
        className="font-display uppercase leading-none text-fg"
        style={{ fontSize: "clamp(2.6rem, 10vw, 4.5rem)" }}
      >
        Push the
        <span className="animate-flicker"> herd</span>
      </h1>
      <p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
        Build a clean AstroBull post, copy it, ship it. Every copy scores on the{" "}
        <span className="text-gold">shill leaderboard</span> — not the creator
        activity board.
      </p>

      <div className="mt-10 space-y-5 rounded-md border border-white/10 bg-surface p-4 sm:p-6">
        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Your handle (for shill board)
          </label>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@yourhandle"
            className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Platform
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={cn(
                  "rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors",
                  platform === p
                    ? "border-red bg-red/20 text-red"
                    : "border-white/15 text-muted hover:border-white/40 hover:text-fg",
                )}
              >
                {PLATFORM_LABEL(p)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Vibe / angle (optional)
          </label>
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="e.g. burn update, creator open, chapter 1"
            className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Big-up a creator (optional)
          </label>
          <input
            value={mention}
            onChange={(e) => setMention(e.target.value)}
            placeholder="@creator"
            className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
          />
        </div>

        <button
          type="button"
          onClick={generate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-red py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_18px_rgba(255,0,51,0.35)] hover:bg-red-hot sm:w-auto sm:px-8"
        >
          <RefreshCw size={14} />
          Generate shill pack
        </button>
      </div>

      {pack ? (
        <div className="mt-6 rounded-md border border-red/30 bg-bg p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-red">
              {PLATFORM_LABEL(pack.platform)} pack
            </p>
            <span className="font-mono text-[10px] text-dim">
              {pack.fullPost.length} chars
            </span>
          </div>
          {pack.platform === "youtube" ? (
            <p className="mt-3 font-display text-xl uppercase text-fg">
              {pack.title}
            </p>
          ) : null}
          <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-fg/90 sm:text-sm">
            {pack.fullPost}
          </pre>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPack}
              className="inline-flex items-center gap-2 rounded-sm bg-green px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg hover:brightness-110"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy + score"}
            </button>
            {pack.platform === "x" ? (
              <a
                href={xIntentUrl(pack.fullPost)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const next = recordShill({
                    handle: handle || "anon",
                    displayName: handle || "Anon",
                    platform: "x",
                  });
                  setBoard(next);
                }}
                className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-fg no-underline hover:border-fg"
              >
                <ExternalLink size={14} />
                Open on X
              </a>
            ) : null}
          </div>
          {status ? (
            <p className="mt-3 font-mono text-[11px] text-green">{status}</p>
          ) : null}
        </div>
      ) : null}

      <div id="shill-board" className="mt-14 scroll-mt-24">
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-gold" />
          <h2 className="font-display text-3xl uppercase tracking-wide text-fg">
            Shill <span className="animate-flicker">board</span>
          </h2>
        </div>
        <p className="mb-4 font-mono text-[11px] text-dim">
          Separate from creator leaderboard. Points = packs you copy/share here
          (local until cloud sync is wired).
        </p>
        <div className="overflow-hidden rounded-md border border-white/10 bg-surface">
          <div className="grid grid-cols-[2.5rem_1fr_4rem_5rem] gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-dim sm:px-4">
            <span>#</span>
            <span>Shiller</span>
            <span>Posts</span>
            <span>Points</span>
          </div>
          <ul className="divide-y divide-white/5">
            {board.map((row, i) => (
              <li
                key={row.id}
                className={cn(
                  "grid grid-cols-[2.5rem_1fr_4rem_5rem] items-center gap-2 px-3 py-3 sm:px-4",
                  i < 3 &&
                    "bg-gradient-to-r from-red/10 via-transparent to-transparent",
                )}
              >
                <span className="font-mono text-[11px] font-bold text-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg uppercase text-fg">
                    {row.displayName}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted">
                    {row.handle}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted">{row.posts}</span>
                <span className="font-mono text-xs font-bold text-green">
                  {row.points}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
