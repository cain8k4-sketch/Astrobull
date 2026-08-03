/**
 * AstroBull shill engine
 * Covers full product story from project brief:
 * creator economy, amplify, $50 USDC/USDT, 10s forever, burns, Uniswap-only,
 * DNA lock, platforms (TT/YT/Snap/TG/X follow), separate shill board.
 */

import { generateHashtags, formatHashtags } from "./hashtags";

export type ShillPlatform =
  | "x"
  | "tiktok"
  | "telegram"
  | "youtube"
  | "snapchat"
  | "instagram";

/** Campaign packs — everything we locked in earlier */
export type ShillCampaign =
  | "all"
  | "creator_economy"
  | "amplify"
  | "passive_10s"
  | "payout_50"
  | "token_burns"
  | "how_to_buy"
  | "platform_open"
  | "feature_creator"
  | "dna_brand";

export type ShillEntry = {
  id: string;
  handle: string;
  displayName: string;
  posts: number;
  points: number;
  lastAt: string;
  /** Robinhood Chain / EVM payout wallet (0x…) */
  wallet?: string;
  /** X Premium / blue check — non-verified get 50% prize cut */
  xBlueTick?: boolean;
};

export type ShillPack = {
  title: string;
  body: string;
  hashtags: string[];
  fullPost: string;
  platform: ShillPlatform;
  campaign: ShillCampaign;
};

const STORAGE = "astrobull.shill.leaderboard.v3";

export const CONTRACT = "0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03";
export const SITE = "https://astrobull.xyz";
export const PAYOUT_USD = 50;

/**
 * Weekly shill contest (not daily).
 * Top 3 paid in USD (USDC on Robinhood Chain) at end of each week.
 */
export const PRIZE_PERIOD = "weekly" as const;
export const TOP3_PRIZES_USD = [30, 15, 5] as const;
export const PRIZE_POOL_USD = TOP3_PRIZES_USD.reduce((a, b) => a + b, 0);

/** Full prize for blue-tick X; 50% if no blue tick (or unclaimed). */
export function prizeForRank(
  rank: number,
  opts?: { xBlueTick?: boolean },
): number {
  if (rank < 1 || rank > TOP3_PRIZES_USD.length) return 0;
  const full = TOP3_PRIZES_USD[rank - 1] ?? 0;
  if (opts?.xBlueTick === true) return full;
  // 50% less — keep cents clean for USDC display
  return Math.round(full * 0.5 * 100) / 100;
}

export const BLUE_TICK_RULE =
  "Weekly top-3 only (not daily). X blue tick / Premium = full prize. No blue tick = 50% less.";

export const CAMPAIGN_META: {
  id: ShillCampaign;
  label: string;
  blurb: string;
}[] = [
  { id: "all", label: "Full mix", blurb: "Random from every pillar" },
  {
    id: "creator_economy",
    label: "Creator economy",
    blurb: "Create free · get featured · get paid · holding optional",
  },
  {
    id: "amplify",
    label: "Herd amplify",
    blurb: "Shared accounts = more spotlight than going alone",
  },
  {
    id: "passive_10s",
    label: "10s forever",
    blurb: "Short clip on the platform · passive income story",
  },
  {
    id: "payout_50",
    label: "$50 payout",
    blurb: "Verified views · USDC / USDT · solid threshold",
  },
  {
    id: "token_burns",
    label: "Burns + token",
    blurb: "12M+ burnt · dev doesn't sell · Robinhood Chain",
  },
  {
    id: "how_to_buy",
    label: "How to buy",
    blurb: "MetaMask · Uniswap / bow.fun only · no Phantom",
  },
  {
    id: "platform_open",
    label: "Sign ups open",
    blurb: "Studio live · wallet + handles · join the herd",
  },
  {
    id: "feature_creator",
    label: "Feature a creator",
    blurb: "Big-up someone dropping heat on herd socials",
  },
  {
    id: "dna_brand",
    label: "Astro DNA",
    blurb: "Break the chains · red/bone · We are all Astro",
  },
];

type LineBank = { hooks: string[]; angles: string[]; ctas: string[] };

