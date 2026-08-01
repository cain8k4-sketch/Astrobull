import { useMemo, useState } from "react";
import { Check, ChevronDown, ExternalLink, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatHashtags, generateHashtags } from "@/lib/hashtags";
import type { ParsedOutput } from "@/lib/ai-providers";

/** Official push focus: TikTok · YouTube · Snapchat. X is optional (shadowban risk). */
export type PlatformId = "tiktok" | "youtube" | "snapchat" | "x" | "facebook";

const PLATFORMS: {
  id: PlatformId;
  label: string;
  sub: string;
  color: string;
  comingSoon?: boolean;
}[] = [
  { id: "tiktok", label: "TikTok", sub: "Main short-form", color: "text-fg" },
  { id: "youtube", label: "YouTube", sub: "Long / Shorts", color: "text-red" },
  { id: "snapchat", label: "Snapchat", sub: "Spotlight / Stories", color: "text-gold" },
  {
    id: "x",
    label: "X",
    sub: "Optional · go easy",
    color: "text-muted",
  },
  {
    id: "facebook",
    label: "Facebook",
    sub: "Coming soon",
    color: "text-blue",
    comingSoon: true,
  },
];

function shareText(result: ParsedOutput, platforms: PlatformId[]) {
  const tags =
    result.hashtags?.length > 0
      ? formatHashtags(result.hashtags)
      : formatHashtags(
          generateHashtags({
            topic: result.title,
            caption: result.caption,
            body: result.body,
            platforms,
            max: 12,
          }),
        );
  return `${result.title}\n\n${result.caption || result.body.slice(0, 400)}\n\n${tags}`;
}

export function PlatformCheckboxes({
  selected,
  onChange,
  onPick,
}: {
  selected: PlatformId[];
  onChange: (next: PlatformId[]) => void;
  /** Called when user turns a platform ON (not off) */
  onPick?: (id: PlatformId) => void;
}) {
  const [flashId, setFlashId] = useState<PlatformId | null>(null);
  const [hint, setHint] = useState(false);

  function toggle(id: PlatformId, comingSoon?: boolean) {
    if (comingSoon) return;
    const turningOn = !selected.includes(id);
    onChange(
      turningOn ? [...selected, id] : selected.filter((p) => p !== id),
    );
    if (turningOn) {
      setFlashId(id);
      setHint(true);
      onPick?.(id);
      window.setTimeout(() => setFlashId(null), 900);
      window.setTimeout(() => setHint(false), 4000);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const on = selected.includes(p.id);
          return (
            <label
              key={p.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 border px-3 py-3 transition-colors",
                p.comingSoon
                  ? "cursor-not-allowed border-white/10 opacity-50"
                  : on
                    ? "border-green bg-green/15"
                    : "border-white/15 bg-bg/60 hover:border-white/30",
                flashId === p.id && "animate-green-flash",
              )}
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[#00ff66]"
                checked={on}
                disabled={!!p.comingSoon}
                onChange={() => toggle(p.id, p.comingSoon)}
              />
              <span className="flex-1">
                <span className={cn("block font-display text-base uppercase", p.color)}>
                  {p.label}
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-wide text-muted">
                  {p.sub}
                  {p.comingSoon ? " · locked" : ""}
                </span>
              </span>
              {on && !p.comingSoon ? <Check size={14} className="text-green" /> : null}
            </label>
          );
        })}
      </div>
      {hint ? (
        <p className="animate-scroll-hint mt-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-green">
          <ChevronDown size={14} className="animate-bounce" />
          Selected — scroll down to continue
        </p>
      ) : null}
    </div>
  );
}

export default function PlatformPush({
  result,
  selected: controlled,
  onSelectedChange,
}: {
  result: ParsedOutput;
  selected?: PlatformId[];
  onSelectedChange?: (next: PlatformId[]) => void;
}) {
  const [internal, setInternal] = useState<PlatformId[]>([
    "tiktok",
    "youtube",
    "snapchat",
  ]);
  const selected = controlled ?? internal;
  const setSelected = onSelectedChange ?? setInternal;
  const [pushed, setPushed] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const text = useMemo(() => shareText(result, selected), [result, selected]);

  async function onPush() {
    const live = selected.filter(
      (id) => !PLATFORMS.find((p) => p.id === id)?.comingSoon,
    );
    if (live.length === 0) {
      setMsg("Tick at least one live platform.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* still open share intents */
    }

    if (live.includes("tiktok")) {
      window.open("https://www.tiktok.com/upload", "_blank", "noopener,noreferrer");
    }
    if (live.includes("youtube")) {
      window.open("https://studio.youtube.com", "_blank", "noopener,noreferrer");
    }
    if (live.includes("snapchat")) {
      window.open(
        "https://www.snapchat.com/add/astrobull-rhood",
        "_blank",
        "noopener,noreferrer",
      );
    }
    if (live.includes("x")) {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 260))}`,
        "_blank",
        "noopener,noreferrer",
      );
    }

    setPushed(true);
    setMsg(
      `Title + caption + hashtags copied. Opening ${live
        .map((id) => PLATFORMS.find((p) => p.id === id)?.label)
        .join(", ")} — paste & post. Official push: TikTok · YouTube · Snapchat.`,
    );
  }

  return (
    <div className="mt-6 border border-red/40 bg-red/5 p-4 sm:p-5">
      <div className="mb-1 flex items-center gap-2">
        <Send size={14} className="text-red" />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red">
          Push to platforms
        </p>
      </div>
      <p className="mb-4 font-mono text-xs text-muted">
        Main channels: <span className="text-fg">TikTok · YouTube · Snapchat</span>.
        X is optional (easy to get limited if you spam). Title, caption, hashtags copy with push.
      </p>

      <PlatformCheckboxes selected={selected} onChange={setSelected} />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onPush()}
          className="inline-flex items-center gap-2 rounded-sm bg-red px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(255,0,51,0.35)]"
        >
          <Send size={14} />
          {pushed ? "Pushed — open tabs" : "Push selected"}
        </button>
        <a
          href="https://www.tiktok.com/@astrobull.robinho"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-fg no-underline"
        >
          <ExternalLink size={14} />
          Tag TikTok
        </a>
      </div>

      {msg ? (
        <p className="mt-3 font-mono text-xs leading-relaxed text-green">{msg}</p>
      ) : null}
      <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-dim">
        Official focus: TikTok · YouTube · Snapchat · X optional
      </p>
    </div>
  );
}
