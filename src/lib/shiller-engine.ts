/** AstroBull shill engine — post packs + separate shill leaderboard (not creator board). */

import { generateHashtags, formatHashtags } from "./hashtags";

export type ShillPlatform = "x" | "tiktok" | "telegram" | "youtube" | "snapchat";

export type ShillEntry = {
  id: string;
  handle: string;
  displayName: string;
  posts: number;
  points: number;
  lastAt: string;
};

export type ShillPack = {
  title: string;
  body: string;
  hashtags: string[];
  fullPost: string;
  platform: ShillPlatform;
};

const STORAGE = "astrobull.shill.leaderboard.v1";

const HOOKS = [
  "GM GM ASTROBULLS",
  "BREAK THE CHAINS.",
  "We are all Astro.",
  "Create free. Get featured. Get paid.",
  "10 seconds on the platform. Passive income forever.",
  "Holding is optional. Creating is power.",
  "Today's vision · Tomorrow's legacy · In the herd we trust.",
  "Only on Robinhood Chain.",
];

const ANGLES = [
  "Creator economy is live — sign up free, get amplified across the herd socials.",
  "Your clip doesn't die in the algorithm alone. The herd pushes it.",
  "Views get verified. Payouts in USDC / USDT toward the $50 threshold.",
  "Astro Bull content stays on-brand — same bull, same fire, every post.",
  "Slaughterhouse Productions is stacking creators. Don't miss the open window.",
  "Token burns + creator revenue flywheel. Build with us.",
  "Shill smart. Post clean. Climb the shill board.",
  "From one 10-second loop to forever passive — that's the model.",
];

const CTAS = [
  "Sign up free → astrobull.xyz",
  "Studio open → astrobull.xyz/studio",
  "Join Telegram → t.me/Official_Astrobull_Robinhood",
  "Buy only on Uniswap / bow.fun (Robinhood Chain)",
  "Contract: 0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

/** Build a ready-to-post shill pack. */
export function buildShillPack(opts: {
  platform: ShillPlatform;
  vibe?: string;
  mention?: string;
}): ShillPack {
  const seed =
    hashSeed(
      `${opts.platform}|${opts.vibe ?? ""}|${opts.mention ?? ""}|${Date.now() >> 11}`,
    ) ^
    (Math.floor(Math.random() * 1e6) | 0);

  const hook = pick(HOOKS, seed);
  const angle = pick(ANGLES, seed + 3);
  const cta = pick(CTAS, seed + 7);
  const vibeLine = opts.vibe?.trim()
    ? opts.vibe.trim()
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

  const lines = [
    hook,
    "",
    angle,
    vibeLine,
    mention ? `Big up ${mention}` : null,
    "",
    cta,
  ].filter((x): x is string => Boolean(x));

  const body = lines.join("\n");

  const hashtags = generateHashtags({
    topic: `${hook} ${angle} ${vibeLine}`,
    kind: "caption",
    platforms: [opts.platform === "telegram" ? "x" : opts.platform],
    max: opts.platform === "x" ? 8 : 12,
    extra: ["AstroBull", "GetPaidToCreate", "BreakingTheChains"],
  });

  const fullPost =
    opts.platform === "x"
      ? `${body}\n\n${formatHashtags(hashtags)}`.slice(0, 280)
      : `${body}\n\n${formatHashtags(hashtags)}`;

  return { title, body, hashtags, fullPost, platform: opts.platform };
}

/** Points for a successful shill copy / share action. */
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

/** Record a shill action for local leaderboard (separate from creator board). */
export function recordShill(opts: {
  handle: string;
  displayName?: string;
  platform: ShillPlatform;
}): ShillEntry[] {
  const handle = (opts.handle || "anon").trim().replace(/^@/, "") || "anon";
  const displayName = (opts.displayName || handle).trim() || handle;
  const pts = shillPointsFor(opts.platform);

  // Drop demo placeholders once a real shill is recorded
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
      },
    ];
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
  },
  {
    id: "demo-s2",
    handle: "@herdamp",
    displayName: "HerdAmp",
    posts: 31,
    points: 520,
    lastAt: new Date().toISOString(),
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
      return "X / Twitter";
    case "tiktok":
      return "TikTok";
    case "telegram":
      return "Telegram";
    case "youtube":
      return "YouTube";
    case "snapchat":
      return "Snapchat";
  }
}