const BANKS: Record<Exclude<ShillCampaign, "all">, LineBank> = {
  creator_economy: {
    hooks: [
      "Get paid to create.",
      "Create free. Get featured. Get paid.",
      "Holding is optional. Creating is power.",
      "Today's vision · Tomorrow's legacy · In the herd we trust.",
    ],
    angles: [
      "AstroBull creator model: create free, get featured, get paid. Holding is optional. We are all Astro.",
      "Creator Studio open — plug your craft (or AI with locked Astro DNA). Upload original homework too.",
      "No gatekeeping on entry. Sign up free. Climb toward real payouts when views are verified.",
      "Slaughterhouse Productions is stacking creators. Your work can live on the communal herd accounts.",
    ],
    ctas: [
      `Sign up free → ${SITE}/signup`,
      `Creator Studio → ${SITE}/studio`,
      "Tag the herd. Get seen. Get paid.",
    ],
  },
  amplify: {
    hooks: [
      "Elevated across our socials.",
      "Get paid to create · amplified by the herd.",
      "More spotlight than going alone.",
    ],
    angles: [
      "MAJOR SELLING POINT: creators get amplified on shared AstroBull accounts — TikTok, YouTube, Snap, TG — more reach than posting solo.",
      "Your views don't die alone in the algorithm. The herd pushes them across one stack of channels.",
      "Communal upload to herd socials = compound spotlight. That's why joining early matters.",
      "Featured creators ride the main channels. Amplify is the product, not a promise.",
    ],
    ctas: [
      `Join amplify → ${SITE}/signup`,
      "Follow the herd socials. Tag us. Get featured.",
      `Telegram → t.me/Official_Astrobull_Robinhood`,
    ],
  },
  passive_10s: {
    hooks: [
      "A 10-second video stays on our platform forever.",
      "This is passive income.",
      "One loop. Long tail.",
    ],
    angles: [
      "Drop a 10-second clip once — it stays on the platform. That is the passive income story.",
      "Short-form forever: one solid Astro loop can keep working while you sleep.",
      "Less is more. Tight clips. Herd distribution. Long tail views.",
      "Music + muted loops + Astro DNA = content that can keep earning attention.",
    ],
    ctas: [
      `Upload path → ${SITE}/studio`,
      "10 seconds. Forever. Break the chains.",
      `Sign up → ${SITE}/signup`,
    ],
  },
  payout_50: {
    hooks: [
      `$${PAYOUT_USD} threshold. No empty promises.`,
      "Verified views. Real payouts.",
      "USDC / USDT when you clear the bar.",
    ],
    angles: [
      `Payouts start when verified views hit the solid $${PAYOUT_USD} threshold — USDC or USDT. No fairy-tale numbers.`,
      "Views are verified before money moves. Platform + creator activity stack toward the threshold.",
      "Wallet on signup so payouts can land when you clear the bar. Phantom is NOT for buying the token — MetaMask + Uniswap.",
      "Threshold exists so promises stay real: when revenue path is live, payouts follow verified performance.",
    ],
    ctas: [
      `Track progress on the creator board → ${SITE}/#leaderboard`,
      `Connect wallet on signup → ${SITE}/signup`,
      "Get paid when the threshold clears. Solid only.",
    ],
  },
  token_burns: {
    hooks: [
      "12M+ tokens burnt.",
      "Dev doesn't sell. Chains keep breaking.",
      "Only on Robinhood Chain.",
    ],
    angles: [
      "July burn narrative: ~12M tokens burnt. Burns + revenue flywheel as the model matures.",
      "Dev wallet discipline: build, burn, don't dump on the herd.",
      `Contract ${CONTRACT} — Robinhood Chain. Check burns. Stay sharp.`,
      "Tokenomics story + creator economy inflow. Not just a meme — a machine.",
    ],
    ctas: [
      `Chart / buy → ${SITE}/#buy`,
      `Contract: ${CONTRACT}`,
      "Read the whitepaper. Then decide.",
    ],
  },
  how_to_buy: {
    hooks: [
      "How to buy $ASTROBULL",
      "Uniswap / bow.fun only.",
      "MetaMask · Robinhood Chain.",
    ],
    angles: [
      "You cannot buy on Phantom for this token. Use MetaMask, add Robinhood Chain, swap on Uniswap or bow.fun.",
      `Paste contract ${CONTRACT} carefully. Slippage sane. Double-check the chain.`,
      "Buy links live on the site How to Buy section — industrial red path, no fake mirrors.",
      "Support the herd: buy right, hold with conviction, or just create — holding is optional.",
    ],
    ctas: [
      `How to Buy → ${SITE}/#buy`,
      `Uniswap: app.uniswap.org (Robinhood Chain)`,
      `bow.fun/?token=${CONTRACT}`,
    ],
  },
  platform_open: {
    hooks: [
      "GM GM ASTROBULLS",
      "Platform open. Sign ups live.",
      "Battle-tested. Ready for the herd.",
    ],
    angles: [
      "Website / platform was battle-tested. Sign ups are open — name, email, wallet, handles.",
      "Creator Studio + sign up + leaderboard + shill tool are live for the herd.",
      "Drop content via the herd TG upload path. Get reviewed. Get featured.",
      "Don't wait for perfect. Join free. Holding optional. Creating is the move.",
    ],
    ctas: [
      `Sign up → ${SITE}/signup`,
      `Studio → ${SITE}/studio`,
      `Shill tool → ${SITE}/shill`,
    ],
  },
  feature_creator: {
    hooks: [
      "Featured on the herd socials.",
      "This video is dope.",
      "Slaughterhouse Productions just dropped heat.",
    ],
    angles: [
      "Big-up this creator — content cleared the bar and rides AstroBull socials.",
      "Cliffhanger energy. More from Slaughterhouse Productions loading.",
      "Herd spotlight: when we post you, the whole stack can see you.",
      "Create free. Get featured. Get paid. This is what featured looks like.",
    ],
    ctas: [
      `Want the same shot? Sign up → ${SITE}/signup`,
      "Follow TikTok · YouTube · Snap · TG for the full drop",
      "We are all Astro.",
    ],
  },
  dna_brand: {
    hooks: [
      "BREAK THE CHAINS.",
      "We are all Astro.",
      "Industrial red. Bone. Chains.",
    ],
    angles: [
      "Astro Bull DNA locked: black eye-mask, curved horns, chains, green feather, cigar OR blue tears — never both.",
      "Horror-meme industrial vibe. Not cute. Not corporate. Slaughterhouse Productions.",
      "Same bull every frame so the brand compounds. AI or original — stay on DNA.",
      "Chapter One: Breaking the Chains. The story keeps rolling.",
    ],
    ctas: [
      `Story + whitepaper → ${SITE}`,
      "Use the Studio DNA prompts. Stay consistent.",
      "Break the chains with us.",
    ],
  },
};

