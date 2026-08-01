import { Link } from "@tanstack/react-router";
import { Bot, Upload, Lock, ArrowRight } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

export default function CreatorSection() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section
      id="creators"
      className="border-t border-white/5 bg-surface px-4 py-16 sm:px-8 md:px-14 md:py-20"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 w-2 rotate-45 bg-green shadow-[0_0_10px_#00ff66]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-green">
            Content economy
          </span>
        </div>

        <h2
          className="font-display uppercase leading-none text-fg"
          style={{ fontSize: "clamp(2.4rem, 9vw, 4.5rem)" }}
        >
          Creator
          <br />
          <span className="animate-flicker">Studio</span>
        </h2>
        <p className="mt-4 max-w-xl font-mono text-xs uppercase leading-relaxed tracking-wide text-muted sm:text-sm">
          Create free. Get featured. Get paid. Holding is optional. Keys stay on your
          device — Astro Bull is locked for every AI.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="border border-white/10 bg-bg px-4 py-5">
            <Bot size={18} className="mb-3 text-red" />
            <p className="font-display text-lg uppercase text-fg">Use AI</p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Grok, Claude, or ChatGPT — your keys only.
            </p>
          </div>
          <div className="border border-white/10 bg-bg px-4 py-5">
            <Upload size={18} className="mb-3 text-green" />
            <p className="font-display text-lg uppercase text-fg">Upload own</p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Freehand / laptop files. No AI needed.
            </p>
          </div>
          <div className="border border-white/10 bg-bg px-4 py-5">
            <Lock size={18} className="mb-3 text-gold" />
            <p className="font-display text-lg uppercase text-fg">Push out</p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Send to X, TikTok, YouTube — Facebook soon.
            </p>
          </div>
        </div>

        <div className="mt-6 border border-red/40 bg-red/10 px-5 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red">
            Character locked
          </p>
          <p className="mt-2 font-mono text-xs text-muted">
            Ash-grey scarred bull · curved horns · amber eyes · industrial chains.
            He never changes shape when you switch models.
          </p>
          <Link
            to="/studio"
            className="mt-5 inline-flex items-center gap-2 bg-red px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white no-underline shadow-[0_0_18px_rgba(255,0,51,0.4)]"
          >
            Open Creator Studio
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
