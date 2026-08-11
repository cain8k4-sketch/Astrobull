import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Flame,
  Megaphone,
  RefreshCw,
  Sparkles,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import {
  applyAltHook,
  buildShillPack,
  BLUE_TICK_RULE,
  CAMPAIGN_META,
  campaignLabel,
  CONTRACT,
  attachWalletToShiller,
  loadShillBoard,
  PAYOUT_USD,
  PRIZE_PERIOD,
  PRIZE_POOL_USD,
  PLATFORM_LABEL,
  POWER_WORDS,
  prizeForRank,
  recordShill,
  setShillerBlueTick,
  STYLE_META,
  styleLabel,
  TOP3_PRIZES_USD,
  top3Eligible,
  type ShillCampaign,
  type ShillEntry,
  type ShillPack,
  type ShillPlatform,
  type ShillStyle,
  xIntentUrl,
} from "@/lib/shiller-engine";
import {
  METAMASK_DOWNLOAD,
  connectWallet,
  hasInjectedWallet,
  isValidEthAddress,
  loadWallet,
  saveWallet,
  shortAddr,
} from "@/lib/wallet";
import { cn } from "@/lib/utils";

const PLATFORMS: ShillPlatform[] = [
  "tiktok",
  "youtube",
  "instagram",
  "snapchat",
  "telegram",
  "x",
];