const ALL_CAMPAIGNS = Object.keys(BANKS) as Exclude<ShillCampaign, "all">[];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function resolveCampaign(c: ShillCampaign, seed: number): Exclude<ShillCampaign, "all"> {
  if (c !== "all") return c;
  return pick(ALL_CAMPAIGNS, seed);
}

/** Build a ready-to-post shill pack from full product narrative. */
export function buildShillPack(opts: {
  platform: ShillPlatform;
  campaign?: ShillCampaign;
  vibe?: string;
  mention?: string;
}): ShillPack {
  const campaignIn = opts.campaign ?? "all";
  const seed =
    hashSeed(
      `${opts.platform}|${campaignIn}|${opts.vibe ?? ""}|${opts.mention ?? ""}|${Date.now() >> 11}`,
    ) ^
    (Math.floor(Math.random() * 1e6) | 0);

  const campaign = resolveCampaign(campaignIn, seed);
  const bank = BANKS[campaign];

  const hook = pick(bank.hooks, seed);
  const angle = pick(bank.angles, seed + 3);
  const cta = pick(bank.ctas, seed + 7);

  const vibeLine = opts.vibe?.trim()
    ? opts.vibe.trim()
    : campaign === "how_to_buy"
      ? "MetaMask · Robinhood Chain · Uniswap / bow.fun"
      : campaign === "payout_50"
        ? `Verified views → $${PAYOUT_USD} in USDC/USDT`
        : "Industrial red. Bone. Chains breaking.";

  const mention = opts.mention?.trim()
    ? opts.mention.startsWith("@")
      ? opts.mention.trim()
      : `@${opts.mention.trim()}`
    : "";

  const title =
    opts.platform === "youtube"
      ? `AstroBull | ${hook.replace(/\.$/, "")}`
      : hook;

  const mentionLine =
    mention &&
    (campaign === "feature_creator"
      ? `Big up ${mention} — this heat is riding the herd socials.`
      : `Shout-out ${mention}`);

  // Platform-specific guardrails from earlier chats
  const platformNote =
    opts.platform === "x"
      ? "Follow the herd on X — main push is TikTok / YouTube / Snap / TG."
      : opts.platform === "tiktok" || opts.platform === "youtube"
        ? "Primary amplify channels for herd drops."
        : null;

  const lines = [
    hook,
    "",
    angle,
    vibeLine,
    mentionLine,
    platformNote,
    "",
    cta,
  ].filter((x): x is string => Boolean(x));

  const body = lines.join("\n");

  const hashtags = generateHashtags({
    topic: `${hook} ${angle} ${vibeLine} AstroBull get paid amplify ${campaign}`,
    kind: "caption",
    platforms: [
      opts.platform === "telegram" || opts.platform === "instagram"
        ? "x"
        : opts.platform,
    ],
    max: opts.platform === "x" ? 7 : 12,
    extra: [
      "AstroBull",
      "GetPaidToCreate",
      "BreakingTheChains",
      "WeAreAllAstro",
      "RobinhoodChain",
      "SlaughterhouseProductions",
    ],
  });

  let fullPost = `${body}\n\n${formatHashtags(hashtags)}`;
  if (opts.platform === "x" && fullPost.length > 280) {
    // Prefer hook + angle + one CTA + tags
    const short = [hook, "", angle, "", cta, "", formatHashtags(hashtags.slice(0, 5))]
      .join("\n")
      .slice(0, 280);
    fullPost = short;
  }

  return {
    title,
    body,
    hashtags,
    fullPost,
    platform: opts.platform,
    campaign,
  };
}

