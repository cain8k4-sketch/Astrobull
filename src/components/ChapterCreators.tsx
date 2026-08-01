import { Link } from "@tanstack/react-router";
import { Sparkles, Star, Wallet, Unlock } from "lucide-react";
import ChapterHeader from "./ChapterHeader";
import { useReveal } from "@/hooks/use-reveal";

const CARDS = [
  {
    title: "Create free",
    body: "AI tools or upload your own work. No key required to start the upload path.",
    Icon: Sparkles,
  },
  {
    title: "Get featured",
    body: "Best work hits official channels across X, TikTok, YouTube, and more.",
    Icon: Star,
  },
  {
    title: "Get paid",
    body: "Path to USDC from platform activity and volume-derived revenue share. $50 minimum payout threshold.",
    Icon: Wallet,
  },
  {
    title: "Holding optional",
    body: "You don’t need to buy or hold the token to earn. Two streams: token + platform.",
    Icon: Unlock,
  },
] as const;

const STEPS = [
  ["Create", "Make content featuring Astro Bull — images, videos, stories, memes."],
  ["Post", "Share across platforms using the official hashtag, tagging the project."],
  ["Get Featured", "Standout content is selected and pushed to official channels."],
  ["Get Paid", "Platform earnings and volume-derived revenue are shared with creators."],
] as const;

export default function ChapterCreators() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="creators" className="border-t border-blood/20 bg-iron px-5 py-20 md:px-16 md:py-28">
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <ChapterHeader
          numeral="II"
          title="Creator Model"
          dek="We do not need traditional billboards. We are the billboards."
        />

        <div className="mb-10 grid gap-3 sm:grid-cols-2">
          {CARDS.map(({ title, body, Icon }) => (
            <div
              key={title}
              className="rounded-md border border-blood/25 bg-void/50 px-5 py-5"
            >
              <Icon size={18} className="mb-3 text-blood-bright" />
              <h3 className="font-display text-xl uppercase text-bone">{title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-chain">{body}</p>
            </div>
          ))}
        </div>

        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-blood-bright/80">
          How the content economy works
        </p>
        <ol className="mb-10 grid gap-3 sm:grid-cols-2">
          {STEPS.map(([title, body], i) => (
            <li
              key={title}
              className="rounded-md border border-blood/20 bg-void/40 px-5 py-5"
            >
              <div className="mb-2 font-mono text-xs tracking-widest text-blood-bright">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-display text-xl uppercase text-bone">{title}</div>
              <p className="mt-1 font-body text-sm leading-relaxed text-chain">{body}</p>
            </li>
          ))}
        </ol>

        <div className="rounded-md border border-blood-bright/40 bg-void/50 px-5 py-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-blood-bright">
            Inside Creator Studio
          </p>
          <ul className="space-y-2 font-body text-sm text-bone/90">
            <li>
              <strong className="text-bone">Use AI</strong> — Grok, Claude, or ChatGPT keys
              (stored on your device only)
            </li>
            <li>
              <strong className="text-bone">Upload my own</strong> — freehand / laptop files,
              no AI needed
            </li>
            <li>
              <strong className="text-bone">Locked character</strong> — Astro Bull never changes
              shape when you switch models
            </li>
          </ul>
          <Link
            to="/studio"
            className="mt-5 inline-block rounded-sm bg-blood-bright px-5 py-3 font-mono text-xs uppercase tracking-widest text-white no-underline shadow-[0_0_16px_rgba(255,26,26,0.3)] transition-colors hover:bg-blood"
          >
            Go to Creator Studio
          </Link>
        </div>
      </div>
    </section>
  );
}
