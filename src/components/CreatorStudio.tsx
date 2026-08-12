import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  DollarSign,
  FileUp,
  Lock,
  Send,
  Star,
  Trash2,
  Upload,
  Wand2,
  Download,
  UserPlus,
  ExternalLink,
} from "lucide-react";

import {
  PROVIDERS,
  LENGTHS,
  buildUserPrompt,
  callProvider,
  demoGenerate,
  parseOutput,
  type ContentKind,
  type ParsedOutput,
  type ProviderId,
} from "@/lib/ai-providers";
import {
  ASTRO_LOOK,
  EXTERNAL_TOOLS,
  buildExternalPromptPack,
  resolveEmotion,
  type EmotionState,
  type ExternalPromptKind,
} from "@/lib/astro-bible";
import {
  loadKeys,
  saveKeys,
  maskKey,
  saveUpload,
  type KeyMap,
} from "@/lib/keys";
import { generateHashtags, formatHashtags } from "@/lib/hashtags";
import { cn } from "@/lib/utils";
import PlatformPush, {
  PlatformCheckboxes,
  type PlatformId,
} from "@/components/PlatformPush";
import TgContentDrop from "@/components/TgContentDrop";
import { Link } from "@tanstack/react-router";
import { TG_CONTENT_UPLOAD } from "@/lib/community";
import {
  loadLastSignup,
  type CreatorSignup,
} from "@/lib/signup";

type Path = "ai" | "prompt" | null;

const TONES = [
  "cinematic horror-meme",
  "hype & bullish",
  "dark comedy",
  "serious lore",
];
const STYLES = [
  "dark cinematic",
  "neon slaughterhouse",
  "grainy VHS",
  "poster comic",
];

/** Always-visible pipeline: Sign up -> Drop in TG -> Get featured -> Get paid */
const PIPELINE = [
  {
    n: "1",
    title: "Sign up",
    short: "Join the herd",
    body: "30-second form. Handle, wallet, contact. Status starts pending. Holding is optional.",
    Icon: UserPlus,
  },
  {
    n: "2",
    title: "Drop in TG",
    short: "Private content chat",
    body: "Open the Telegram content chat. Post video / image / clip. No site upload.",
    Icon: Send,
  },
  {
    n: "3",
    title: "Get featured",
    short: "We amplify winners",
    body: "Best work hits official Astro Bull channels + Wall of Fame.",
    Icon: Star,
  },
  {
    n: "4",
    title: "Get paid",
    short: "$50 USDC threshold",
    body: "Verified views. Paid in USDC / USDT. MetaMask or any 0x wallet. Holding optional.",
    Icon: DollarSign,
  },
] as const;

function statusLabel(s: CreatorSignup["status"]) {
  if (s === "approved") return "Featured";
  if (s === "rejected") return "Needs rework";
  return "Pending";
}

function activeStepIndex(signup: CreatorSignup | null): number {
  if (!signup) return 0;
  if (signup.status === "approved") {
    if (signup.total_earned >= 50) return 3;
    return 2;
  }
  if (signup.status === "rejected") return 1;
  return 1;
}

const SELLING_POINTS = [
  "Holding is optional — earn from performance, not a bag requirement",
  "Amplification: featured creators ride official TikTok / YouTube / Snapchat reach",
  "You keep your voice — AI is optional; original uploads welcome",
  "Locked Astro Bull look so the brand stays consistent across every creator",
  "Auto hashtags + platform push so posting is faster",
  "Paid in real stable value (USDC/USDT) — $50 minimum payout threshold",
  "Wallet connect (MetaMask) — create one in a minute if you do not have one",
  "Transparent rules: verified views, not empty promises",
  "Story + culture + culture: building a saga, not farming a dead meme",
  "Dev burns, does not sell — culture and content first",
] as const;