export function shillPointsFor(platform: ShillPlatform): number {
  switch (platform) {
    case "x":
      return 12;
    case "tiktok":
      return 18;
    case "youtube":
      return 20;
    case "telegram":
      return 10;
    case "snapchat":
      return 14;
    case "instagram":
      return 14;
    default:
      return 10;
  }
}

export function loadShillBoard(): ShillEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return DEMO_SHILLERS;
    const parsed = JSON.parse(raw) as ShillEntry[];
    if (!Array.isArray(parsed) || !parsed.length) return DEMO_SHILLERS;
    return rankShillers(parsed);
  } catch {
    return DEMO_SHILLERS;
  }
}

export function saveShillBoard(list: ShillEntry[]) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(rankShillers(list)));
  } catch {
    /* ignore */
  }
}

export function rankShillers(list: ShillEntry[]): ShillEntry[] {
  return [...list]
    .sort((a, b) => b.points - a.points || b.posts - a.posts)
    .map((e, i) => ({ ...e, id: e.id || `s-${i}` }));
}

export function recordShill(opts: {
  handle: string;
  displayName?: string;
  platform: ShillPlatform;
  wallet?: string;
  xBlueTick?: boolean;
}): ShillEntry[] {
  const handle = (opts.handle || "anon").trim().replace(/^@/, "") || "anon";
  const displayName = (opts.displayName || handle).trim() || handle;
  const pts = shillPointsFor(opts.platform);
  const wallet = (opts.wallet || "").trim() || undefined;
  const xBlueTick = opts.xBlueTick;

  const current = loadShillBoard();
  const base = current.some((e) => !e.id.startsWith("demo-"))
    ? current.filter((e) => !e.id.startsWith("demo-"))
    : [];

  const key = handle.toLowerCase();
  const existing = base.find(
    (e) => e.handle.replace(/^@/, "").toLowerCase() === key,
  );

  let next: ShillEntry[];
  if (existing) {
    next = base.map((e) =>
      e.handle.replace(/^@/, "").toLowerCase() === key
        ? {
            ...e,
            posts: e.posts + 1,
            points: e.points + pts,
            lastAt: new Date().toISOString(),
            displayName: displayName || e.displayName,
            wallet: wallet || e.wallet,
            xBlueTick:
              typeof xBlueTick === "boolean" ? xBlueTick : e.xBlueTick,
          }
        : e,
    );
  } else {
    next = [
      ...base,
      {
        id: `shill-${Date.now()}`,
        handle: `@${handle}`,
        displayName,
        posts: 1,
        points: pts,
        lastAt: new Date().toISOString(),
        wallet,
        xBlueTick: xBlueTick === true,
      },
    ];
  }
  const ranked = rankShillers(next);
  saveShillBoard(ranked);
  return ranked;
}

