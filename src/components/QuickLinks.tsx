import {
  BarChart2,
  ExternalLink,
  Rocket,
  Send,
  Youtube,
  Instagram,
} from "lucide-react";

const CONTRACT = "0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03";

const STATUS = [
  { color: "bg-red", text: "Manual burns — auto-burn coming soon" },
  { color: "bg-green", text: "Locked liquidity" },
  { color: "bg-gold", text: "1B supply → decimated" },
] as const;

const BUYS = [
  {
    label: "Buy on bow.fun",
    sub: "Robinhood Chain",
    href: `https://bow.fun/?token=${CONTRACT}`,
    Icon: Rocket,
    className: "border-red/50 bg-red/15 text-red hover:bg-red/25 hover:border-red",
  },
  {
    label: "Buy on Uniswap",
    sub: "Robinhood Chain · MetaMask",
    href: `https://app.uniswap.org/swap?outputCurrency=${CONTRACT}`,
    emoji: "🦄",
    className: "border-pink/50 bg-pink/10 text-pink hover:bg-pink/20 hover:border-pink",
  },
] as const;

const SOCIAL = [
  {
    label: "Chart",
    sub: "DexScreener",
    href: "https://dexscreener.com/robinhood/0x403503850D80C4E50A6227be3C293C9e7810818e",
    Icon: BarChart2,
    className: "border-green/30 text-green hover:border-green/70 hover:bg-green/5",
  },
  {
    label: "Telegram",
    sub: "Join the herd",
    href: "https://t.me/Official_Astrobull_Robinhood",
    Icon: Send,
    className: "border-blue/30 text-blue hover:border-blue/70 hover:bg-blue/5",
  },
  {
    label: "TikTok",
    sub: "Main channel",
    href: "https://www.tiktok.com/@astrobull.robinho",
    Icon: null,
    tiktok: true,
    className: "border-white/15 text-fg hover:border-white/40 hover:bg-white/5",
  },
  {
    label: "YouTube",
    sub: "Watch us",
    href: "https://www.youtube.com/@ASTROBULL.ROBINHOOD",
    Icon: Youtube,
    className: "border-red/30 text-red hover:border-red/70 hover:bg-red/5",
  },
  {
    label: "Snapchat",
    sub: "Add us",
    href: "https://www.snapchat.com/add/astrobull-rhood",
    emoji: "👻",
    className: "border-gold/40 text-gold hover:border-gold/70 hover:bg-gold/5",
  },
  {
    label: "X / Twitter",
    sub: "Follow only",
    href: "https://x.com/AstroBull_RH",
    Icon: null,
    x: true,
    className: "border-white/15 text-fg hover:border-white/50 hover:bg-white/5",
  },
  {
    label: "Instagram",
    sub: "Follow us",
    href: "https://www.instagram.com/",
    Icon: Instagram,
    className: "border-pink/30 text-pink hover:border-pink/60 hover:bg-pink/5",
  },
] as const;

export default function QuickLinks() {
  return (
    <section id="quick" className="border-y border-white/8 bg-surface px-4 py-10 sm:px-8 md:px-14">
      <p className="mb-6 text-center font-display text-2xl uppercase tracking-wide text-green sm:text-3xl [text-shadow:0_0_18px_rgba(0,255,102,0.45)]">
        Content Creators.
      </p>

      <ul className="mb-10 space-y-2.5 text-center font-mono text-[11px] uppercase tracking-widest sm:text-xs">
        {STATUS.map((s) => (
          <li key={s.text} className="flex items-center justify-center gap-2.5 text-muted">
            <span className={`h-2 w-2 shrink-0 rounded-full ${s.color} shadow-[0_0_8px_currentColor]`} />
            <span className="text-fg/80">{s.text}</span>
          </li>
        ))}
      </ul>

      <p className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        <span className="h-px w-4 bg-muted/40" />
        Get in — quick access
      </p>

      <div className="mb-3 flex flex-col gap-3">
        {BUYS.map((b) => (
          <a
            key={b.label}
            href={b.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-between border px-5 py-4 transition-all duration-200 ${b.className}`}
          >
            <div className="flex items-center gap-3">
              {"emoji" in b && b.emoji ? (
                <span className="text-xl" aria-hidden>
                  {b.emoji}
                </span>
              ) : "Icon" in b && b.Icon ? (
                <b.Icon size={20} className="shrink-0" />
              ) : null}
              <div>
                <p className="font-mono text-sm font-bold uppercase tracking-widest">{b.label}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest opacity-60">
                  {b.sub}
                </p>
              </div>
            </div>
            <ExternalLink size={14} className="shrink-0 opacity-40 group-hover:opacity-100" />
          </a>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {SOCIAL.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col items-center justify-center gap-2 border px-2 py-4 text-center transition-all duration-200 ${s.className}`}
          >
            {"x" in s && s.x ? (
              <span className="font-display text-xl leading-none">X</span>
            ) : "tiktok" in s && s.tiktok ? (
              <span className="font-display text-lg leading-none">♪</span>
            ) : "emoji" in s && s.emoji ? (
              <span className="text-xl leading-none" aria-hidden>
                {s.emoji}
              </span>
            ) : "Icon" in s && s.Icon ? (
              <s.Icon size={20} className="shrink-0" />
            ) : null}
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest sm:text-xs">
                {s.label}
              </p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest opacity-50">
                {s.sub}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