export default function ShillTool() {
  const [platform, setPlatform] = useState<ShillPlatform>("tiktok");
  const [campaign, setCampaign] = useState<ShillCampaign>("creator_economy");
  const [style, setStyle] = useState<ShillStyle>("punchy");
  const [handle, setHandle] = useState("");
  const [vibe, setVibe] = useState("");
  const [mention, setMention] = useState("");
  const [pack, setPack] = useState<ShillPack | null>(null);
  const [board, setBoard] = useState<ShillEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [wallet, setWallet] = useState("");
  const [walletBusy, setWalletBusy] = useState(false);
  const [walletErr, setWalletErr] = useState<string | null>(null);
  const [manualWallet, setManualWallet] = useState("");
  const [hasInjected, setHasInjected] = useState(false);
  const [xBlueTick, setXBlueTick] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [genCount, setGenCount] = useState(0);

  useEffect(() => {
    setBoard(loadShillBoard());
    setWallet(loadWallet());
    setHasInjected(hasInjectedWallet());
    setPack(
      buildShillPack({
        platform: "tiktok",
        campaign: "creator_economy",
        style: "punchy",
      }),
    );
  }, []);

  const top3 = useMemo(() => top3Eligible(board), [board]);
  const charLimit =
    platform === "x" ? 280 : platform === "snapchat" ? 800 : null;
  const overLimit =
    pack && charLimit ? pack.fullPost.length > charLimit : false;

  function generate(next?: {
    platform?: ShillPlatform;
    campaign?: ShillCampaign;
    style?: ShillStyle;
  }) {
    const p = next?.platform ?? platform;
    const c = next?.campaign ?? campaign;
    const s = next?.style ?? style;
    const salt =
      (Date.now() ^ Math.floor(Math.random() * 1e9)) | 0;
    const built = buildShillPack({
      platform: p,
      campaign: c,
      style: s,
      vibe,
      mention,
      salt,
    });
    setPack(built);
    setCopied(false);
    setStatus(null);
    setGenCount((n) => n + 1);
  }

  function onPickPlatform(p: ShillPlatform) {
    setPlatform(p);
    generate({ platform: p });
  }

  function onPickCampaign(c: ShillCampaign) {
    setCampaign(c);
    generate({ campaign: c });
  }

  function onPickStyle(s: ShillStyle) {
    setStyle(s);
    generate({ style: s });
  }

  function togglePowerWord(word: string) {
    setVibe((prev) => {
      const has = prev.toLowerCase().includes(word.toLowerCase());
      if (has) {
        return prev
          .split(/[·,]/)
          .map((x) => x.trim())
          .filter((x) => x && x.toLowerCase() !== word.toLowerCase())
          .join(" · ");
      }
      return prev.trim() ? `${prev.trim()} · ${word}` : word;
    });
  }

  function useAltHook(h: string) {
    if (!pack) return;
    setPack(applyAltHook(pack, h));
    setCopied(false);
  }

  async function onConnectWallet() {
    setWalletErr(null);
    setWalletBusy(true);
    try {
      const addr = await connectWallet();
      setWallet(addr);
      setHasInjected(true);
      if (handle.trim()) setBoard(attachWalletToShiller(handle, addr));
      setStatus(`Wallet linked: ${shortAddr(addr)}`);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Connect failed";
      setWalletErr(
        m === "NO_WALLET"
          ? "No wallet in this browser. Install MetaMask for Robinhood Chain."
          : m,
      );
    } finally {
      setWalletBusy(false);
    }
  }

  function onSaveManualWallet() {
    setWalletErr(null);
    const a = manualWallet.trim();
    if (!isValidEthAddress(a)) {
      setWalletErr("Enter a valid 0x… address (42 chars).");
      return;
    }
    saveWallet(a);
    setWallet(a);
    setManualWallet("");
    if (handle.trim()) setBoard(attachWalletToShiller(handle, a));
    setStatus(`Wallet saved: ${shortAddr(a)}`);
  }

  function onBlueTickToggle(next: boolean) {
    setXBlueTick(next);
    if (handle.trim()) setBoard(setShillerBlueTick(handle, next));
  }

  async function copyPack() {
    if (!pack) return;
    try {
      await navigator.clipboard.writeText(pack.fullPost);
      setCopied(true);
      const next = recordShill({
        handle: handle || "anon",
        displayName: handle || "Anon",
        platform,
        wallet: wallet || undefined,
        xBlueTick,
      });
      setBoard(next);
      setStatus(
        `Copied · +points as @${(handle || "anon").replace(/^@/, "")} · ${
          xBlueTick ? "full weekly prize if top 3" : "50% weekly if top 3 (no tick)"
        }`,
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("Copy failed — select the text manually");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 md:px-14 md:py-14">
      <div className="mb-2 flex items-center gap-3">
        <Megaphone size={14} className="text-red" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
          Shill studio · weekly prizes
        </span>
      </div>
      <h1
        className="font-display uppercase leading-none text-fg"
        style={{ fontSize: "clamp(2.4rem, 9vw, 4.2rem)" }}
      >
        Write packs
        <span className="animate-flicker"> that hit</span>
      </h1>
      <p className="mt-3 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
        Pick platform + angle + voice. Hit{" "}
        <span className="text-fg">regenerate</span> until it slaps. Copy,
        post, climb the board. Weekly top 3 share up to{" "}
        <span className="text-green">${PRIZE_POOL_USD}</span> USDC
        {xBlueTick ? " (full with blue tick)" : " (half without blue tick)"}.
      </p>

      <div className="mt-8 space-y-5">
        <section>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
            1 · Where are you posting?
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPickPlatform(p)}
                className={cn(
                  "min-h-11 rounded-sm border px-2 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors",
                  platform === p
                    ? "border-red bg-red text-white shadow-[0_0_16px_rgba(255,0,51,0.35)]"
                    : "border-white/15 bg-surface text-muted hover:border-white/40 hover:text-fg",
                )}
              >
                {PLATFORM_LABEL(p)}
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
            2 · What are you pushing?
          </p>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_META.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.blurb}
                onClick={() => onPickCampaign(c.id)}
                className={cn(
                  "min-h-10 rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors",
                  campaign === c.id
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-white/12 bg-bg text-muted hover:border-white/35 hover:text-fg",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] text-dim">
            {CAMPAIGN_META.find((c) => c.id === campaign)?.blurb}
          </p>
        </section>

        <section>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
            3 · Voice
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STYLE_META.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onPickStyle(s.id)}
                className={cn(
                  "min-h-12 rounded-sm border px-3 py-2 text-left transition-colors",
                  style === s.id
                    ? "border-green bg-green/10"
                    : "border-white/12 bg-surface hover:border-white/30",
                )}
              >
                <span
                  className={cn(
                    "block font-mono text-[11px] font-bold uppercase tracking-wider",
                    style === s.id ? "text-green" : "text-fg",
                  )}
                >
                  {s.label}
                </span>
                <span className="mt-0.5 block font-mono text-[9px] text-dim">
                  {s.blurb}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-white/10 bg-surface p-4 sm:p-5">
          <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
            4 · Spice (optional)
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-dim">
                Your handle
              </label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourhandle"
                className="w-full rounded-sm border border-white/15 bg-bg px-3 py-2.5 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-dim">
                Big-up someone
              </label>
              <input
                value={mention}
                onChange={(e) => setMention(e.target.value)}
                placeholder="@creator"
                className="w-full rounded-sm border border-white/15 bg-bg px-3 py-2.5 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-dim">
              Extra line / vibe
            </label>
            <input
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g. just burned more · new feature dropping"
              className="w-full rounded-sm border border-white/15 bg-bg px-3 py-2.5 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
            />
          </div>
          <div className="mt-3">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-dim">
              <Zap size={11} className="text-gold" />
              Tap power words
            </p>
            <div className="flex flex-wrap gap-1.5">
              {POWER_WORDS.map((w) => {
                const on = vibe.toLowerCase().includes(w.toLowerCase());
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => togglePowerWord(w)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide transition-colors",
                      on
                        ? "border-gold bg-gold/20 text-gold"
                        : "border-white/10 text-muted hover:border-white/30 hover:text-fg",
                    )}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-sm border border-sky-500/25 bg-sky-500/5 px-3 py-3">
            <input
              type="checkbox"
              checked={xBlueTick}
              onChange={(e) => onBlueTickToggle(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-sky-400"
            />
            <span className="font-mono text-[11px] leading-relaxed text-muted">
              <span className="inline-flex items-center gap-1 font-bold text-sky-300">
                <BadgeCheck size={14} /> X blue tick
              </span>{" "}
              — full weekly prize if top 3. Off = half.
            </span>
          </label>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => generate()}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-sm bg-red px-6 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,0,51,0.4)] hover:bg-red-hot"
          >
            <RefreshCw size={15} />
            {genCount > 0 || pack ? "Regenerate pack" : "Generate pack"}
          </button>
          <button
            type="button"
            onClick={() => {
              const randomStyle =
                STYLE_META[Math.floor(Math.random() * STYLE_META.length)]!.id;
              setCampaign("all");
              setStyle(randomStyle);
              generate({ campaign: "all", style: randomStyle });
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-gold/40 px-5 font-mono text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10"
          >
            <Sparkles size={15} />
            Surprise me
          </button>
        </div>
      </div>

      {pack ? (
        <div className="mt-6 overflow-hidden rounded-md border border-red/35 bg-bg shadow-[0_0_40px_rgba(255,0,51,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-surface/80 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-sm bg-red/15 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-red">
                <Flame size={11} />
                {PLATFORM_LABEL(pack.platform)}
              </span>
              <span className="rounded-sm border border-gold/30 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-gold">
                {campaignLabel(pack.campaign)}
              </span>
              <span className="rounded-sm border border-green/30 px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-green">
                {styleLabel(pack.style)}
              </span>
            </div>
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums",
                overLimit ? "text-red" : "text-dim",
              )}
            >
              {pack.fullPost.length}
              {charLimit ? ` / ${charLimit}` : ""} chars
            </span>
          </div>

          {pack.platform === "youtube" ? (
            <div className="border-b border-white/5 px-4 pt-4">
              <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
                Title
              </p>
              <p className="mt-1 font-display text-xl uppercase leading-tight text-fg sm:text-2xl">
                {pack.title}
              </p>
            </div>
          ) : null}

          <pre className="max-h-[min(55vh,420px)] overflow-y-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-[13px] leading-relaxed text-fg/95 sm:text-sm">
            {pack.fullPost}
          </pre>

          {pack.alts.length > 0 ? (
            <div className="border-t border-white/5 px-4 py-3">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-dim">
                Swap opening hook
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pack.alts.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => useAltHook(h)}
                    className="max-w-full truncate rounded-sm border border-white/12 bg-surface px-2.5 py-1.5 text-left font-mono text-[10px] text-muted hover:border-red/50 hover:text-fg"
                    title={h}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 border-t border-white/10 bg-surface/50 p-4 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={copyPack}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-green px-4 font-mono text-[11px] font-bold uppercase tracking-widest text-bg hover:brightness-110"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied · scored" : "Copy + score board"}
            </button>
            <button
              type="button"
              onClick={() => generate()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-white/20 px-4 font-mono text-[11px] font-bold uppercase tracking-widest text-fg hover:border-fg"
            >
              <RefreshCw size={14} />
              Another
            </button>
            {pack.platform === "x" ? (
              <a
                href={xIntentUrl(pack.fullPost)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setBoard(
                    recordShill({
                      handle: handle || "anon",
                      displayName: handle || "Anon",
                      platform: "x",
                      wallet: wallet || undefined,
                      xBlueTick,
                    }),
                  );
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-white/20 px-4 font-mono text-[11px] font-bold uppercase tracking-widest text-fg no-underline hover:border-fg"
              >
                <ExternalLink size={14} />
                Open on X
              </a>
            ) : null}
          </div>
          {status ? (
            <p className="border-t border-white/5 px-4 py-2 font-mono text-[11px] text-green">
              {status}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-10 space-y-3">
        <button
          type="button"
          onClick={() => setShowPrizes((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border border-white/10 bg-surface px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-gold">
            <Trophy size={14} />
            Weekly prizes · wallet · blue tick
          </span>
          {showPrizes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showPrizes ? (
          <div className="space-y-4 rounded-md border border-white/10 bg-surface p-4 sm:p-5">
            <p className="font-mono text-[11px] leading-relaxed text-muted">
              <span className="font-bold uppercase tracking-wider text-sky-300">
                {PRIZE_PERIOD} ·{" "}
              </span>
              {BLUE_TICK_RULE} Top 3 base: ${TOP3_PRIZES_USD.join(" / $")}. Not
              daily. Creator content still uses ${PAYOUT_USD} verified threshold.
            </p>

            <ul className="divide-y divide-white/5 overflow-hidden rounded-sm border border-gold/25">
              {top3.map(
                ({ rank, entry, prizeUsd, fullPrizeUsd, blueTick, ready }) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-display text-base uppercase text-fg">
                        #{rank} {entry.displayName}
                        {blueTick ? (
                          <BadgeCheck size={14} className="text-sky-400" />
                        ) : null}
                      </p>
                      <p className="truncate font-mono text-[10px] text-muted">
                        {entry.points} pts
                        {entry.wallet
                          ? ` · ${shortAddr(entry.wallet)}`
                          : " · no wallet"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-gold">
                        ${prizeUsd}
                      </p>
                      {!blueTick && fullPrizeUsd !== prizeUsd ? (
                        <p className="font-mono text-[9px] text-dim line-through">
                          ${fullPrizeUsd}
                        </p>
                      ) : null}
                      <p
                        className={cn(
                          "font-mono text-[9px] uppercase",
                          ready ? "text-green" : "text-dim",
                        )}
                      >
                        {ready ? "Ready" : "Need wallet"}
                      </p>
                    </div>
                  </li>
                ),
              )}
            </ul>

            <div className="rounded-sm border border-green/30 bg-green/5 p-3">
              <div className="mb-1 flex items-center gap-2">
                <Wallet size={13} className="text-green" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-green">
                  Payout wallet · Robinhood Chain
                </p>
              </div>
              {wallet ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-sm border border-green/40 bg-bg px-3 py-2 font-mono text-xs text-green">
                    {shortAddr(wallet)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (!handle.trim()) {
                        setWalletErr("Add your handle above first.");
                        return;
                      }
                      setBoard(attachWalletToShiller(handle, wallet));
                      setStatus(
                        `Wallet linked to @${handle.replace(/^@/, "")}`,
                      );
                    }}
                    className="rounded-sm border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-fg"
                  >
                    Link to handle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      saveWallet("");
                      setWallet("");
                    }}
                    className="font-mono text-[10px] uppercase tracking-widest text-dim hover:text-red"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={walletBusy}
                    onClick={onConnectWallet}
                    className="rounded-sm bg-green px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg disabled:opacity-50"
                  >
                    {walletBusy ? "Connecting…" : "Connect MetaMask"}
                  </button>
                  {!hasInjected ? (
                    <a
                      href={METAMASK_DOWNLOAD}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-sm border border-white/20 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-fg no-underline"
                    >
                      Get MetaMask
                    </a>
                  ) : null}
                </div>
              )}
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  value={manualWallet}
                  onChange={(e) => setManualWallet(e.target.value)}
                  placeholder="Or paste 0x… address"
                  className="min-w-0 flex-1 rounded-sm border border-white/15 bg-bg px-3 py-2 font-mono text-xs text-fg outline-none placeholder:text-dim focus:border-green"
                />
                <button
                  type="button"
                  onClick={onSaveManualWallet}
                  className="rounded-sm border border-green/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-green"
                >
                  Save
                </button>
              </div>
              {walletErr ? (
                <p className="mt-2 font-mono text-[11px] text-red">{walletErr}</p>
              ) : null}
            </div>
            <p className="font-mono text-[10px] text-dim">
              Contract{" "}
              <span className="break-all text-fg/70">{CONTRACT}</span>
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setShowBoard((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border border-white/10 bg-surface px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-fg">
            <Trophy size={14} className="text-gold" />
            Full shill board
          </span>
          {showBoard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showBoard ? (
          <div
            id="shill-board"
            className="scroll-mt-24 overflow-hidden rounded-md border border-white/10 bg-surface"
          >
            <p className="border-b border-white/5 px-4 py-2 font-mono text-[10px] text-dim">
              Separate from creator leaderboard. Points = packs you copy. Settled{" "}
              <span className="text-fg">weekly</span>.
            </p>
            <ul className="divide-y divide-white/5">
              {board.map((row, i) => {
                const rank = i + 1;
                const full =
                  rank <= TOP3_PRIZES_USD.length
                    ? prizeForRank(rank, { xBlueTick: true })
                    : 0;
                const prize =
                  rank <= TOP3_PRIZES_USD.length
                    ? prizeForRank(rank, {
                        xBlueTick: row.xBlueTick === true,
                      })
                    : 0;
                return (
                  <li
                    key={row.id}
                    className={cn(
                      "grid grid-cols-[2.5rem_1fr_auto] items-center gap-2 px-3 py-3 sm:grid-cols-[2.5rem_1fr_4rem_5rem_5.5rem] sm:px-4",
                      i < 3 &&
                        "bg-gradient-to-r from-gold/10 via-transparent to-transparent",
                    )}
                  >
                    <span className="font-mono text-[11px] font-bold text-dim">
                      {String(rank).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate font-display text-lg uppercase text-fg">
                        {row.displayName}
                        {row.xBlueTick ? (
                          <BadgeCheck
                            size={14}
                            className="shrink-0 text-sky-400"
                          />
                        ) : null}
                      </p>
                      <p className="truncate font-mono text-[11px] text-muted">
                        {row.handle}
                        {row.wallet ? ` · ${shortAddr(row.wallet)}` : ""}
                      </p>
                    </div>
                    <span className="hidden font-mono text-xs text-muted sm:inline">
                      {row.posts}
                    </span>
                    <span className="font-mono text-xs font-bold text-green">
                      {row.points}
                    </span>
                    <span className="hidden font-mono text-xs text-gold sm:inline">
                      {prize ? (
                        <>
                          ${prize}
                          {full !== prize ? (
                            <span className="ml-1 text-dim line-through">
                              ${full}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        "—"
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
