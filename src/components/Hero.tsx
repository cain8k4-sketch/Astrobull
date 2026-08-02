import { useState } from "react";
import {
  Share2,
  Check,
  Rocket,
  BarChart2,
  Send,
  Youtube,
} from "lucide-react";
import { TG_CONTENT_UPLOAD, TG_MAIN } from "@/lib/community";

const CONTRACT = "0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03";
const BOW = `https://bow.fun/?token=${CONTRACT}`;
const CHART =
  "https://dexscreener.com/robinhood/0x403503850D80C4E50A6227be3C293C9e7810818e";
const YOUTUBE = "https://www.youtube.com/@ASTROBULL.ROBINHOOD";

export default function Hero() {
  const [shared, setShared] = useState(false);

  async function onShare() {
    const url =
      typeof window !== "undefined" ? window.location.origin : "https://astrobull.xyz";
    const data = {
      title: "Astro Bull — Breaking the Chains",
      text: "Create free. Get featured. Get paid. Holding is optional. We are all Astro.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <section className="bg-black">
      {/* Top banner — above title video */}
      <div
        className="border-b border-white/20 bg-red px-3 py-3 text-center sm:py-3.5"
        role="banner"
      >
        <p className="font-display text-[0.95rem] uppercase leading-tight tracking-[0.12em] text-fg sm:text-lg sm:tracking-[0.16em] [text-shadow:0_0_14px_rgba(245,245,245,0.35)]">
          Get paid to create
        </p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-fg/85 sm:text-[10px] sm:tracking-[0.28em]">
          Featured · amplified across our socials · holding optional
        </p>
      </div>

      {/* Title image → YouTube */}
      <div className="w-full bg-black">
        <div className="mx-auto w-full max-w-lg">
          <a
            href={YOUTUBE}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block no-underline outline-none focus-visible:ring-2 focus-visible:ring-red"
            aria-label="Watch Astro Bull on YouTube — open channel"
          >
            <video
              className="block h-auto w-full"
              src="/title-robinhood.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-4 pt-10 opacity-90 transition-opacity group-hover:opacity-100">
              <Youtube size={16} className="text-red" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:text-[11px]">
                Tap · YouTube @ASTROBULL.ROBINHOOD
              </span>
            </span>
          </a>
        </div>
      </div>

      {/* ASTRO BULL + Chapter 1 only — no sign-up clutter */}
      <div className="border-t border-white/10 bg-black px-5 pt-12 pb-10 sm:px-10 sm:pt-14 md:px-16 md:pb-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rotate-45 bg-green shadow-[0_0_12px_#00ff66]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-green sm:text-xs">
              Slaughterhouse Productions · Robinhood Chain
            </span>
          </div>

          <h1 className="sr-only">AstroBull — Chapter 1 Breaking the Chains</h1>
          <div aria-hidden className="select-none">
            <p
              className="font-display uppercase leading-[0.88] text-white"
              style={{
                fontSize: "clamp(3.5rem, 15vw, 6.5rem)",
                letterSpacing: "0.04em",
              }}
            >
              ASTRO
            </p>
            <p
              className="animate-flicker font-display uppercase leading-[0.88]"
              style={{
                fontSize: "clamp(3.5rem, 15vw, 6.5rem)",
                letterSpacing: "0.04em",
              }}
            >
              BULL
            </p>
          </div>

          <div className="mt-7 flex items-start gap-4">
            <div className="mt-1 h-12 w-1 shrink-0 bg-red" />
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.35em] text-red sm:text-sm">
                Chapter 1
              </p>
              <p className="mt-2 font-mono text-base uppercase tracking-[0.18em] text-white/75 sm:text-lg">
                Breaking the Chains
              </p>
            </div>
          </div>

          {/* Light CTAs — Story first; no extra YouTube box (graphic is the YT link) */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#story"
              className="inline-flex items-center justify-center bg-red px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-white no-underline shadow-[0_0_20px_rgba(255,0,51,0.35)] hover:bg-red-hot"
            >
              The Story
            </a>
            <a
              href="#studio"
              className="inline-flex items-center justify-center border border-white/25 px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-white no-underline hover:border-red hover:text-red"
            >
              Creator Studio $$$
            </a>
            <a
              href="#leaderboard"
              className="inline-flex items-center justify-center border border-gold/50 px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-gold no-underline hover:bg-gold/10"
            >
              Leaderboard
            </a>
            <a
              href="/astrobull-whitepaper.pdf"
              download
              className="inline-flex items-center justify-center border border-green/50 px-6 py-4 text-center font-mono text-xs font-bold uppercase tracking-widest text-green no-underline hover:border-green"
            >
              Whitepaper
            </a>
          </div>
        </div>
      </div>

      {/* Compact buy / social — not competing with Chapter 1 */}
      <div className="border-t border-white/10 bg-surface px-5 py-5 sm:px-10 md:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
            Buy · Social · Share
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            <a
              href={BOW}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 border border-red/50 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-red no-underline hover:bg-red/15"
            >
              <Rocket size={12} /> Buy bow.fun
            </a>
            <a
              href={CHART}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 border border-green/40 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-green no-underline hover:bg-green/10"
            >
              <BarChart2 size={12} /> Chart
            </a>
            <a
              href="https://x.com/AstroBull_RH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-white/20 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white no-underline hover:border-white/50"
            >
              X
            </a>
            <a
              href="https://www.tiktok.com/@astrobull.robinho"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-white/20 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white no-underline hover:border-white/50"
            >
              TikTok
            </a>
            <a
              href={YOUTUBE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 border border-white/20 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white no-underline hover:border-white/50"
            >
              <Youtube size={12} /> YouTube
            </a>
            <a
              href={TG_MAIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 border border-white/20 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-white no-underline hover:border-white/50"
            >
              <Send size={12} /> Telegram
            </a>
            <a
              href={TG_CONTENT_UPLOAD}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 border border-[#2AABEE]/50 bg-[#2AABEE]/15 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#2AABEE] no-underline hover:bg-[#2AABEE]/25"
            >
              <Send size={12} /> TG content
            </a>
            <button
              type="button"
              onClick={() => void onShare()}
              className="col-span-2 inline-flex items-center justify-center gap-1.5 border border-gold/40 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold/10 sm:col-span-1"
            >
              {shared ? <Check size={12} /> : <Share2 size={12} />}
              {shared ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden border-t border-white/10 bg-black py-3">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold sm:gap-12 sm:text-xs">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-10 sm:gap-12">
              <span>We Are All Astro</span>
              <span className="text-white/30">///</span>
              <span>Only on Robinhood Chain</span>
              <span className="text-white/30">///</span>
              <span>~12M burned July</span>
              <span className="text-white/30">///</span>
              <span>Create free · Get featured · Get paid</span>
              <span className="text-white/30">///</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
