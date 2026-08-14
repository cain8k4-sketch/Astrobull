import { createFileRoute, Link } from "@tanstack/react-router";
import CreatorsGrid from "@/components/CreatorsGrid";
import { Flame } from "lucide-react";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creators — Astro Bull" },
      {
        name: "description",
        content:
          "Watch Astro Bull creator content. Thumbnails, handles, and direct links to their work on TikTok, YouTube, and more.",
      },
    ],
  }),
  component: CreatorsPage,
});

function CreatorsPage() {
  return (
    <main className="min-h-[70vh] bg-black">
      <div className="border-b border-white/10 bg-bg px-4 py-10 sm:px-8 md:px-14 md:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
            Dedicated creators hub
          </p>
          <h1
            className="mt-2 font-display uppercase leading-none text-fg"
            style={{ fontSize: "clamp(2.75rem, 10vw, 5rem)" }}
          >
            Creators
          </h1>
          <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-muted">
            YouTube-style grid of herd content. Tap a thumbnail or{" "}
            <span className="text-fg">Watch content</span> to open their post.
            Handles are full size so you can find and follow them.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 rounded-sm bg-red px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-white no-underline hover:bg-red-hot"
            >
              <Flame size={12} />
              Creator Studio
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-fg no-underline hover:border-white/40"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-10 sm:px-8 md:px-14 md:py-14">
        <CreatorsGrid showHeader={false} />
        <p className="mx-auto mt-12 max-w-6xl text-center font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          Want on this page? Sign up · post · tag us · drop files in TG
        </p>
      </div>
    </main>
  );
}
