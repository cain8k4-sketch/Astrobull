import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  Megaphone,
  RefreshCw,
  Trophy,
  Wallet,
} from "lucide-react";
import {
  buildShillPack,
  BLUE_TICK_RULE,
  CAMPAIGN_META,
  campaignLabel,
  CONTRACT,
  attachWalletToShiller,
  loadShillBoard,
  PAYOUT_USD,
  PRIZE_POOL_USD,
  PLATFORM_LABEL,
  prizeForRank,
  recordShill,
  setShillerBlueTick,
  TOP3_PRIZES_USD,
  top3Eligible,
  type ShillCampaign,
  type ShillEntry,
  type ShillPack,
  type ShillPlatform,
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
  "snapchat",
  "telegram",
  "instagram",
  "x",
];

const PILLARS = [
  "Create free · get featured · get paid · holding optional",
  `$${PAYOUT_USD} verified-view threshold · USDC / USDT`,
  `Shill top 3: $${TOP3_PRIZES_USD.join(" / $")} full · 50% if no X blue tick`,
  "Herd amplify on shared TT / YT / Snap / TG accounts",
  "10-second clip can stay on the platform forever",
  "Buy only Uniswap / bow.fun · MetaMask · Robinhood Chain",
  "Connect RH wallet to claim top-3 USD (USDC) prizes",
  "Shill board ≠ creator leaderboard",
];

