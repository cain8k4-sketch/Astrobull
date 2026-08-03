import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import TgContentDrop from "@/components/TgContentDrop";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/" || pathname === "";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="font-display text-2xl uppercase tracking-wide text-fg no-underline"
        >
          Astro
          <span className="animate-flicker">Bull</span>
        </Link>

        <nav className="hidden items-center gap-4 sm:flex">
          {onHome ? (
            <>
              <a
                href="#story"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green"
              >
                Story
              </a>
              <a
                href="#studio"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green"
              >
                Studio
              </a>
              <a
                href="#leaderboard"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green"
              >
                Board
              </a>
              <a
                href="#shill"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green"
              >
                Shill
              </a>
              <a
                href="#herd-chat"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green"
              >
                Chat
              </a>
              <a
                href="#buy"
                className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green"
              >
                Buy
              </a>
            </>
          ) : (
            <Link
              to="/"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline hover:text-green"
            >
              Home
            </Link>
          )}
          <a
            href="/astrobull-whitepaper.pdf"
            download
            className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted no-underline transition-colors hover:text-green"
          >
            Whitepaper
          </a>
          <TgContentDrop variant="nav" />
          <Link
            to="/shill"
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.15em] no-underline transition-colors",
              pathname.startsWith("/shill")
                ? "text-gold"
                : "text-muted hover:text-gold",
            )}
          >
            Shill tool
          </Link>
          <Link
            to="/studio"
            className={cn(
              "rounded-sm px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white no-underline transition-colors",
              pathname.startsWith("/studio")
                ? "bg-red shadow-[0_0_16px_rgba(255,0,51,0.45)]"
                : "bg-red hover:bg-red-hot",
            )}
          >
            Creator Studio $$$
          </Link>
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
            {onHome ? (
              <>
                <a
                  href="#story"
                  onClick={() => setOpen(false)}
                  className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
                >
                  Story
                </a>
                <a
                  href="#studio"
                  onClick={() => setOpen(false)}
                  className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
                >
                  Studio
                </a>
                <a
                  href="#leaderboard"
                  onClick={() => setOpen(false)}
                  className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
                >
                  Board
                </a>
                <a
                  href="#shill"
                  onClick={() => setOpen(false)}
                  className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
                >
                  Shill
                </a>
                <a
                  href="#x-track"
                  onClick={() => setOpen(false)}
                  className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
                >
                  X track
                </a>
                <a
                  href="#herd-chat"
                  onClick={() => setOpen(false)}
                  className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
                >
                  Chat
                </a>
                <a
                  href="#quick"
                  onClick={() => setOpen(false)}
                  className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
                >
                  Buy
                </a>
              </>
            ) : (
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="py-3 font-mono text-xs uppercase tracking-widest text-muted no-underline"
              >
                Home
              </Link>
            )}
            <a
              href="/astrobull-whitepaper.pdf"
              download
              onClick={() => setOpen(false)}
              className="py-3 font-mono text-xs uppercase tracking-widest text-muted"
            >
              Whitepaper
            </a>
            <div className="py-2" onClick={() => setOpen(false)}>
              <TgContentDrop variant="button" />
            </div>
            <Link
              to="/shill"
              onClick={() => setOpen(false)}
              className="py-3 text-center font-mono text-xs uppercase tracking-widest text-gold no-underline"
            >
              Shill tool
            </Link>
            <Link
              to="/studio"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-sm bg-red py-3 text-center font-mono text-xs uppercase tracking-widest text-white no-underline"
            >
              Creator Studio $$$
            </Link>
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
