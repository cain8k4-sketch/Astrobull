import { Link, useRouterState } from "@tanstack/react-router";
import {
  Flame,
  Menu,
  MessageCircle,
  Share2,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  key: string;
  label: string;
  hash?: string;
  to?: string;
  icon?: ReactNode;
  tone?: "default" | "gold" | "green";
};

const SECTION_LINKS: NavItem[] = [
  {
    key: "buy",
    label: "Buy",
    hash: "buy",
    icon: <ShoppingBag size={12} aria-hidden />,
  },
  { key: "story", label: "Story", hash: "story" },
  {
    key: "fame",
    label: "Hall of Fame",
    hash: "wall-of-fame",
    icon: <Star size={12} aria-hidden />,
    tone: "gold",
  },
  {
    key: "chat",
    label: "Chat",
    hash: "herd-chat",
    icon: <MessageCircle size={12} aria-hidden />,
  },
  {
    key: "socials",
    label: "Socials",
    hash: "socials",
    icon: <Share2 size={12} aria-hidden />,
  },
];

function sectionHref(onHome: boolean, hash: string) {
  return onHome ? `#${hash}` : `/#${hash}`;
}

/** Sticky top bar — logo · sections · CTAs · mobile drawer */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/" || pathname === "";
  const onStudio = pathname.startsWith("/studio");
  const onShill = pathname.startsWith("/shill");
  const onSignup = pathname.startsWith("/signup");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const linkBase =
    "group relative inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] no-underline transition-colors";

  function sectionClass(tone?: NavItem["tone"]) {
    if (tone === "gold") {
      return cn(linkBase, "text-gold/90 hover:text-gold");
    }
    return cn(linkBase, "text-muted hover:text-fg");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg/90 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div
        className="h-0.5 w-full bg-gradient-to-r from-red via-gold to-green"
        aria-hidden
      />

      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-6 md:px-8">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="group flex shrink-0 items-center gap-2.5 no-underline"
        >
          <span
            className="h-2 w-2 rotate-45 bg-green shadow-[0_0_10px_#00ff66] transition-transform group-hover:scale-110"
            aria-hidden
          />
          <span className="font-display text-[1.65rem] uppercase leading-none tracking-wide text-fg sm:text-[1.85rem]">
            Astro
            <span className="animate-flicker text-red">Bull</span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          {!onHome ? (
            <Link
              to="/"
              className={cn(linkBase, "px-2.5 py-2 text-muted hover:text-fg")}
            >
              Home
            </Link>
          ) : null}

          {SECTION_LINKS.map((item) =>
            item.hash ? (
              <a
                key={item.key}
                href={sectionHref(onHome, item.hash)}
                className={cn(sectionClass(item.tone), "px-2.5 py-2")}
              >
                <span className="hidden xl:inline-flex opacity-70">
                  {item.icon}
                </span>
                {item.label}
                <span
                  className="absolute inset-x-2.5 -bottom-0.5 h-px origin-left scale-x-0 bg-green transition-transform group-hover:scale-x-100"
                  aria-hidden
                />
              </a>
            ) : null,
          )}

          <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />

          <Link
            to="/shill"
            className={cn(
              linkBase,
              "gap-1.5 px-2.5 py-2",
              onShill ? "text-gold" : "text-muted hover:text-gold",
            )}
          >
            <span
              className={cn(
                "rounded-[2px] px-1 py-0.5 text-[8px] font-bold tracking-[0.14em]",
                onShill
                  ? "bg-gold text-bg"
                  : "border border-gold/40 bg-gold/10 text-gold",
              )}
            >
              NEW
            </span>
            Shill HQ
          </Link>

          <Link
            to="/studio"
            className={cn(
              "ml-1 inline-flex min-h-9 items-center justify-center rounded-sm px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white no-underline transition-all",
              onStudio
                ? "bg-red shadow-[0_0_18px_rgba(255,0,51,0.55)] ring-1 ring-white/20"
                : "bg-red hover:bg-red-hot hover:shadow-[0_0_16px_rgba(255,0,51,0.4)]",
            )}
          >
            <Flame size={12} className="mr-1.5 opacity-90" aria-hidden />
            Studio
          </Link>

          <Link
            to="/signup"
            className={cn(
              "inline-flex min-h-9 items-center justify-center rounded-sm border px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] no-underline transition-colors",
              onSignup
                ? "border-green bg-green/15 text-green"
                : "border-green/45 text-green hover:border-green hover:bg-green/10",
            )}
          >
            Sign up
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to="/studio"
            className="inline-flex min-h-9 items-center rounded-sm bg-red px-3 font-mono text-[9px] font-bold uppercase tracking-widest text-white no-underline"
          >
            Studio
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-white/15 text-fg transition-colors hover:border-white/30"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-x-0 bottom-0 top-14 z-40 border-t border-white/10 bg-bg/98 backdrop-blur-xl sm:top-16 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <div className="mx-auto flex h-full max-w-lg flex-col overflow-y-auto px-4 py-5 sm:px-6">
            <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-dim">
              Navigate
            </p>

            <div className="flex flex-col gap-1">
              {!onHome ? (
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="rounded-sm border border-white/10 bg-surface px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-fg no-underline"
                >
                  Home
                </Link>
              ) : null}

              {SECTION_LINKS.map((item) =>
                item.hash ? (
                  <a
                    key={item.key}
                    href={sectionHref(onHome, item.hash)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-sm border border-white/10 bg-surface px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-widest no-underline transition-colors active:bg-elevated",
                      item.tone === "gold" ? "text-gold" : "text-fg",
                    )}
                  >
                    <span className="text-muted">{item.icon}</span>
                    {item.label}
                  </a>
                ) : null,
              )}
            </div>

            <p className="mb-3 mt-6 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-dim">
              Create · shill · join
            </p>

            <div className="flex flex-col gap-2">
              <Link
                to="/shill"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-sm border px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-widest no-underline",
                  onShill
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-gold/35 bg-gold/5 text-gold",
                )}
              >
                <span>Shill HQ</span>
                <span className="rounded-[2px] bg-gold px-1.5 py-0.5 text-[9px] font-bold text-bg">
                  NEW
                </span>
              </Link>

              <Link
                to="/studio"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-sm bg-red py-4 font-mono text-xs font-bold uppercase tracking-widest text-white no-underline shadow-[0_0_20px_rgba(255,0,51,0.35)]"
              >
                <Flame size={14} aria-hidden />
                Creator Studio
              </Link>

              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-sm border border-green/50 py-4 font-mono text-xs font-bold uppercase tracking-widest text-green no-underline hover:bg-green/10"
              >
                Sign up free
              </Link>
            </div>

            <p className="mt-auto pt-8 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
              We are all Astro
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
