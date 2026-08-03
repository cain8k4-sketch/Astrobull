import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Top bar: Buy · Story · Creator Studio · NEW Shill HQ · Socials · Sign up */
export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/" || pathname === "";

  const linkMuted =
    "font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="font-display text-2xl uppercase tracking-wide text-fg no-underline"
        >
          Astro
          <span className="animate-flicker">Bull</span>
        </Link>

        <nav className="hidden items-center gap-3 sm:flex lg:gap-5">
          {!onHome ? (
            <Link to="/" className={linkMuted}>
              Home
            </Link>
          ) : null}

          {onHome ? (
            <a href="#buy" className={linkMuted}>
              Buy
            </a>
          ) : (
            <Link to="/" hash="buy" className={linkMuted}>
              Buy
            </Link>
          )}

          {onHome ? (
            <a href="#story" className={linkMuted}>
              Story
            </a>
          ) : (
            <Link to="/" hash="story" className={linkMuted}>
              Story
            </Link>
          )}

          <Link
            to="/studio"
            className={cn(
              "rounded-sm px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white no-underline transition-colors",
              pathname.startsWith("/studio")
                ? "bg-red shadow-[0_0_16px_rgba(255,0,51,0.45)]"
                : "bg-red hover:bg-red-hot",
            )}
          >
            Creator Studio
          </Link>

          <Link
            to="/shill"
            className={cn(
              "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] no-underline transition-colors",
              pathname.startsWith("/shill")
                ? "text-gold"
                : "text-muted hover:text-gold",
            )}
          >
            <span
              className={cn(
                "rounded-sm px-1 py-0.5 text-[8px] font-bold tracking-widest",
                pathname.startsWith("/shill")
                  ? "bg-gold text-bg"
                  : "bg-gold/20 text-gold",
              )}
            >
              NEW
            </span>
            Shill HQ
          </Link>

          {onHome ? (
            <a href="#socials" className={linkMuted}>
              Socials
            </a>
          ) : (
            <Link to="/" hash="socials" className={linkMuted}>
              Socials
            </Link>
          )}

          <Link
            to="/signup"
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.15em] no-underline transition-colors",
              pathname.startsWith("/signup")
                ? "text-green"
                : "text-muted hover:text-green",
            )}
          >
            Sign up
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-fg sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-surface px-4 py-3 sm:hidden">
          <div className="flex flex-col">
            {!onHome ? (
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="py-3 font-mono text-xs uppercase tracking-widest text-muted no-underline"
              >
                Home
              </Link>
            ) : null}
            <a
              href={onHome ? "#buy" : "/#buy"}
              onClick={() => setOpen(false)}
              className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
            >
              Buy
            </a>
            <a
              href={onHome ? "#story" : "/#story"}
              onClick={() => setOpen(false)}
              className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
            >
              Story
            </a>
            <Link
              to="/studio"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-sm bg-red py-3 text-center font-mono text-xs uppercase tracking-widest text-white no-underline"
            >
              Creator Studio
            </Link>
            <Link
              to="/shill"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 py-3 font-mono text-xs uppercase tracking-widest text-gold no-underline"
            >
              <span className="rounded-sm bg-gold/25 px-1.5 py-0.5 text-[9px] font-bold text-gold">
                NEW
              </span>
              Shill HQ
            </Link>
            <a
              href={onHome ? "#socials" : "/#socials"}
              onClick={() => setOpen(false)}
              className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
            >
              Socials
            </a>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="py-3 text-center font-mono text-xs uppercase tracking-widest text-green no-underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
