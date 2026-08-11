import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ChartNoAxesCombined,
  ChevronDown,
  Flame,
  Map,
  Menu,
  MessageCircle,
  Rocket,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Dest = {
  key: string;
  label: string;
  blurb: string;
  hash?: string;
  to?: "/studio" | "/shill" | "/signup" | "/";
  icon: ReactNode;
  accent: "red" | "gold" | "green" | "blue" | "purple";
  badge?: string;
};

const DESTINATIONS: Dest[] = [
  {
    key: "story",
    label: "The Story",
    blurb: "Chapter 1 · Breaking the Chains",
    hash: "story",
    icon: <BookOpen size={18} aria-hidden />,
    accent: "red",
  },
  {
    key: "studio",
    label: "Creator Studio",
    blurb: "Sign up · get featured · get paid",
    to: "/studio",
    icon: <Flame size={18} aria-hidden />,
    accent: "red",
    badge: "$$$",
  },
  {
    key: "leaderboard",
    label: "Leaderboard",
    blurb: "Who’s grinding the herd",
    hash: "leaderboard",
    icon: <Trophy size={18} aria-hidden />,
    accent: "gold",
  },
  {
    key: "fame",
    label: "Hall of Fame",
    blurb: "Creators + their work links",
    hash: "wall-of-fame",
    icon: <Star size={18} aria-hidden />,
    accent: "gold",
  },
  {
    key: "shill",
    label: "Shill HQ",
    blurb: "Pack generator for every platform",
    to: "/shill",
    icon: <Zap size={18} aria-hidden />,
    accent: "gold",
    badge: "NEW",
  },
  {
    key: "buy",
    label: "How to Buy",
    blurb: "Robinhood Chain · MetaMask path",
    hash: "buy",
    icon: <ShoppingBag size={18} aria-hidden />,
    accent: "green",
  },
  {
    key: "tokenomics",
    label: "Tokenomics",
    blurb: "Supply · burns · chart links",
    hash: "tokenomics",
    icon: <ChartNoAxesCombined size={18} aria-hidden />,
    accent: "green",
  },
  {
    key: "roadmap",
    label: "Roadmap",
    blurb: "Where the herd is headed",
    hash: "roadmap",
    icon: <Map size={18} aria-hidden />,
    accent: "purple",
  },
  {
    key: "chat",
    label: "Herd Chat",
    blurb: "Talk shop with the herd",
    hash: "herd-chat",
    icon: <MessageCircle size={18} aria-hidden />,
    accent: "blue",
  },
  {
    key: "socials",
    label: "Socials",
    blurb: "X · TikTok · YouTube · TG",
    hash: "socials",
    icon: <Share2 size={18} aria-hidden />,
    accent: "blue",
  },
  {
    key: "signup",
    label: "Sign up free",
    blurb: "Join as a creator in one form",
    to: "/signup",
    icon: <UserPlus size={18} aria-hidden />,
    accent: "green",
  },
  {
    key: "home",
    label: "Top of site",
    blurb: "Hero video · start over",
    to: "/",
    icon: <Rocket size={18} aria-hidden />,
    accent: "purple",
  },
];

const QUICK_BAR: { key: string; label: string; hash?: string; to?: Dest["to"] }[] =
  [
    { key: "story", label: "Story", hash: "story" },
    { key: "board", label: "Board", hash: "leaderboard" },
    { key: "fame", label: "Fame", hash: "wall-of-fame" },
    { key: "buy", label: "Buy", hash: "buy" },
  ];

const accentRing: Record<Dest["accent"], string> = {
  red: "border-red/35 bg-red/10 text-red group-hover:border-red/60 group-hover:bg-red/15",
  gold: "border-gold/35 bg-gold/10 text-gold group-hover:border-gold/60 group-hover:bg-gold/15",
  green:
    "border-green/35 bg-green/10 text-green group-hover:border-green/60 group-hover:bg-green/15",
  blue: "border-blue/35 bg-blue/10 text-blue group-hover:border-blue/60 group-hover:bg-blue/15",
  purple:
    "border-purple/35 bg-purple/10 text-purple group-hover:border-purple/60 group-hover:bg-purple/15",
};

const accentCard: Record<Dest["accent"], string> = {
  red: "hover:border-red/40 hover:shadow-[0_0_24px_rgba(255,0,51,0.12)]",
  gold: "hover:border-gold/40 hover:shadow-[0_0_24px_rgba(255,204,0,0.12)]",
  green: "hover:border-green/40 hover:shadow-[0_0_24px_rgba(0,255,102,0.1)]",
  blue: "hover:border-blue/40 hover:shadow-[0_0_24px_rgba(38,165,228,0.12)]",
  purple: "hover:border-purple/40 hover:shadow-[0_0_24px_rgba(155,123,255,0.12)]",
};

function destHref(onHome: boolean, d: Dest): string {
  if (d.to) return d.to;
  if (d.hash) return onHome ? `#${d.hash}` : `/#${d.hash}`;
  return "/";
}

