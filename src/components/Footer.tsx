import { Link } from "@tanstack/react-router";

const LINKS: [string, string][] = [
  ["TikTok", "https://www.tiktok.com/@astrobull.robinho"],
  ["YouTube", "https://www.youtube.com/@ASTROBULL.ROBINHOOD"],
  ["Snapchat", "https://www.snapchat.com/add/astrobull-rhood"],
  ["Telegram", "https://t.me/Official_Astrobull_Robinhood"],
  ["X (follow only)", "https://x.com/AstroBull_RH"],
];

export default function Footer() {
  return (
    <footer
      id="socials"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/5 bg-bg px-4 py-16 sm:px-8 md:px-14"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 select-none text-center opacity-5">
        <p className="font-display text-[12vw] uppercase tracking-wide whitespace-nowrap">
          Slaughterhouse
        </p>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.3em] text-red">
          We are all Astro
        </p>
        <h3 className="font-display text-3xl uppercase text-fg sm:text-4xl">
          Join the Movement
        </h3>
        <p className="mx-auto mt-4 max-w-md font-mono text-xs leading-relaxed text-muted sm:text-sm">
          Create content. Tag us. Hold with conviction. Break the chains with us.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {LINKS.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/15 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-fg/80 no-underline transition-colors hover:border-red hover:text-red"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/studio"
            className="bg-red px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white no-underline shadow-[0_0_16px_rgba(255,0,51,0.35)]"
          >
            Creator Studio
          </Link>
          <Link
            to="/shill"
            className="border border-gold/50 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-gold no-underline hover:bg-gold/10"
          >
            Shill HQ
          </Link>
          <a
            href="/#herd-chat"
            className="border border-green/40 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-green no-underline hover:bg-green/10"
          >
            Herd chat
          </a>
          <a
            href="/#x-track"
            className="border border-white/20 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-fg no-underline hover:border-fg"
          >
            X track
          </a>
          <Link
            to="/signup"
            className="border border-white/15 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted no-underline hover:text-fg"
          >
            Sign up
          </Link>
          <a
            href="/astrobull-whitepaper.pdf"
            download
            className="border border-green/40 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-green no-underline"
          >
            Whitepaper
          </a>
        </div>

        <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-dim">
          © {new Date().getFullYear()} Slaughterhouse Productions · All rights reserved
        </p>
      </div>
    </footer>
  );
}
