import { Link } from "@tanstack/react-router";
import { Megaphone, Sparkles, Trophy } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

export default function ShillPromo() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section
      id="shill"
      className="border-t border-white/5 bg-surface px-4 py-16 sm:px-8 md:px-14 md:py-20"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 w-2 rotate-45 bg-red shadow-[0_0_10px_#ff0033]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red sm:text-xs">
            Amplify the herd
          </span>
        </div>

        <h2
          className="font-display uppercase leading-none text-fg"
          style={{ fontSize: "clamp(2.4rem, 9vw, 4.2rem)" }}
        >
          Shill
          <span className="animate-flicker"> tool</span>
        </h2>

        <p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
          Generate on-brand hype posts in one tap. Copy, post, climb the{" "}
          <span className="text-gold">shill leaderboard</span> — separate from
          creator activity. Less noise. More signal. Break the chains.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            {
              Icon: Sparkles,
              t: "Auto copy",
              d: "Hooks, CTAs, hashtags locked to Astro DNA",
            },
            {
              Icon: Megaphone,
              t: "Multi platform",
              d: "X · TikTok · TG · YouTube · Snap",
            },
            {
              Icon: Trophy,
              t: "Shill board",
              d: "Points for every pack you ship",
            },
          ].map(({ Icon, t, d }) => (
            <li
              key={t}
              className="rounded-md border border-white/10 bg-bg px-4 py-4"
            >
              <Icon size={16} className="text-red" />
              <p className="mt-2 font-display text-lg uppercase tracking-wide text-fg">
                {t}
              </p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-dim">
                {d}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/shill"
            className="inline-flex items-center gap-2 rounded-sm bg-red px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white no-underline shadow-[0_0_20px_rgba(255,0,51,0.4)] transition-colors hover:bg-red-hot"
          >
            Open shill tool
          </Link>
          <a
            href="#shill-board"
            className="inline-flex items-center gap-2 rounded-sm border border-gold/40 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-gold no-underline hover:bg-gold/10"
          >
            View shill board
          </a>
        </div>
      </div>
    </section>
  );
}
