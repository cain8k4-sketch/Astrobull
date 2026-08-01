import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Crown, Flame, Medal, Trophy, UserPlus } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import {
  fetchLiveLeaderboard,
  formatUsd,
  formatViews,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

const PAYOUT_THRESHOLD = 50;

function rankIcon(rank: number) {
  if (rank === 1) return <Crown size={16} className="text-gold" />;
  if (rank === 2) return <Medal size={16} className="text-muted" />;
  if (rank === 3) return <Medal size={16} className="text-[#cd7f32]" />;
  return (
    <span className="font-mono text-[11px] font-bold text-dim">
      {String(rank).padStart(2, "0")}
    </span>
  );
}

function progressToFifty(earned: number) {
  return Math.min(100, Math.round((earned / PAYOUT_THRESHOLD) * 100));
}

export default function CreatorLeaderboard() {
  const ref = useReveal<HTMLDivElement>();
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [source, setSource] = useState<"live" | "demo">("demo");
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchLiveLeaderboard();
      if (cancelled) return;
      setRows(res.rows);
      setSource(res.source);
      setNote(res.message ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      id="leaderboard"
      className="border-t border-white/5 bg-bg px-4 py-16 sm:px-8 md:px-14 md:py-24"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 w-2 rotate-45 bg-green shadow-[0_0_10px_#00ff66]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-green sm:text-xs">
            Creator economy
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="font-display uppercase leading-none text-fg"
              style={{ fontSize: "clamp(2.5rem, 10vw, 4.5rem)" }}
            >
              Leader
              <span className="animate-flicker">board</span>
            </h2>
            <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
              Most active creators in the herd — ranked by verified activity score
              (views · posts · features). Climb toward the{" "}
              <span className="text-green">${PAYOUT_THRESHOLD} payout threshold</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-white/15 bg-surface px-3 py-2">
            <Trophy size={14} className="text-gold" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
              {source === "live" ? (
                <span className="text-green">Live data</span>
              ) : (
                <span className="text-gold">Preview herd</span>
              )}
            </span>
          </div>
        </div>

        {note ? (
          <p className="mt-3 font-mono text-[11px] text-dim">{note}</p>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-md border border-white/10 bg-surface">
          {/* Header */}
          <div className="hidden grid-cols-[2.5rem_1fr_4.5rem_4.5rem_5rem] gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-dim sm:grid sm:grid-cols-[2.5rem_1fr_4rem_4.5rem_4.5rem_5rem] sm:px-4">
            <span>#</span>
            <span>Creator</span>
            <span className="hidden sm:inline">Posts</span>
            <span>Views</span>
            <span>Points</span>
            <span>→ $50</span>
          </div>

          {loading ? (
            <p className="px-4 py-10 text-center font-mono text-xs text-muted">
              Loading herd…
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {rows.map((row) => {
                const pct = progressToFifty(row.earnedUsd);
                const top = (row.rank ?? 99) <= 3;
                return (
                  <li
                    key={row.id}
                    className={cn(
                      "grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-3 py-3.5 sm:grid-cols-[2.5rem_1fr_4rem_4.5rem_4.5rem_5rem] sm:px-4",
                      top && "bg-gradient-to-r from-red/10 via-transparent to-transparent",
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {rankIcon(row.rank ?? 0)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-display text-lg uppercase tracking-wide text-fg">
                          {row.name}
                        </p>
                        {row.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-sm border border-red/40 bg-red/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-red">
                            <Flame size={10} /> Featured
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate font-mono text-[11px] text-muted">
                        {row.handle} · {row.platform}
                      </p>
                      {/* Mobile stats */}
                      <div className="mt-1 flex flex-wrap gap-3 font-mono text-[10px] text-dim sm:hidden">
                        <span>{row.posts} posts</span>
                        <span>{formatViews(row.views)} views</span>
                        <span className="text-green">{row.points.toLocaleString()} pts</span>
                      </div>
                    </div>

                    <p className="hidden font-mono text-xs text-muted sm:block">
                      {row.posts}
                    </p>
                    <p className="font-mono text-xs text-fg sm:text-muted">
                      {formatViews(row.views)}
                    </p>
                    <p className="hidden font-mono text-xs font-bold text-green sm:block">
                      {row.points.toLocaleString()}
                    </p>

                    <div className="col-span-3 sm:col-span-1 sm:col-auto">
                      <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-stretch sm:justify-center">
                        <span className="font-mono text-[10px] text-muted sm:text-right">
                          {formatUsd(row.earnedUsd)}
                        </span>
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:w-full">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              pct >= 100 ? "bg-green" : "bg-red",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-sm border border-white/10 bg-surface px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
              Scoring
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Views × weight + posts + featured boost. Verified activity only when live.
            </p>
          </div>
          <div className="rounded-sm border border-white/10 bg-surface px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
              Payout bar
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Progress toward <span className="text-green">${PAYOUT_THRESHOLD}</span>{" "}
              USDC/USDT release. Holding optional.
            </p>
          </div>
          <div className="rounded-sm border border-green/30 bg-green/5 px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-widest text-green">
              Join the board
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Sign up → create → get featured → climb.
            </p>
            <Link
              to="/signup"
              className="mt-2 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-green no-underline hover:underline"
            >
              <UserPlus size={12} /> Sign up
            </Link>
          </div>
        </div>

        {source === "demo" ? (
          <p className="mt-6 font-mono text-[10px] leading-relaxed text-dim">
            Preview herd is sample data so the board is ready before launch. When Supabase
            table <code className="text-muted">leaderboard</code> has rows, this flips to{" "}
            <span className="text-green">Live data</span> automatically.
          </p>
        ) : null}
      </div>
    </section>
  );
}
