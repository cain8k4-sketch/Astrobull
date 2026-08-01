import { useEffect, useState } from "react";
import { Flame, RefreshCw, ExternalLink, Copy, Check } from "lucide-react";
import {
  BURN_DEAD,
  BURN_TX_COUNT,
  DEV_WALLET,
  DOCUMENTED_BURNT,
  TOKEN,
  fetchLiveBurn,
  formatTokens,
  formatTokensShort,
  type BurnSnapshot,
} from "@/lib/burn";

const EXPLORER_TOKEN = `https://robinscan.io/token/${TOKEN}`;
const EXPLORER_DEAD = `https://robinscan.io/address/${BURN_DEAD}`;
const EXPLORER_DEV = `https://robinscan.io/address/${DEV_WALLET}`;

type Status = "loading" | "live" | "error";

export default function LiveBurnCounter() {
  const [status, setStatus] = useState<Status>("loading");
  const [snap, setSnap] = useState<BurnSnapshot | null>(null);
  const [copied, setCopied] = useState<"dev" | "dead" | null>(null);

  async function load() {
    setStatus("loading");
    const s = await fetchLiveBurn();
    if (!s) {
      setStatus("error");
      return;
    }
    setSnap(s);
    setStatus("live");
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 60_000);
    return () => clearInterval(t);
  }, []);

  function copy(whic: "dev" | "dead", addr: string) {
    void navigator.clipboard.writeText(addr);
    setCopied(whic);
    setTimeout(() => setCopied(null), 1800);
  }

  // Headline = project-reported total (11.67M across 23 txs).
  // Live dEaD is shown separately (may include other sinks / timing).
  const headline = DOCUMENTED_BURNT;


  return (
    <div className="mt-4 border border-red/50 bg-gradient-to-b from-red/20 to-bg px-4 py-5 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-red" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-red">
            $ASTROBULL · Live burn
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-fg"
          aria-label="Refresh burn count"
        >
          <RefreshCw
            size={12}
            className={status === "loading" ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
        Total tokens burnt
      </p>
      <p
        id="burnt-count"
        className="mt-1 font-display uppercase leading-none text-red"
        style={{ fontSize: "clamp(2rem, 8vw, 3.25rem)" }}
      >
        {status === "loading" && !snap
          ? "Loading…"
          : formatTokensShort(headline)}
      </p>
      <p className="mt-1 font-mono text-sm text-fg/80">
        {status === "loading" && !snap
          ? ""
          : `${formatTokens(headline)} tokens`}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="border border-white/10 bg-bg/60 px-3 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Burn transactions
          </p>
          <p className="mt-0.5 font-display text-2xl text-fg">{BURN_TX_COUNT}</p>
        </div>
        <div className="border border-white/10 bg-bg/60 px-3 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Project total
          </p>
          <p className="mt-0.5 font-display text-2xl text-red">
            {formatTokensShort(DOCUMENTED_BURNT)}
          </p>
          <p className="font-mono text-[10px] text-muted">
            {formatTokens(DOCUMENTED_BURNT)} · official burns
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1 font-mono text-[11px] leading-relaxed text-muted">
        {status === "live" && snap ? (
          <p>
            On-chain dEaD balance:{" "}
            <span className="text-green">{formatTokens(snap.onChainTotal)}</span>
            {" · "}refreshes live from Robinhood Chain
          </p>
        ) : status === "error" ? (
          <p className="text-red-hot">
            RPC busy — showing project total {formatTokensShort(DOCUMENTED_BURNT)}.
          </p>
        ) : (
          <p>Reading Robinhood Chain…</p>
        )}
        {snap ? (
          <p>
            Total supply (live): {formatTokens(snap.totalSupply)} · Updated{" "}
            {new Date(snap.updatedAt).toLocaleTimeString()}
          </p>
        ) : null}
      </div>

      {/* Dev wallet */}
      <div className="mt-4 border border-white/10 bg-bg/70 px-3 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          Dev wallet · does not sell — burns
        </p>
        <div className="mt-1.5 flex items-start gap-2">
          <code className="flex-1 break-all font-mono text-[11px] text-fg/85">
            {DEV_WALLET}
          </code>
          <button
            type="button"
            onClick={() => copy("dev", DEV_WALLET)}
            className="shrink-0 text-muted hover:text-fg"
            aria-label="Copy dev wallet"
          >
            {copied === "dev" ? (
              <Check size={14} className="text-green" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
        {snap ? (
          <p className="mt-1 font-mono text-[10px] text-muted">
            Live balance: {formatTokens(snap.devBalance)} $ASTROBULL
          </p>
        ) : null}
        <a
          href={EXPLORER_DEV}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-green no-underline hover:underline"
        >
          View dev wallet <ExternalLink size={11} />
        </a>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <a
          href={EXPLORER_DEAD}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-green no-underline hover:underline"
        >
          Burn sink (dEaD) <ExternalLink size={11} />
        </a>
        <button
          type="button"
          onClick={() => copy("dead", BURN_DEAD)}
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted hover:text-fg"
        >
          {copied === "dead" ? <Check size={11} className="text-green" /> : <Copy size={11} />}
          Copy dEaD
        </button>
        <a
          href={EXPLORER_TOKEN}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-green no-underline hover:underline"
        >
          Token <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