export default function ShillTool() {
  const [platform, setPlatform] = useState<ShillPlatform>("tiktok");
  const [campaign, setCampaign] = useState<ShillCampaign>("all");
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

  useEffect(() => {
    setBoard(loadShillBoard());
    setWallet(loadWallet());
    setHasInjected(hasInjectedWallet());
  }, []);

  const top3 = top3Eligible(board);

  function generate() {
    const next = buildShillPack({ platform, campaign, vibe, mention });
    setPack(next);
    setCopied(false);
    setStatus(null);
  }

  async function onConnectWallet() {
    setWalletErr(null);
    setWalletBusy(true);
    try {
      const addr = await connectWallet();
      setWallet(addr);
      setHasInjected(true);
      if (handle.trim()) {
        setBoard(attachWalletToShiller(handle, addr));
      }
      setStatus(
        `Robinhood Chain wallet linked: ${shortAddr(addr)}. Top 3 can get USD (USDC) payouts.`,
      );
    } catch (e) {
      const m = e instanceof Error ? e.message : "Connect failed";
      setWalletErr(
        m === "NO_WALLET"
          ? "No wallet in this browser. Install MetaMask (EVM) for Robinhood Chain."
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
    if (handle.trim()) {
      setBoard(attachWalletToShiller(handle, a));
    }
    setStatus(`Wallet saved: ${shortAddr(a)}`);
  }

  function linkWalletToHandle() {
    if (!wallet || !handle.trim()) {
      setWalletErr("Add your handle and connect a wallet first.");
      return;
    }
    setBoard(attachWalletToShiller(handle, wallet));
    setStatus(`Wallet ${shortAddr(wallet)} linked to @${handle.replace(/^@/, "")}`);
  }

  function onBlueTickToggle(next: boolean) {
    setXBlueTick(next);
    if (handle.trim()) {
      setBoard(setShillerBlueTick(handle, next));
    }
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
      const halfNote = xBlueTick
        ? "full prize if top 3 (blue tick)"
        : "50% prize if top 3 (no blue tick)";
      setStatus(
        `Copied · +points as @${(handle || "anon").replace(/^@/, "")} · ${halfNote}`,
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatus("Copy failed — select the text manually");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8 md:px-14 md:py-16">
      <div className="mb-3 flex items-center gap-3">
        <Megaphone size={14} className="text-red" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
          Shill engine · full brief
        </span>
      </div>

      <h1
        className="font-display uppercase leading-none text-fg"
        style={{ fontSize: "clamp(2.6rem, 10vw, 4.5rem)" }}
      >
        Push the
        <span className="animate-flicker"> herd</span>
      </h1>
      <p className="mt-4 max-w-xl font-mono text-xs leading-relaxed text-muted sm:text-sm">
        Generate packs, climb the board, connect a{" "}
        <span className="text-fg">Robinhood Chain</span> wallet.{" "}
        <span className="text-gold">Top 3</span> share up to{" "}
        <span className="text-green">${PRIZE_POOL_USD} USD</span> —{" "}
        <span className="text-fg">full only with X blue tick</span>. No tick =
        half.
      </p>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <li
            key={p}
            className="rounded-sm border border-white/10 bg-surface px-3 py-2 font-mono text-[10px] leading-snug text-muted"
          >
            <span className="mr-1.5 text-red">▸</span>
            {p}
          </li>
        ))}
      </ul>

      {/* Blue tick rule banner */}
      <div className="mt-6 flex gap-3 rounded-md border border-sky-500/40 bg-sky-500/10 px-4 py-3">
        <BadgeCheck size={18} className="mt-0.5 shrink-0 text-sky-400" />
        <p className="font-mono text-[11px] leading-relaxed text-muted">
          <span className="font-bold text-sky-300">Prize rule · </span>
          {BLUE_TICK_RULE} Example rank #1:{" "}
          <span className="text-fg">${prizeForRank(1, { xBlueTick: true })}</span>{" "}
          with tick ·{" "}
          <span className="text-gold">
            ${prizeForRank(1, { xBlueTick: false })}
          </span>{" "}
          without.
        </p>
      </div>

      {/* Wallet for RH payouts */}
      <div className="mt-8 rounded-md border border-green/35 bg-green/5 p-4 sm:p-5">
        <div className="mb-1 flex items-center gap-2">
          <Wallet size={14} className="text-green" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-green">
            Shill payout wallet · Robinhood Chain
          </p>
        </div>
        <p className="font-mono text-[11px] leading-relaxed text-muted">
          MetaMask (or any EVM) on chain ID 4663. Top 3 base:{" "}
          <span className="text-gold">
            ${TOP3_PRIZES_USD[0]} / ${TOP3_PRIZES_USD[1]} / ${TOP3_PRIZES_USD[2]}
          </span>{" "}
          USDC — cut in half without X blue tick. Holding $ASTROBULL is optional.
        </p>
        {wallet ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-green/40 bg-bg px-3 py-2 font-mono text-xs text-green">
              {shortAddr(wallet)}
            </span>
            <button
              type="button"
              onClick={linkWalletToHandle}
              className="rounded-sm border border-white/20 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-fg hover:border-fg"
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
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={manualWallet}
            onChange={(e) => setManualWallet(e.target.value)}
            placeholder="Or paste 0x… payout address"
            className="min-w-0 flex-1 rounded-sm border border-white/15 bg-bg px-3 py-2 font-mono text-xs text-fg outline-none placeholder:text-dim focus:border-green"
          />
          <button
            type="button"
            onClick={onSaveManualWallet}
            className="rounded-sm border border-green/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-green"
          >
            Save address
          </button>
        </div>
        {walletErr ? (
          <p className="mt-2 font-mono text-[11px] text-red">{walletErr}</p>
        ) : null}
      </div>

      {/* Top 3 prize strip */}
      <div className="mt-6 overflow-hidden rounded-md border border-gold/30 bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-gold">
            Top 3 · up to ${PRIZE_POOL_USD} · −50% no blue tick
          </p>
          <Trophy size={14} className="text-gold" />
        </div>
        <ul className="divide-y divide-white/5">
          {top3.map(({ rank, entry, prizeUsd, fullPrizeUsd, blueTick, ready }) => (
            <li
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-display text-lg uppercase text-fg">
                  #{rank} {entry.displayName}
                  {blueTick ? (
                    <BadgeCheck size={16} className="text-sky-400" aria-label="Blue tick" />
                  ) : null}
                </p>
                <p className="truncate font-mono text-[11px] text-muted">
                  {entry.handle} · {entry.points} pts
                  {entry.wallet ? ` · ${shortAddr(entry.wallet)}` : " · no wallet"}
                  {blueTick ? " · blue ✓" : " · no tick (−50%)"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold text-gold">${prizeUsd}</p>
                {!blueTick && fullPrizeUsd !== prizeUsd ? (
                  <p className="font-mono text-[9px] text-dim line-through">
                    ${fullPrizeUsd}
                  </p>
                ) : null}
                <p
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-wider",
                    ready ? "text-green" : "text-dim",
                  )}
                >
                  {ready ? "Payout ready" : "Need wallet"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 space-y-5 rounded-md border border-white/10 bg-surface p-4 sm:p-6">
        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Campaign
          </label>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_META.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.blurb}
                onClick={() => setCampaign(c.id)}
                className={cn(
                  "rounded-sm border px-2.5 py-2 font-mono text-[9px] uppercase tracking-wider transition-colors sm:text-[10px]",
                  campaign === c.id
                    ? "border-gold bg-gold/15 text-gold"
                    : "border-white/15 text-muted hover:border-white/40 hover:text-fg",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Your handle (shill board + prizes)
          </label>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="@yourhandle"
            className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
          />
        </div>

        {/* Blue tick checkbox */}
        <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-sky-500/30 bg-sky-500/5 px-3 py-3">
          <input
            type="checkbox"
            checked={xBlueTick}
            onChange={(e) => onBlueTickToggle(e.target.checked)}
            className="mt-1 h-4 w-4 accent-sky-400"
          />
          <span className="font-mono text-[11px] leading-relaxed text-muted">
            <span className="inline-flex items-center gap-1 font-bold text-sky-300">
              <BadgeCheck size={14} /> My X account has a blue tick
            </span>
            <br />
            Unchecked ={" "}
            <span className="text-gold">50% less</span> on top-3 USDC prizes.
            Claim honestly — admin can verify before payout.
          </span>
        </label>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Platform
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={cn(
                  "rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors",
                  platform === p
                    ? "border-red bg-red/20 text-red"
                    : "border-white/15 text-muted hover:border-white/40 hover:text-fg",
                )}
              >
                {PLATFORM_LABEL(p)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Extra vibe (optional)
          </label>
          <input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="e.g. burn update, featured creator"
            className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-dim">
            Big-up a creator (optional)
          </label>
          <input
            value={mention}
            onChange={(e) => setMention(e.target.value)}
            placeholder="@creator"
            className="w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none placeholder:text-dim focus:border-red"
          />
        </div>

        <button
          type="button"
          onClick={generate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-red py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-[0_0_18px_rgba(255,0,51,0.35)] hover:bg-red-hot sm:w-auto sm:px-8"
        >
          <RefreshCw size={14} />
          Generate shill pack
        </button>
      </div>

      {pack ? (
        <div className="mt-6 rounded-md border border-red/30 bg-bg p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-red">
              {PLATFORM_LABEL(pack.platform)} · {campaignLabel(pack.campaign)}
            </p>
            <span className="font-mono text-[10px] text-dim">
              {pack.fullPost.length} chars
            </span>
          </div>
          {pack.platform === "youtube" ? (
            <p className="mt-3 font-display text-xl uppercase text-fg">
              {pack.title}
            </p>
          ) : null}
          <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-fg/90 sm:text-sm">
            {pack.fullPost}
          </pre>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPack}
              className="inline-flex items-center gap-2 rounded-sm bg-green px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-bg hover:brightness-110"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy + score"}
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
                className="inline-flex items-center gap-2 rounded-sm border border-white/20 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-fg no-underline hover:border-fg"
              >
                <ExternalLink size={14} />
                Open on X
              </a>
            ) : null}
          </div>
          {status ? (
            <p className="mt-3 font-mono text-[11px] text-green">{status}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 rounded-md border border-white/10 bg-surface px-4 py-3 font-mono text-[10px] leading-relaxed text-dim">
        <p className="text-muted">
          Contract <span className="break-all text-fg/80">{CONTRACT}</span>
        </p>
        <p className="mt-1">
          Token buy: Uniswap / bow.fun only. Shill prizes: top 3 USDC — full with
          X blue tick, <span className="text-gold">50% without</span>. Creator
          content payouts still use the ${PAYOUT_USD} verified threshold.
        </p>
      </div>

      <div id="shill-board" className="mt-14 scroll-mt-24">
        <div className="mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-gold" />
          <h2 className="font-display text-3xl uppercase tracking-wide text-fg">
            Shill <span className="animate-flicker">board</span>
          </h2>
        </div>
        <p className="mb-4 font-mono text-[11px] text-dim">
          Separate from creator leaderboard. Points = packs you ship. Wallet =
          payout path. Blue tick = full top-3 prize.
        </p>
        <div className="overflow-hidden rounded-md border border-white/10 bg-surface">
          <div className="hidden grid-cols-[2.5rem_1fr_4rem_5rem_5.5rem] gap-2 border-b border-white/10 px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-dim sm:grid sm:px-4">
            <span>#</span>
            <span>Shiller</span>
            <span>Posts</span>
            <span>Points</span>
            <span>Prize</span>
          </div>
          <ul className="divide-y divide-white/5">
            {board.map((row, i) => {
              const rank = i + 1;
              const full =
                rank <= TOP3_PRIZES_USD.length
                  ? prizeForRank(rank, { xBlueTick: true })
                  : 0;
              const prize =
                rank <= TOP3_PRIZES_USD.length
                  ? prizeForRank(rank, { xBlueTick: row.xBlueTick === true })
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
                      {rank <= 3 && !row.xBlueTick ? " · −50%" : ""}
                    </p>
                  </div>
                  <span className="hidden font-mono text-xs text-muted sm:inline">
                    {row.posts}
                  </span>
                  <span className="font-mono text-xs font-bold text-green sm:text-left">
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
      </div>
    </div>
  );
}