/** Link a Robinhood/EVM wallet to a shill handle for top-3 USD payouts. */
export function attachWalletToShiller(handle: string, wallet: string): ShillEntry[] {
  const key = handle.trim().replace(/^@/, "").toLowerCase() || "anon";
  const current = loadShillBoard();
  const base = current.some((e) => !e.id.startsWith("demo-"))
    ? current.filter((e) => !e.id.startsWith("demo-"))
    : current.map((e) => ({ ...e })); // allow attaching on demos for preview
  let found = false;
  const next = base.map((e) => {
    if (e.handle.replace(/^@/, "").toLowerCase() === key) {
      found = true;
      return { ...e, wallet: wallet.trim() };
    }
    return e;
  });
  if (!found) {
    next.push({
      id: `shill-${Date.now()}`,
      handle: `@${key}`,
      displayName: key,
      posts: 0,
      points: 0,
      lastAt: new Date().toISOString(),
      wallet: wallet.trim(),
    });
  }
  const ranked = rankShillers(next);
  saveShillBoard(ranked);
  return ranked;
}

export function top3Eligible(list: ShillEntry[]): {
  rank: number;
  entry: ShillEntry;
  prizeUsd: number;
  fullPrizeUsd: number;
  blueTick: boolean;
  ready: boolean;
}[] {
  return rankShillers(list)
    .slice(0, 3)
    .map((entry, i) => {
      const blueTick = entry.xBlueTick === true;
      const fullPrizeUsd = prizeForRank(i + 1, { xBlueTick: true });
      return {
        rank: i + 1,
        entry,
        fullPrizeUsd,
        prizeUsd: prizeForRank(i + 1, { xBlueTick: blueTick }),
        blueTick,
        ready: !!entry.wallet && /^0x[a-fA-F0-9]{40}$/.test(entry.wallet),
      };
    });
}

/** Set / clear X blue-tick flag for a shill handle. */
export function setShillerBlueTick(
  handle: string,
  xBlueTick: boolean,
): ShillEntry[] {
  const key = handle.trim().replace(/^@/, "").toLowerCase() || "anon";
  const current = loadShillBoard();
  const base = current.some((e) => !e.id.startsWith("demo-"))
    ? current.filter((e) => !e.id.startsWith("demo-"))
    : current.map((e) => ({ ...e }));
  let found = false;
  const next = base.map((e) => {
    if (e.handle.replace(/^@/, "").toLowerCase() === key) {
      found = true;
      return { ...e, xBlueTick };
    }
    return e;
  });
  if (!found) {
    next.push({
      id: `shill-${Date.now()}`,
      handle: `@${key}`,
      displayName: key,
      posts: 0,
      points: 0,
      lastAt: new Date().toISOString(),
      xBlueTick,
    });
  }
  const ranked = rankShillers(next);
  saveShillBoard(ranked);
  return ranked;
}

export const DEMO_SHILLERS: ShillEntry[] = [
  {
    id: "demo-s1",
    handle: "@chainshill",
    displayName: "ChainShill",
    posts: 42,
    points: 680,
    lastAt: new Date().toISOString(),
    xBlueTick: true,
  },
  {
    id: "demo-s2",
    handle: "@herdamp",
    displayName: "HerdAmp",
    posts: 31,
    points: 520,
    lastAt: new Date().toISOString(),
    xBlueTick: false,
  },
  {
    id: "demo-s3",
    handle: "@featherpush",
    displayName: "FeatherPush",
    posts: 19,
    points: 310,
    lastAt: new Date().toISOString(),
  },
  {
    id: "demo-s4",
    handle: "@rhonly",
    displayName: "RHOnly",
    posts: 12,
    points: 180,
    lastAt: new Date().toISOString(),
  },
];

export function xIntentUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export function PLATFORM_LABEL(p: ShillPlatform): string {
  switch (p) {
    case "x":
      return "X (follow / light)";
    case "tiktok":
      return "TikTok";
    case "telegram":
      return "Telegram";
    case "youtube":
      return "YouTube";
    case "snapchat":
      return "Snapchat";
    case "instagram":
      return "Instagram";
  }
}

export function campaignLabel(c: ShillCampaign): string {
  return CAMPAIGN_META.find((m) => m.id === c)?.label ?? c;
}
