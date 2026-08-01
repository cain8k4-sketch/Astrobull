import {
  Copy,
  Check,
  ExternalLink,
  Wallet,
  Network,
  ArrowLeftRight,
  Rocket,
} from "lucide-react";
import { useState } from "react";

const CONTRACT = "0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03";
const BOW = `https://bow.fun/?token=${CONTRACT}`;
const UNISWAP = `https://app.uniswap.org/swap?outputCurrency=${CONTRACT}`;
const CHART =
  "https://dexscreener.com/robinhood/0x403503850D80C4E50A6227be3C293C9e7810818e";
const METAMASK = "https://metamask.io/download/";

const STEPS = [
  {
    n: "01",
    title: "Get MetaMask",
    body: "Install MetaMask (or any EVM wallet). Phantom does not work for Robinhood Chain — you need an EVM wallet.",
    cta: { label: "Download MetaMask", href: METAMASK },
    Icon: Wallet,
  },
  {
    n: "02",
    title: "Add Robinhood Chain",
    body: "In your wallet: Network → Add network. Use the details below, or Uniswap will prompt you when you switch.",
    Icon: Network,
  },
  {
    n: "03",
    title: "Fund with ETH",
    body: "Bridge or send a little ETH to Robinhood Chain. You need ETH for gas and to swap into $ASTROBULL.",
    Icon: Rocket,
  },
  {
    n: "04",
    title: "Swap on Uniswap or bow.fun",
    body: "Connect wallet → Robinhood Chain → paste the contract address as the token you receive → Swap. Start small.",
    Icon: ArrowLeftRight,
  },
] as const;

const NETWORK = [
  { label: "Network", value: "Robinhood Chain" },
  { label: "Chain ID", value: "4663" },
  { label: "RPC", value: "https://rpc.mainnet.chain.robinhood.com" },
  { label: "Symbol", value: "ETH" },
  { label: "Explorer", value: "https://robinscan.io" },
] as const;

export default function HowToBuy() {
  const [copied, setCopied] = useState<"contract" | "rpc" | null>(null);

  async function copy(text: string, key: "contract" | "rpc") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <section
      id="buy"
      className="border-t border-white/8 bg-surface px-4 py-14 sm:px-8 md:px-14 md:py-16"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-2.5 w-2.5 rotate-45 bg-red shadow-[0_0_12px_#ff0033]" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
            How to buy
          </p>
        </div>
        <h2 className="font-display text-4xl uppercase leading-none text-fg sm:text-5xl">
          Get $ASTROBULL
        </h2>
        <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
          Official contract on Robinhood Chain. Buy on Uniswap or bow.fun with MetaMask —
          not Phantom.
        </p>

        {/* Contract */}
        <div className="mt-8 border border-red/40 bg-bg/80 p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Contract address
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all font-mono text-xs text-green sm:text-sm">
              {CONTRACT}
            </code>
            <button
              type="button"
              onClick={() => void copy(CONTRACT, "contract")}
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-green/40 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-green hover:bg-green/10"
            >
              {copied === "contract" ? (
                <>
                  <Check size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>
          <p className="mt-2 font-mono text-[10px] text-muted">
            Always paste this exact address. Fake tokens use similar names.
          </p>
        </div>

        {/* Steps */}
        <ol className="mt-10 space-y-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex gap-4 border border-white/10 bg-bg/50 p-4 sm:gap-5 sm:p-5"
            >
              <div className="flex shrink-0 flex-col items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-red">{s.n}</span>
                <s.Icon size={18} className="text-fg/70" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl uppercase tracking-wide text-fg">
                  {s.title}
                </h3>
                <p className="mt-1.5 font-mono text-xs leading-relaxed text-muted">
                  {s.body}
                </p>
                {"cta" in s && s.cta ? (
                  <a
                    href={s.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-green no-underline hover:underline"
                  >
                    {s.cta.label} <ExternalLink size={11} />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {/* Network details */}
        <div className="mt-8 border border-white/10 bg-bg/60 p-4 sm:p-5">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-muted">
            Robinhood Chain network
          </p>
          <dl className="space-y-2.5">
            {NETWORK.map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-0.5 border-b border-white/5 pb-2 last:border-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <dt className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-dim sm:w-24">
                  {row.label}
                </dt>
                <dd className="flex min-w-0 flex-1 items-center gap-2 font-mono text-[11px] text-fg sm:text-xs">
                  <span className="break-all">{row.value}</span>
                  {row.label === "RPC" ? (
                    <button
                      type="button"
                      onClick={() => void copy(row.value, "rpc")}
                      className="shrink-0 text-muted hover:text-green"
                      aria-label="Copy RPC"
                    >
                      {copied === "rpc" ? (
                        <Check size={12} className="text-green" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={UNISWAP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 bg-red px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white no-underline shadow-[0_0_20px_rgba(255,0,51,0.35)] hover:bg-red-hot"
          >
            Buy on Uniswap <ExternalLink size={14} />
          </a>
          <a
            href={BOW}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 border border-red/50 px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest text-red no-underline hover:bg-red/15"
          >
            Buy on bow.fun <ExternalLink size={14} />
          </a>
          <a
            href={CHART}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 border border-green/40 px-5 py-4 font-mono text-xs font-bold uppercase tracking-widest text-green no-underline hover:bg-green/10"
          >
            Chart <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
