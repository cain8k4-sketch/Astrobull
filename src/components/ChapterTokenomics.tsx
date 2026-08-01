import { useState } from "react";
import { Check, Copy, ExternalLink, Rocket, BarChart2 } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import LiveBurnCounter from "@/components/LiveBurnCounter";
import { TOKEN } from "@/lib/burn";

const CONTRACT = TOKEN;
const BOW = `https://bow.fun/?token=${CONTRACT}`;
const CHART =
  "https://dexscreener.com/robinhood/0x403503850D80C4E50A6227be3C293C9e7810818e";
const EXPLORER = `https://robinscan.io/token/${CONTRACT}`;

const ROWS: [string, string][] = [
  ["Total Supply", "1,000,000,000"],
  ["Chain", "Robinhood Chain"],
  ["Developer Allocation", "6% — permanently burned"],
  ["Burn policy", "Manual now · live dEaD tracker · auto later"],
  ["Public / Traders", "94% — freely tradable"],
  ["Airdrops", "None — maximum buy pressure"],
  ["Liquidity", "Locked"],
];

export default function ChapterTokenomics() {
  const ref = useReveal<HTMLDivElement>();
  const [copied, setCopied] = useState(false);

  function copyContract() {
    void navigator.clipboard.writeText(CONTRACT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      id="tokenomics"
      className="border-t border-white/5 bg-surface px-4 py-16 sm:px-8 md:px-14 md:py-24"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 w-2 rotate-45 bg-red shadow-[0_0_10px_#ff0033]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
            Token
          </span>
        </div>
        <h2
          className="font-display uppercase leading-none text-fg"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}
        >
          Get On
          <br />
          <span className="animate-flicker">Board</span>
        </h2>

        <div className="mt-8 border border-red/40 bg-red/10 px-5 py-5">
          <p
            className="font-display uppercase leading-none text-red"
            style={{ fontSize: "clamp(1.4rem, 4vw, 2.4rem)" }}
          >
            1 Billion Supply{" "}
            <span className="text-fg">Will Be Decimated!!</span>
          </p>
        </div>

        {/* Live on-chain burn */}
        <LiveBurnCounter />

        <div className="mt-6 overflow-hidden border border-white/10 font-mono text-xs sm:text-sm">
          {ROWS.map(([label, value], i) => (
            <div
              key={label}
              className={`flex justify-between gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-bg/80" : "bg-transparent"}`}
            >
              <span className="uppercase tracking-wide text-muted">{label}</span>
              <span className="text-right text-fg">{value}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted">
          Contract — Robinhood Chain
        </p>
        <button
          type="button"
          onClick={copyContract}
          className="mt-2 flex w-full items-center gap-3 border border-white/10 bg-bg px-4 py-3.5 text-left transition-colors hover:border-red/50"
        >
          <code className="flex-1 break-all font-mono text-xs text-fg/80 sm:text-sm">
            {CONTRACT}
          </code>
          {copied ? (
            <Check size={16} className="text-green" />
          ) : (
            <Copy size={16} className="text-muted" />
          )}
        </button>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={BOW}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-red/50 bg-red/15 px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest text-red no-underline transition-colors hover:bg-red/25"
          >
            <span className="flex items-center gap-2">
              <Rocket size={16} /> Buy on bow.fun
            </span>
            <ExternalLink size={14} className="opacity-50" />
          </a>
          <a
            href={CHART}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between border border-green/40 bg-green/5 px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest text-green no-underline transition-colors hover:bg-green/10"
          >
            <span className="flex items-center gap-2">
              <BarChart2 size={16} /> Chart
            </span>
            <ExternalLink size={14} className="opacity-50" />
          </a>
        </div>

        <div className="mt-6 border border-white/10 bg-bg/50 px-4 py-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Whitepaper
          </p>
          <a
            href="/astrobull-whitepaper.pdf"
            download
            className="mt-2 inline-block font-mono text-xs font-bold uppercase tracking-widest text-red no-underline hover:underline"
          >
            Download full revised whitepaper (PDF) →
          </a>
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-dim">
          Only on Robinhood Chain. Dev burns supply — not sells. Live dEaD
          tracker on-chain.
        </p>

        <a
          href={EXPLORER}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-green no-underline hover:underline"
        >
          Explorer <ExternalLink size={10} />
        </a>
      </div>
    </section>
  );
}