export default function CreatorStudio() {
  const [path, setPath] = useState<Path>(null);
  const [keys, setKeys] = useState<KeyMap>({});
  const [provider, setProvider] = useState<ProviderId>("grok");
  const [apiKey, setApiKey] = useState("");
  const [keyMsg, setKeyMsg] = useState<string | null>(null);
  const [keyErr, setKeyErr] = useState<string | null>(null);

  const [kind, setKind] = useState<ContentKind | null>(null);
  const [useProvider, setUseProvider] = useState<ProviderId | "">("");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState(TONES[0]!);
  const [style, setStyle] = useState(STYLES[0]!);
  const [length, setLength] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [upTitle, setUpTitle] = useState("");
  const [upDesc, setUpDesc] = useState("");
  const [upType, setUpType] = useState("image");
  const [upOk, setUpOk] = useState<string | null>(null);
  const [upErr, setUpErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const [result, setResult] = useState<ParsedOutput | null>(null);
  const [resultKind, setResultKind] = useState<ContentKind | "upload" | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformId[]>([
    "tiktok",
    "youtube",
    "snapchat",
  ]);
  const [promptKind, setPromptKind] = useState<ExternalPromptKind>("image");
  const [promptScene, setPromptScene] = useState("");
  const [promptMood, setPromptMood] = useState(
    "cinematic horror-meme, defiant, emotional",
  );
  const [promptAspect, setPromptAspect] = useState("9:16 vertical");
  const [promptExtras, setPromptExtras] = useState("");
  const [promptEmotion, setPromptEmotion] = useState<EmotionState>("auto");
  const [promptCopied, setPromptCopied] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [pathFlash, setPathFlash] = useState(false);
  const [pathHint, setPathHint] = useState(false);
  const [signup, setSignup] = useState<CreatorSignup | null>(null);

  useEffect(() => {
    setSignup(loadLastSignup());
  }, []);

  const stepActive = activeStepIndex(signup);

  function pickPath(next: Path) {
    setPath(next);
    // Clear previous result when switching paths so AI/Upload don't show External packs
    setResult(null);
    setResultKind(null);
    setAiError(null);
    setUpOk(null);
    setUpErr(null);
    if (!next) return;
    setPathFlash(true);
    setPathHint(true);
    window.setTimeout(() => setPathFlash(false), 900);
    window.setTimeout(() => setPathHint(false), 5000);
    // Scroll to the next step after a short beat so the flash is visible
    window.setTimeout(() => {
      const id =
        next === "prompt" ? "studio-create-form" : "studio-next-step";
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 280);
  }

  useEffect(() => {
    const k = loadKeys();
    setKeys(k);
    const first = (Object.keys(PROVIDERS) as ProviderId[]).find((id) => k[id]);
    if (first) setUseProvider(first);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const connected = useMemo(
    () => (Object.keys(PROVIDERS) as ProviderId[]).filter((id) => !!keys[id]),
    [keys],
  );

  const providerNote = PROVIDERS[provider].note;

  const onSaveKey = () => {
    setKeyMsg(null);
    setKeyErr(null);
    const v = apiKey.trim();
    if (!v) {
      setKeyErr("Paste a key first.");
      return;
    }
    const next = { ...keys, [provider]: v };
    saveKeys(next);
    setKeys(next);
    setUseProvider(provider);
    setApiKey("");
    setKeyMsg(`${PROVIDERS[provider].label} key saved on this device only.`);
  };

  const onClearKey = (id: ProviderId) => {
    const next = { ...keys };
    delete next[id];
    saveKeys(next);
    setKeys(next);
    if (useProvider === id) setUseProvider("");
    setKeyMsg(`${PROVIDERS[id].label} key removed.`);
  };

  const showResult = (k: ContentKind | "upload", out: ParsedOutput) => {
    setResult(out);
    setResultKind(k);
  };

  const onGenerate = async () => {
    setAiError(null);
    if (!kind) {
      setAiError("Pick a content type.");
      return;
    }
    if (!topic.trim()) {
      setAiError("Add a topic or idea.");
      return;
    }
    setGenerating(true);
    try {
      const len = length || LENGTHS[kind][0]!;
      const userPrompt = buildUserPrompt(
        kind,
        topic.trim(),
        tone,
        style,
        len,
        notes.trim(),
      );
      let raw: string;
      if (useProvider && keys[useProvider]) {
        raw = await callProvider(useProvider, keys[useProvider]!, userPrompt);
      } else {
        raw = demoGenerate(kind, topic.trim());
      }
      showResult(kind, parseOutput(kind, topic.trim(), raw, platforms));
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const onBuildExternalPrompt = (kind: ExternalPromptKind = promptKind) => {
    const pack = buildExternalPromptPack({
      kind,
      scene: promptScene,
      mood: promptMood,
      aspect: promptAspect,
      extras: promptExtras,
      emotion: promptEmotion,
    });
    showResult("writing", pack);
    window.setTimeout(() => {
      document
        .getElementById("external-prompt-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const onPickPromptKind = (id: ExternalPromptKind) => {
    setPromptKind(id);
    // Instant build so buttons feel wired — DNA is always baked in
    const pack = buildExternalPromptPack({
      kind: id,
      scene: promptScene,
      mood: promptMood,
      aspect: promptAspect,
      extras: promptExtras,
      emotion: promptEmotion,
    });
    showResult("writing", pack);
    window.setTimeout(() => {
      document
        .getElementById("external-prompt-result")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const onCopyPromptOnly = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.body);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const onDemo = () => {
    setAiError(null);
    if (!kind) {
      setAiError("Pick a content type.");
      return;
    }
    const t = topic.trim() || "Astro breaks free under the moon";
    const raw = demoGenerate(kind, t);
    showResult(kind, parseOutput(kind, t, raw, platforms));
  };

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      setUpErr(null);
      setUpOk(null);
      if (!upTitle.trim()) setUpTitle(f.name.replace(/\.[^.]+$/, ""));
      if (f.type.startsWith("image/")) setUpType("image");
      else if (f.type.startsWith("video/")) setUpType("video");
      else if (
        f.type.startsWith("text/") ||
        /\.(txt|md|pdf|doc|docx)$/i.test(f.name)
      )
        setUpType("writing");
      else setUpType("other");

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (f.type.startsWith("image/")) setPreviewUrl(URL.createObjectURL(f));
      else setPreviewUrl(null);
    },
    [previewUrl, upTitle],
  );

  const onSubmitUpload = () => {
    setUpOk(null);
    setUpErr(null);
    if (!file) {
      setUpErr("Choose a file first.");
      return;
    }
    const title = upTitle.trim() || file.name;
    const desc = upDesc.trim();
    saveUpload({
      title,
      desc,
      type: upType,
      name: file.name,
      size: file.size,
      mime: file.type,
      at: new Date().toISOString(),
    });
    setUpOk(
      "Saved for review on this device. In the full platform this goes to the feature queue.",
    );
    showResult("upload", {
      title,
      body: `Manual upload\nFile: ${file.name}\nType: ${upType}\nSize: ${Math.round(file.size / 1024)} KB\n\n${desc || "No description"}\n\nStatus: Submitted for review (prototype — stored in this browser).`,
      caption: desc || "",
      hashtags: generateHashtags({
        topic: title,
        caption: desc,
        kind: "upload",
        platforms,
        max: 12,
      }),
    });
  };

  const onRefreshHashtags = () => {
    if (!result) return;
    const next = generateHashtags({
      topic: result.title,
      caption: result.caption,
      body: result.body,
      kind: resultKind || path || "writing",
      platforms,
      max: 12,
    });
    setResult({ ...result, hashtags: next });
  };

  const onCopyHashtags = async () => {
    if (!result?.hashtags?.length) return;
    try {
      await navigator.clipboard.writeText(formatHashtags(result.hashtags));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const onDownloadFile = () => {
    if (!result) return;
    const text = [
      result.title,
      "",
      result.body,
      "",
      result.caption ? `Caption: ${result.caption}` : "",
      "",
      formatHashtags(result.hashtags),
      "",
      "— Astro Bull Creator Studio · We are all Astro",
    ]
      .filter((l) => l !== undefined)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = (result.title || "astrobull")
      .slice(0, 40)
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "astrobull-content";
    a.href = url;
    a.download = `${safe}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onCopy = async () => {
    if (!result) return;
    const text = `${result.title}\n\n${result.body}\n\n${result.caption || ""}\n${result.hashtags.map((h) => `#${h}`).join(" ")}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-6 flex items-center justify-between border-b border-white/15 pb-5">
        <div>
          <h1 className="font-display text-3xl uppercase text-fg md:text-4xl">
            Astro<span className="animate-flicker">Bull</span>
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
            Create free · Get featured · Get paid
          </p>
        </div>
        <span className="rounded-sm border border-green/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-green">
          Creator Studio $$$
        </span>
      </header>

      {/* === 4-STEP PIPELINE - always visible === */}
      <section
        aria-label="Creator pipeline"
        className="mb-5 rounded-md border border-white/12 bg-surface p-4 sm:p-5"
      >
        <p className="mb-3 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-dim">
          Your path
        </p>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {PIPELINE.map((step, i) => {
            const done = i < stepActive;
            const active = i === stepActive;
            const Icon = step.Icon;
            return (
              <li
                key={step.n}
                className={cn(
                  "relative flex flex-col rounded-md border px-3 py-3 transition-colors",
                  active &&
                    "border-red/55 bg-red/10 shadow-[0_0_20px_rgba(255,0,51,0.15)]",
                  done && !active && "border-green/35 bg-green/5",
                  !done && !active && "border-white/10 bg-bg/60",
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-sm font-mono text-[11px] font-bold",
                      active && "bg-red text-white",
                      done && !active && "bg-green/20 text-green",
                      !done && !active && "bg-white/5 text-muted",
                    )}
                  >
                    {done && !active ? <Check size={14} /> : step.n}
                  </span>
                  <Icon
                    size={14}
                    className={cn(
                      active && "text-red",
                      done && !active && "text-green",
                      !done && !active && "text-muted",
                    )}
                    aria-hidden
                  />
                </div>
                <p
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
                    active ? "text-fg" : done ? "text-green" : "text-muted",
                  )}
                >
                  {step.title}
                </p>
                <p className="mt-1 font-mono text-[9px] leading-snug text-dim sm:text-[10px]">
                  {step.short}
                </p>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 hidden font-mono text-[10px] text-muted sm:block">
          {PIPELINE[stepActive]?.body}
        </p>
      </section>

      {/* === STATUS CARD === */}
      <section
        className={cn(
          "mb-5 rounded-md border p-4 sm:p-5",
          signup ? "border-green/35 bg-green/5" : "border-red/40 bg-red/5",
        )}
      >
        {signup ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-green">
                  You're in the herd
                </p>
                <p className="mt-1 font-display text-xl uppercase text-fg sm:text-2xl">
                  {signup.name || "Creator"}
                </p>
                <p className="mt-1 font-mono text-xs text-muted">
                  Status:{" "}
                  <span
                    className={cn(
                      "font-bold uppercase",
                      signup.status === "approved" && "text-green",
                      signup.status === "pending" && "text-gold",
                      signup.status === "rejected" && "text-red",
                    )}
                  >
                    {statusLabel(signup.status)}
                  </span>
                  {signup.total_earned > 0 ? (
                    <span className="text-muted">
                      {" "}
                      · earned ${signup.total_earned.toFixed(0)}
                    </span>
                  ) : null}
                </p>
              </div>
              <span className="rounded-sm border border-white/15 bg-bg px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-muted">
                Saved on this device
              </span>
            </div>
            <p className="mt-3 font-mono text-xs leading-relaxed text-fg/85">
              {signup.status === "approved"
                ? "You are featured. Keep dropping content and climbing toward the $50 USDC payout."
                : signup.status === "rejected"
                  ? "Needs a rework - drop a stronger clip in TG and we will re-review."
                  : "Next: open the Telegram content chat and drop your first clip. We will move you to Featured when content lands."}
            </p>
            {signup.wallet ? (
              <p className="mt-2 break-all font-mono text-[10px] text-dim">
                Wallet: {signup.wallet}
              </p>
            ) : (
              <p className="mt-2 font-mono text-[10px] text-gold">
                Add a MetaMask / 0x wallet on sign up so payouts can route to you.
              </p>
            )}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={TG_CONTENT_UPLOAD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#2AABEE] px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white no-underline shadow-[0_0_18px_rgba(42,171,238,0.35)] hover:brightness-110"
              >
                <Send size={14} />
                Open TG content chat
                <ExternalLink size={12} className="opacity-80" />
              </a>
              <Link
                to="/signup"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-white/20 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-fg no-underline hover:border-white/40"
              >
                Update profile
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-red">
              Step 1 · not signed up yet
            </p>
            <h2 className="mt-1 font-display text-xl uppercase text-fg sm:text-2xl">
              Sign up free · 30 seconds
            </h2>
            <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
              Join the herd, then drop content in Telegram. Status starts as{" "}
              <span className="text-gold">pending</span>. Holding is optional.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/signup"
                id="creator-signup"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-red px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white no-underline shadow-[0_0_16px_rgba(255,0,51,0.35)] hover:bg-red-hot"
              >
                <UserPlus size={14} />
                Sign up free
              </Link>
              <a
                href={TG_CONTENT_UPLOAD}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-[#2AABEE]/50 bg-[#2AABEE]/10 px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-[#2AABEE] no-underline hover:bg-[#2AABEE]/20"
              >
                <Send size={14} />
                Already posting? Open TG
              </a>
            </div>
          </>
        )}
      </section>

      {/* === PAYOUT RULES - always open === */}
      <section className="mb-5 rounded-md border border-green/30 bg-green/5 p-4 sm:p-5">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-green">
          How you get paid
        </p>
        <ul className="mt-3 space-y-2 font-mono text-xs leading-relaxed text-fg/85">
          <li className="flex gap-2">
            <span className="shrink-0 text-green">▸</span>
            Free to create · holding optional
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-green">▸</span>
            Drop content in the private TG chat (step 2)
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-green">▸</span>
            We feature winners on official socials + Wall of Fame
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-green">▸</span>
            Verified views → climb the board
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-green">▸</span>
            <span>
              <strong className="text-green">$50 USDC threshold</strong> → payout
              (MetaMask / any 0x wallet)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="shrink-0 text-green">▸</span>
            Weekly top creators also share the prize pot
          </li>
        </ul>
        <button
          type="button"
          onClick={() => setWhyOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted hover:text-fg"
          aria-expanded={whyOpen}
        >
          <ChevronDown
            size={14}
            className={cn("transition-transform", whyOpen && "rotate-180")}
          />
          {whyOpen ? "Hide details" : "Why creators join"}
        </button>
        {whyOpen ? (
          <ul className="mt-3 space-y-2 border-t border-green/20 pt-3">
            {SELLING_POINTS.map((point) => (
              <li
                key={point}
                className="flex gap-2 font-mono text-[11px] leading-relaxed text-fg/75"
              >
                <span className="mt-0.5 shrink-0 text-green">▸</span>
                <span>{point}</span>
              </li>
            ))}
            <li className="pt-1 font-mono text-[10px] text-dim">
              Full detail:{" "}
              <a
                href="/astrobull-whitepaper.pdf"
                download
                className="text-green underline-offset-2 hover:underline"
              >
                whitepaper PDF
              </a>
            </li>
          </ul>
        ) : null}
      </section>

      {/* === PRIMARY CTA - TG === */}
      <div className="mb-6">
        <TgContentDrop variant="banner" />
      </div>

      {/* Brand note */}
      <div className="mb-8 overflow-hidden rounded-md border border-green/40 bg-black shadow-[0_0_40px_rgba(0,255,102,0.12)]">
        <img
          src="/astrobull-note.jpg"
          alt="The United States of AstroBull - One Hundred AstroBULLS - Robinhood Chain community token"
          className="block h-auto w-full"
          loading="eager"
        />
        <div className="border-t border-green/25 bg-surface px-4 py-3 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-green sm:text-xl">
            Get paid to create
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:text-xs">
            Today's vision · Tomorrow's legacy · In the herd we trust
          </p>
        </div>
      </div>

      {/* Optional create tools - pipeline CTAs live above */}
      <section className="mb-4 rounded-md border border-line bg-surface p-5 md:p-6">
        <span className="mb-3 inline-block rounded-sm border border-white/15 bg-bg px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
          Optional tools
        </span>
        <h2 className="font-display text-2xl uppercase text-fg md:text-[1.65rem]">
          Need help creating?
        </h2>
        <p className="mt-2 font-body text-sm text-muted">
          Finished files still go to{" "}
          <strong className="text-[#2AABEE]">Telegram only</strong>. AI and
          prompts are optional - original uploads welcome.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => pickPath("ai")}
            className={cn(
              "rounded-md border px-4 py-5 text-left transition-colors",
              path === "ai"
                ? "border-green bg-green/15"
                : "border-white/15 bg-bg hover:border-red/50",
              path === "ai" && pathFlash && "animate-green-flash",
            )}
          >
            <Bot size={20} className="mb-2 text-red" />
            <div className="font-display text-xl uppercase text-fg">Use AI</div>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Grok, Claude, or ChatGPT — your keys, locked character
            </p>
          </button>
          <a
            href={TG_CONTENT_UPLOAD}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[#2AABEE]/45 bg-[#2AABEE]/10 px-4 py-5 text-left no-underline transition-colors hover:border-[#2AABEE]/80 hover:bg-[#2AABEE]/20"
          >
            <Upload size={20} className="mb-2 text-[#2AABEE]" />
            <div className="font-display text-xl uppercase text-fg">
              Upload on Telegram
            </div>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Content only · private group · files stay on TG
            </p>
          </a>
          <button
            type="button"
            onClick={() => pickPath("prompt")}
            className={cn(
              "rounded-md border px-4 py-5 text-left transition-colors",
              path === "prompt"
                ? "border-green bg-green/15"
                : "border-white/15 bg-bg hover:border-gold/50",
              path === "prompt" && pathFlash && "animate-green-flash",
            )}
          >
            <Wand2 size={20} className="mb-2 text-gold" />
            <div className="font-display text-xl uppercase text-fg">
              External prompt
            </div>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-muted">
              Detailed Astro Bull prompt for any AI outside this site
            </p>
          </button>
        </div>

        {pathHint && path ? (
          <p className="animate-scroll-hint mt-4 flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-green">
            <ChevronDown size={16} className="animate-bounce" />
            Selected — scroll down to continue
          </p>
        ) : null}
      </section>

      {path && path !== "prompt" && (
        <section
          id="studio-next-step"
          className="mt-4 scroll-mt-24 rounded-md border border-red/40 bg-red/5 p-5 md:p-6"
        >
          <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red">
            Where do you want to send it?
          </p>
          <p className="mb-4 font-mono text-xs text-muted">
            Tick the platforms you'll push to after create / upload.
          </p>
          <PlatformCheckboxes
            selected={platforms}
            onChange={setPlatforms}
            onPick={() => {
              window.setTimeout(() => {
                document
                  .getElementById("studio-create-form")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 200);
            }}
          />
          <p className="mt-3 font-mono text-[11px] text-green">
            ↓ Then keep scrolling — set up your create / upload below
          </p>
        </section>
      )}

      {path === "ai" && (
        <div id="studio-create-form" className="mt-4 scroll-mt-24 space-y-4">
          <section className="rounded-md border border-line bg-surface p-5 md:p-6">
            <div className="mb-3 flex items-center gap-2">
              <Lock size={14} className="text-gold" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
                API keys · this device only
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {(Object.keys(PROVIDERS) as ProviderId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProvider(id)}
                  className={cn(
                    "rounded-sm border px-3 py-2 font-mono text-[11px] uppercase tracking-wider",
                    provider === id
                      ? "border-red bg-red/15 text-red"
                      : "border-white/15 text-muted hover:border-white/30",
                  )}
                >
                  {PROVIDERS[id].label}
                  {keys[id] ? " · on" : ""}
                </button>
              ))}
            </div>
            <p className="mb-2 font-mono text-[11px] text-muted">{providerNote}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${PROVIDERS[provider].label} API key`}
                className="flex-1 rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none focus:border-red"
              />
              <button
                type="button"
                onClick={onSaveKey}
                className="rounded-sm bg-red px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-white"
              >
                Save key
              </button>
            </div>
            {keyMsg ? (
              <p className="mt-2 font-mono text-xs text-green">{keyMsg}</p>
            ) : null}
            {keyErr ? (
              <p className="mt-2 font-mono text-xs text-red-hot">{keyErr}</p>
            ) : null}
            {connected.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {connected.map((id) => (
                  <li
                    key={id}
                    className="flex items-center justify-between font-mono text-[11px] text-muted"
                  >
                    <span>
                      {PROVIDERS[id].label}: {maskKey(keys[id]!)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onClearKey(id)}
                      className="inline-flex items-center gap-1 text-red hover:underline"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-3 rounded-sm border border-gold/30 bg-gold/5 px-3 py-2 font-mono text-[10px] leading-relaxed text-muted">
              Character lock: {ASTRO_LOOK.slice(0, 120)}…
            </p>
          </section>

          <section className="rounded-md border border-line bg-surface p-5 md:p-6">
            <h2 className="font-display text-2xl uppercase text-fg">
              Generate content
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["image", "Image"],
                  ["video", "Video"],
                  ["writing", "Writing"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setKind(id);
                    setLength(LENGTHS[id][0]!);
                  }}
                  className={cn(
                    "rounded-sm border px-3 py-2 font-mono text-[11px] uppercase tracking-wider",
                    kind === id
                      ? "border-red bg-red/15 text-red"
                      : "border-white/15 text-muted",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {kind ? (
              <div className="mt-4 space-y-3">
                {connected.length > 0 ? (
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-green">
                      Use key
                    </label>
                    <select
                      value={useProvider}
                      onChange={(e) =>
                        setUseProvider(e.target.value as ProviderId | "")
                      }
                      className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-green"
                    >
                      <option value="">Demo (no key)</option>
                      {connected.map((id) => (
                        <option key={id} value={id}>
                          {PROVIDERS[id].label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-green">
                    Topic / idea
                  </label>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Astro with a chainsaw under neon rain"
                    className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-green"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-green">
                      Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-green"
                    >
                      {TONES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-green">
                      Style
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-green"
                    >
                      {STYLES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-green">
                    Length / format
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-green"
                  >
                    {LENGTHS[kind].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-green">
                    Extra notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. mention diamond hands"
                    rows={3}
                    className="w-full resize-y rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-green"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() => void onGenerate()}
                    className="inline-flex items-center gap-2 rounded-sm bg-red px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-white disabled:opacity-55"
                  >
                    <Wand2 size={14} />
                    {generating ? "Generating…" : "Generate with AI"}
                  </button>
                  <button
                    type="button"
                    onClick={onDemo}
                    className="rounded-sm border border-white/15 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-fg"
                  >
                    Try demo (no key)
                  </button>
                </div>
              </div>
            ) : null}
            {aiError ? (
              <p className="mt-3 font-mono text-sm text-red-hot">{aiError}</p>
            ) : null}
          </section>
        </div>
      )}

      {/* Files never upload to the website — Telegram private group only */}
      <div className="mt-4 scroll-mt-24">
        <TgContentDrop variant="banner" className="rounded-md" />
        <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-widest text-dim">
          Site does not store creator files · private TG group only
        </p>
      </div>

      {path === "prompt" && (
        <section
          id="studio-create-form"
          className="mt-4 scroll-mt-24 rounded-md border border-gold/40 bg-gold/5 p-5 md:p-6"
        >
          <span className="mb-3 inline-block rounded-sm bg-gold/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
            Portable · any agent
          </span>
          <h2 className="font-display text-2xl uppercase text-fg">
            Generate Astro Bull prompt
          </h2>
          <p className="mt-2 font-body text-sm text-muted">
            Full <span className="text-gold">Astro DNA</span> is baked into every pack —
            black eye-mask, curved horns, chains, black tail, green feather (black stem),
            pink nose. <span className="text-green">Crying OR cigar — never both.</span>{" "}
            Copy, then open the tool links.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-dim">
            Look lock: {ASTRO_LOOK}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                ["image", "Image AI"],
                ["midjourney", "Midjourney / Flux"],
                ["video", "Video AI"],
                ["system", "System prompt"],
                ["writing", "Writing LLM"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => onPickPromptKind(id)}
                className={cn(
                  "rounded-sm border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors",
                  promptKind === id
                    ? "animate-green-flash border-green bg-green/15 text-green"
                    : "border-white/15 text-muted hover:border-gold/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[11px] text-green">
            Tap a type → DNA prompt builds instantly · scroll down to copy
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-gold">
                Scene / idea
              </label>
              <textarea
                value={promptScene}
                onChange={(e) => setPromptScene(e.target.value)}
                placeholder="e.g. Astro under the full moon holding a glowing green feather, chains still on, neon Robinhood sky"
                rows={3}
                className="w-full resize-y rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-gold"
              />
            </div>

            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-gold">
                Emotion · tears or cigar
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["auto", "Auto"],
                    ["crying", "Crying (blue tears)"],
                    ["smoking", "Smoking (cigar)"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPromptEmotion(id)}
                    className={cn(
                      "rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-wider",
                      promptEmotion === id
                        ? "border-green bg-green/15 text-green"
                        : "border-white/15 text-muted",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-muted">
                Now:{" "}
                <span className="text-green">
                  {resolveEmotion(
                    promptEmotion,
                    promptScene,
                    promptMood,
                    promptExtras,
                  )}
                </span>
                {" · "}
                Auto uses scene words (dream/tear → cry · smoke/hype → cigar)
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-gold">
                  Mood
                </label>
                <input
                  value={promptMood}
                  onChange={(e) => setPromptMood(e.target.value)}
                  className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-gold">
                  Aspect / format
                </label>
                <select
                  value={promptAspect}
                  onChange={(e) => setPromptAspect(e.target.value)}
                  className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-gold"
                >
                  <option>9:16 vertical</option>
                  <option>1:1 square</option>
                  <option>16:9 widescreen</option>
                  <option>4:5 feed</option>
                  <option>storyboard / multi-panel</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-gold">
                Extra direction (optional)
              </label>
              <input
                value={promptExtras}
                onChange={(e) => setPromptExtras(e.target.value)}
                placeholder="e.g. more scars, rain, bill-note formal coat, no text in image"
                className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-body text-fg outline-none focus:border-gold"
              />
            </div>
            <button
              type="button"
              onClick={() => onBuildExternalPrompt()}
              className="inline-flex items-center gap-2 rounded-sm bg-red px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(255,0,51,0.3)]"
            >
              <Wand2 size={14} />
              Build locked prompt
            </button>
            <p className="font-mono text-[10px] leading-relaxed text-muted">
              Output includes master prompt, negative prompt, full DNA, copy button, and
              links to paste tools.
            </p>
          </div>
        </section>
      )}

      {result && resultKind && path ? (
        <section
          id="external-prompt-result"
          className="mt-4 scroll-mt-24 rounded-md border border-line bg-surface p-5 md:p-6"
        >
          <h2 className="font-display text-2xl uppercase text-fg">
            {result.title}
          </h2>
          <p className="mt-1 font-body text-sm text-muted">
            {path === "prompt"
              ? "DNA locked. Copy the pack, then open a tool below."
              : resultKind === "image"
                ? "Use MASTER PROMPT with any image tool. Character locked."
                : resultKind === "video"
                  ? "Shoot/animate SCENE beats. Character locked."
                  : resultKind === "upload"
                    ? "Saved locally for review. Same feature path as AI content."
                    : "Ready to post / paste into an external agent."}
          </p>

          {path === "prompt" ? (
            <div className="mt-4 rounded-sm border border-gold/35 bg-gold/5 p-3">
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                Open tool · then paste
              </p>
              <div className="flex flex-wrap gap-2">
                {EXTERNAL_TOOLS[promptKind].map((t) => (
                  <a
                    key={t.href + t.label}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-sm border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-fg no-underline hover:border-green hover:text-green"
                  >
                    {t.label}
                  </a>
                ))}
              </div>
              <p className="mt-2 font-mono text-[10px] text-muted">
                {EXTERNAL_TOOLS[promptKind].map((t) => t.tip).join(" · ")}
              </p>
            </div>
          ) : null}

          <pre className="mt-4 max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-sm border border-white/15 bg-bg/65 p-4 font-body text-sm leading-relaxed text-fg/90">
            {result.body}
          </pre>
          {result.caption ? (
            <p className="mt-3 font-body text-sm text-muted">
              Caption: {result.caption}
            </p>
          ) : null}
          <div className="mt-4 rounded-sm border border-green/30 bg-green/5 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-green">
                Auto hashtags
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onRefreshHashtags}
                  className="rounded-sm border border-green/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-green hover:bg-green/10"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => void onCopyHashtags()}
                  className="rounded-sm border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-fg hover:border-white/30"
                >
                  Copy tags
                </button>
              </div>
            </div>
            <p className="font-mono text-xs leading-relaxed text-green/90">
              {formatHashtags(result.hashtags)}
            </p>
            <p className="mt-2 font-mono text-[10px] text-muted">
              Built from brand core + your topic + platforms ticked. Ready for TikTok /
              YouTube / Snapchat.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onCopy()}
              className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-fg"
            >
              <Copy size={14} />
              {copied ? "Copied" : "Copy all"}
            </button>
            {path === "prompt" ? (
              <button
                type="button"
                onClick={() => void onCopyPromptOnly()}
                className="inline-flex items-center gap-2 rounded-sm bg-red px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(255,0,51,0.3)]"
              >
                <Copy size={14} />
                {promptCopied ? "Prompt copied ✓" : "Copy prompt pack"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onDownloadFile}
              className="inline-flex items-center gap-2 rounded-sm border border-green/40 px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-green hover:bg-green/10"
            >
              <Download size={14} />
              Download file
            </button>
          </div>
          {path !== "prompt" ? (
            <PlatformPush
              result={result}
              selected={platforms}
              onSelectedChange={setPlatforms}
            />
          ) : null}
        </section>
      ) : null}


      <p className="mt-10 text-center font-mono text-[11px] text-muted">
        1 Sign up · 2 Drop in TG · 3 Get featured · 4 Get paid · Holding optional
        · We are all Astro
      </p>
    </div>
  );
}
