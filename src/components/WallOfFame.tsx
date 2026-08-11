import {
  ExternalLink,
  Flame,
  Instagram,
  Play,
  Star,
  UserPlus,
  Youtube,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";
import {
  WALL_OF_FAME,
  platformLabel,
  profileFromHandle,
  type FameCreator,
  type FamePlatform,
} from "@/lib/wall-of-fame";
import { cn } from "@/lib/utils";

function PlatformIcon({ platform }: { platform: FamePlatform }) {
  if (platform === "youtube")
    return <Youtube size={14} className="shrink-0 text-red" />;
  if (platform === "instagram")
    return <Instagram size={14} className="shrink-0 text-pink" />;
  if (platform === "tiktok")
    return (
      <span className="font-display text-xs leading-none text-fg" aria-hidden>
        ♪
      </span>
    );
  if (platform === "x")
    return (
      <span className="font-display text-sm leading-none text-fg" aria-hidden>
        𝕏
      </span>
    );
  return <Play size={14} className="shrink-0 text-green" />;
}

function FameCard({ creator, index }: { creator: FameCreator; index: number }) {
  const profile = profileFromHandle(creator);
  const handle = creator.handle.startsWith("@")
    ? creator.handle
    : `@${creator.handle}`;

  return (
    <article
      className={cn(
        "flex flex-col border bg-surface p-4 transition-colors sm:p-5",
        creator.featured
          ? "border-gold/45 shadow-[0_0_24px_rgba(255,200,50,0.08)]"
          : "border-white/10 hover:border-green/40",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-dim">
            {String(index + 1).padStart(2, "0")}
          </span>
          {creator.featured ? (
            <span className="inline-flex items-center gap-1 rounded-sm border border-gold/40 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gold">
              <Star size={10} /> Featured
            </span>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted">
          <PlatformIcon platform={creator.platform} />
          {platformLabel(creator.platform)}
        </span>
      </div>

      <h3 className="font-display text-xl uppercase leading-none text-fg sm:text-2xl">
        {creator.name}
      </h3>

      {profile ? (
        <a
          href={profile}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex w-fit items-center gap-1 font-mono text-xs text-green no-underline hover:underline"
        >
          {handle}
          <ExternalLink size={11} className="opacity-60" />
        </a>
      ) : (
        <p className="mt-2 font-mono text-xs text-green">{handle}</p>
      )}

      {creator.blurb ? (
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
          {creator.blurb}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={creator.workUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 bg-red px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white no-underline hover:bg-red-hot sm:flex-none"
        >
          <Play size={12} />
          Watch work
        </a>
        {profile ? (
          <a
            href={profile}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-white/20 px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-fg no-underline hover:border-green hover:text-green sm:flex-none"
          >
            Profile
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default function WallOfFame() {
  const ref = useReveal<HTMLDivElement>();
  const list = WALL_OF_FAME;

  return (
    <section
      id="wall-of-fame"
      className="border-t border-white/5 bg-black px-4 py-16 sm:px-8 md:px-14 md:py-24"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="h-2 w-2 rotate-45 bg-gold shadow-[0_0_10px_rgba(255,200,50,0.7)]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-gold sm:text-xs">
            Hall of creators
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              className="font-display uppercase leading-none text-fg"
              style={{ fontSize: "clamp(2.5rem, 10vw, 4.5rem)" }}
            >
              Wall of
              <span className="animate-flicker text-gold"> Fame</span>
            </h2>
            <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
              Creators who dropped Astro Bull content on socials —{" "}
              <span className="text-fg">handles + links to their work</span>.
              Get featured: post, tag the herd, upload in our TG content chat.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 border border-green/40 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-green no-underline hover:bg-green/10"
          >
            <UserPlus size={12} />
            Join creators
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 border border-dashed border-white/15 bg-surface px-5 py-10 text-center">
            <Flame size={22} className="mx-auto mb-3 text-gold" />
            <p className="font-display text-xl uppercase text-fg">
              First names loading…
            </p>
            <p className="mt-2 font-mono text-xs text-muted">
              Drop content on socials + TG. Winners land here with handle + work
              link.
            </p>
            <Link
              to="/studio"
              className="mt-5 inline-flex bg-red px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wider text-white no-underline"
            >
              Create & upload
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {list.map((c, i) => (
              <FameCard key={c.id} creator={c} index={i} />
            ))}
          </div>
        )}

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          Want on the wall? Sign up · post · tag us · drop files in TG
        </p>
      </div>
    </section>
  );
}