function DestCard({
  d,
  onHome,
  onNavigate,
}: {
  d: Dest;
  onHome: boolean;
  onNavigate: () => void;
}) {
  const href = destHref(onHome, d);
  const isRoute = Boolean(d.to);

  const className = cn(
    "group flex items-start gap-3 rounded-md border border-white/10 bg-surface/90 p-3 text-left no-underline transition-all",
    "active:scale-[0.99]",
    accentCard[d.accent],
  );

  const body = (
    <>
      <span
        className={cn(
          "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
          accentRing[d.accent],
        )}
      >
        {d.icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-fg">
            {d.label}
          </span>
          {d.badge ? (
            <span className="rounded-[2px] bg-gold px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-bg">
              {d.badge}
            </span>
          ) : null}
        </span>
        <span className="mt-1 block font-mono text-[10px] leading-snug text-muted">
          {d.blurb}
        </span>
      </span>
    </>
  );

  if (isRoute && d.to) {
    return (
      <Link to={d.to} onClick={onNavigate} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <a href={href} onClick={onNavigate} className={className}>
      {body}
    </a>
  );
}

/** Sticky top bar with explore menu of real destinations */
export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/" || pathname === "";
  const onStudio = pathname.startsWith("/studio");
  const onShill = pathname.startsWith("/shill");
  const onSignup = pathname.startsWith("/signup");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    // only lock on small screens where panel is full height
    const mq = window.matchMedia("(max-width: 1023px)");
    if (mq.matches) document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [menuOpen]);

  function close() {
    setMenuOpen(false);
  }

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-40 border-b border-white/10 bg-bg/92 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      <div
        className="h-0.5 w-full bg-gradient-to-r from-red via-gold to-green"
        aria-hidden
      />

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 md:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={close}
          className="group flex shrink-0 items-center gap-2 no-underline sm:gap-2.5"
        >
          <span
            className="h-2 w-2 rotate-45 bg-green shadow-[0_0_10px_#00ff66] transition-transform group-hover:scale-110"
            aria-hidden
          />
          <span className="font-display text-[1.55rem] uppercase leading-none tracking-wide text-fg sm:text-[1.85rem]">
            Astro
            <span className="animate-flicker text-red">Bull</span>
          </span>
        </Link>

        {/* Quick hops — desktop */}
        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="Quick links"
        >
          {QUICK_BAR.map((q) => (
            <a
              key={q.key}
              href={
                q.hash
                  ? onHome
                    ? `#${q.hash}`
                    : `/#${q.hash}`
                  : q.to ?? "/"
              }
              className="rounded-sm px-2.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted no-underline transition-colors hover:bg-white/5 hover:text-fg"
            >
              {q.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/shill"
            onClick={close}
            className={cn(
              "hidden items-center gap-1.5 rounded-sm border px-2.5 py-2 font-mono text-[9px] font-bold uppercase tracking-widest no-underline transition-colors sm:inline-flex sm:text-[10px]",
              onShill
                ? "border-gold bg-gold text-bg"
                : "border-gold/40 bg-gold/10 text-gold hover:border-gold hover:bg-gold/20",
            )}
          >
            <Sparkles size={12} aria-hidden />
            Shill
          </Link>

          <Link
            to="/studio"
            onClick={close}
            className={cn(
              "inline-flex min-h-9 items-center gap-1 rounded-sm bg-red px-2.5 font-mono text-[9px] font-bold uppercase tracking-widest text-white no-underline transition-all sm:px-3.5 sm:text-[10px]",
              onStudio
                ? "shadow-[0_0_18px_rgba(255,0,51,0.55)] ring-1 ring-white/25"
                : "hover:bg-red-hot hover:shadow-[0_0_16px_rgba(255,0,51,0.4)]",
            )}
          >
            <Flame size={12} aria-hidden />
            Studio
          </Link>

          <Link
            to="/signup"
            onClick={close}
            className={cn(
              "hidden min-h-9 items-center rounded-sm border px-3 font-mono text-[10px] font-bold uppercase tracking-widest no-underline transition-colors sm:inline-flex",
              onSignup
                ? "border-green bg-green/15 text-green"
                : "border-green/45 text-green hover:border-green hover:bg-green/10",
            )}
          >
            Sign up
          </Link>

          {/* Explore toggle — the tasty menu */}
          <button
            type="button"
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-[9px] font-bold uppercase tracking-widest transition-all sm:px-3 sm:text-[10px]",
              menuOpen
                ? "border-fg bg-fg text-bg"
                : "border-white/20 bg-elevated text-fg hover:border-white/40 hover:bg-white/5",
            )}
            aria-expanded={menuOpen}
            aria-controls={panelId}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X size={14} aria-hidden />
            ) : (
              <Menu size={14} className="sm:hidden" aria-hidden />
            )}
            <span className="hidden sm:inline">
              {menuOpen ? "Close" : "Explore"}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "hidden transition-transform sm:inline",
                menuOpen && "rotate-180",
              )}
              aria-hidden
            />
            <span className="sm:hidden">{menuOpen ? "Close" : "Menu"}</span>
          </button>
        </div>
      </div>

      {/* Explore panel */}
      {menuOpen ? (
        <div
          id={panelId}
          role="navigation"
          aria-label="Explore Astro Bull"
          className="border-t border-white/10 bg-bg/98 backdrop-blur-xl"
        >
          <div className="mx-auto max-h-[min(78dvh,720px)] max-w-6xl overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 md:px-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-dim">
                  Where to go
                </p>
                <p className="mt-1 font-display text-2xl uppercase tracking-wide text-fg sm:text-3xl">
                  Explore the{" "}
                  <span className="animate-flicker text-red">herd</span>
                </p>
              </div>
              <p className="max-w-xs font-mono text-[10px] leading-relaxed text-muted">
                Jump to story, studio, fame, buy, chat — or open shill tools.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {DESTINATIONS.map((d) => (
                <DestCard
                  key={d.key}
                  d={d}
                  onHome={onHome}
                  onNavigate={close}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                We are all Astro · holding optional
              </p>
              <a
                href="/astrobull-whitepaper.pdf"
                download
                onClick={close}
                className="font-mono text-[10px] font-bold uppercase tracking-widest text-green no-underline hover:underline"
              >
                Whitepaper ↓
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
