import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

/** Fixed right-side control — scroll down section-by-section, or up when near bottom. */
export default function ScrollDownButton() {
  const [atBottom, setAtBottom] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setAtBottom(max > 80 && y >= max - 120);
      // hide only if page is too short to scroll
      setHidden(max < 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function scrollNext() {
    if (atBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const y = window.scrollY;
    const vh = window.innerHeight;
    // try next major section anchor if close enough
    const anchors = [
      "#story",
      "#studio",
      "#leaderboard",
      "#links",
      "#quick",
      "#tokenomics",
      "#roadmap",
      "#community",
      "#nfts",
    ];
    const next = anchors
      .map((sel) => document.querySelector(sel) as HTMLElement | null)
      .filter(Boolean)
      .find((el) => el!.getBoundingClientRect().top > 72);

    if (next) {
      const top = next.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }
    window.scrollTo({ top: y + vh * 0.85, behavior: "smooth" });
  }

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={scrollNext}
      aria-label={atBottom ? "Scroll to top" : "Scroll down"}
      className="fixed right-3 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-red/60 bg-black/80 text-red shadow-[0_0_18px_rgba(255,0,51,0.35)] backdrop-blur-md transition-colors hover:bg-red hover:text-white sm:right-5 sm:h-14 sm:w-14"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      {atBottom ? <ChevronUp size={22} /> : <ChevronDown size={22} className="animate-bounce" />}
    </button>
  );
}
