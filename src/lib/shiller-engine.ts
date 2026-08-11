/**
 * AstroBull shill engine — high-variety copy generator.
 * Platform-aware packs with dense line banks + style modes.
 */

import { generateHashtags, formatHashtags } from "./hashtags";

export type ShillPlatform =
  | "x"
  | "tiktok"
  | "telegram"
  | "youtube"
  | "snapchat"
  | "instagram";

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

/** Writing style — changes structure + voice */
export type ShillStyle =
  | "punchy"
  | "story"
  | "hype"
  | "deadpan"
  | "caption"
  | "thread";

export type ShillEntry = {
  id: string;
  handle: string;
  displayName: string;
  posts: number;
  points: number;
  lastAt: string;
  wallet?: string;
  xBlueTick?: boolean;
};

export type ShillPack = {
  title: string;
  body: string;
  hashtags: string[];
  fullPost: string;
  platform: ShillPlatform;
  campaign: ShillCampaign;
  style: ShillStyle;
  hook: string;
  /** Short alt lines for quick swap */
  alts: string[];
};

const STORAGE = "astrobull.shill.leaderboard.v3";

export const CONTRACT = "0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03";
export const SITE = "https://astrobull.xyz";
export const PAYOUT_USD = 50;

export const PRIZE_PERIOD = "weekly" as const;
export const TOP3_PRIZES_USD = [30, 15, 5] as const;
export const PRIZE_POOL_USD = TOP3_PRIZES_USD.reduce((a, b) => a + b, 0);

export function prizeForRank(
  rank: number,
  opts?: { xBlueTick?: boolean },
): number {
  if (rank < 1 || rank > TOP3_PRIZES_USD.length) return 0;
  const full = TOP3_PRIZES_USD[rank - 1] ?? 0;
  if (opts?.xBlueTick === true) return full;
  return Math.round(full * 0.5 * 100) / 100;
}

export const BLUE_TICK_RULE =
  "Weekly top-3 only (not daily). X blue tick / Premium = full prize. No blue tick = 50% less.";

export const CAMPAIGN_META: {
  id: ShillCampaign;
  label: string;
  blurb: string;
  emoji?: string;
}[] = [
  { id: "all", label: "Surprise me", blurb: "Mix every angle" },
  {
    id: "creator_economy",
    label: "Get paid",
    blurb: "Create free · featured · paid · holding optional",
  },
  {
    id: "amplify",
    label: "Amplify",
    blurb: "Herd channels push your work further",
  },
  {
    id: "passive_10s",
    label: "10s forever",
    blurb: "Short clip that keeps working",
  },
  {
    id: "payout_50",
    label: `$${PAYOUT_USD} bar`,
    blurb: "Verified views · real USDC/USDT",
  },
  {
    id: "token_burns",
    label: "Burns",
    blurb: "12M+ burnt · RH Chain · no dump energy",
  },
  {
    id: "how_to_buy",
    label: "How to buy",
    blurb: "MetaMask · Uniswap / bow.fun · not Phantom",
  },
  {
    id: "platform_open",
    label: "Join live",
    blurb: "Studio + signups open now",
  },
  {
    id: "feature_creator",
    label: "Feature someone",
    blurb: "Big-up a creator riding the herd",
  },
  {
    id: "dna_brand",
    label: "DNA / vibe",
    blurb: "Break the chains · industrial red · We are all Astro",
  },
];

export const STYLE_META: {
  id: ShillStyle;
  label: string;
  blurb: string;
}[] = [
  { id: "punchy", label: "Punchy", blurb: "Short lines. Scroll-stoppers." },
  { id: "story", label: "Story", blurb: "Mini narrative. Human." },
  { id: "hype", label: "Hype", blurb: "Loud. Energy. Rally the herd." },
  { id: "deadpan", label: "Deadpan", blurb: "Cold facts. No fluff." },
  { id: "caption", label: "Caption", blurb: "Under a clip / reel." },
  { id: "thread", label: "Thread open", blurb: "First post that hooks a thread." },
];

/** Optional one-tap power words to spice packs */
export const POWER_WORDS = [
  "break the chains",
  "we are all Astro",
  "holding optional",
  "get paid to create",
  "12M burnt",
  "Robinhood Chain only",
  "Slaughterhouse Productions",
  "10 seconds forever",
  "herd amplify",
  "USDC payouts",
  "no Phantom buy",
  "industrial red",
  "dev doesn't dump",
  "verified views",
  "join free",
];

type LineBank = {
  hooks: string[];
  angles: string[];
  proofs: string[];
  ctas: string[];
};

const BANKS: Record<Exclude<ShillCampaign, "all">, LineBank> = {
  creator_economy: {
    hooks: [
      "Get paid to create.",
      "Create free. Get featured. Get paid.",
      "Holding is optional. Creating is power.",
      "You don't need bags to build the brand.",
      "Today's vision. Tomorrow's legacy.",
      "The creator model meme coins forgot.",
      "Stop posting into the void. Get paid for it.",
      "Free entry. Real upside. No gate.",
      "Craft first. Token second.",
      "If you can create, you're already in the herd.",
    ],
    angles: [
      "AstroBull pays creators for work that clears the bar — holding the token is optional, not required.",
      "Creator Studio is open: AI with locked Astro DNA or original homework. No gatekeeping on entry.",
      "Slaughterhouse Productions is stacking talent. Your clip can live on the communal herd accounts.",
      "Most projects only shill the chart. This one shills the creator economy.",
      "Sign up free, drop content, climb toward real payouts when views are verified.",
      "We built a path where skill > bags. That's the whole point.",
      "Featured creators get amplified across TikTok, YouTube, Snap, and Telegram.",
      "Your art funds the culture. The token rides the culture. Not the other way around.",
    ],
    proofs: [
      `$${PAYOUT_USD} verified-view threshold in USDC / USDT — solid bar, not fairy-tale numbers.`,
      "Weekly shill top 3 also paid in USDC (separate board).",
      "Platform + studio + leaderboard are live — not a roadmap slide.",
      "Holding optional is written into the product, not a slogan.",
    ],
    ctas: [
      `Sign up free → ${SITE}/signup`,
      `Open Creator Studio → ${SITE}/studio`,
      `Drop content via herd TG · then climb the board → ${SITE}`,
      "Tag the herd. Get seen. Get paid.",
      "Join free. Holding optional. Creating is the move.",
    ],
  },
  amplify: {
    hooks: [
      "Elevated across our socials.",
      "Solo posts die. Herd posts compound.",
      "More spotlight than going alone.",
      "One upload. Multiple channels.",
      "Your views shouldn't rot in one algorithm.",
      "Amplify is the product — not a maybe.",
      "Ride the main stack, not just your own page.",
    ],
    angles: [
      "Creators get pushed on shared AstroBull accounts — TikTok, YouTube, Snap, TG — more reach than posting solo.",
      "The herd doesn't leave good work to die alone. We repost, feature, and compound attention.",
      "Communal channels = compound spotlight. That's why joining early still matters.",
      "Featured means the main accounts can carry you — not just a heart from a bot farm.",
      "Algorithm roulette is optional when the brand channels push the same DNA.",
      "Amplify turns one solid piece into a multi-platform hit for the herd.",
    ],
    proofs: [
      "Primary push: TikTok · YouTube · Snap · Telegram (X is light / follow).",
      "Content upload path is a private TG drop — reviewed, then featured.",
      "Studio + signup live so amplify has a real pipeline.",
    ],
    ctas: [
      `Join amplify → ${SITE}/signup`,
      "Follow the herd socials. Tag us. Get featured.",
      `Telegram main → t.me/Official_Astrobull_Robinhood`,
      "Want the main accounts behind your work? Sign up free.",
    ],
  },
  passive_10s: {
    hooks: [
      "A 10-second clip can stay forever.",
      "This is passive income energy.",
      "One loop. Long tail.",
      "Short. Sharp. Permanent.",
      "Less is more when the herd distributes it.",
      "Film once. Let it work.",
    ],
    angles: [
      "Drop a tight 10-second Astro clip once — it can keep working while you sleep.",
      "Short-form forever: one solid loop + herd distribution = long-tail attention.",
      "Music, muted loops, locked DNA — content engineered to keep earning eyes.",
      "You don't need a 12-minute essay. You need one unforgettable loop.",
      "Passive isn't magic — it's permanence + distribution. We built both paths.",
    ],
    proofs: [
      "Herd socials keep featured work in rotation.",
      "Studio DNA prompts keep every clip on-brand so the series compounds.",
      `Clear $${PAYOUT_USD} verified path when performance stacks.`,
    ],
    ctas: [
      `Upload path → ${SITE}/studio`,
      "10 seconds. Forever. Break the chains.",
      `Sign up → ${SITE}/signup`,
      "Make the loop. Let the herd push it.",
    ],
  },
  payout_50: {
    hooks: [
      `$${PAYOUT_USD}. Verified. Not vibes.`,
      "Real threshold. Real payouts.",
      "USDC / USDT when you clear the bar.",
      "No empty creator promises.",
      "Performance first. Then money moves.",
    ],
    angles: [
      `Payouts start when verified views hit $${PAYOUT_USD} — USDC or USDT. No fairy-tale screenshots.`,
      "Views get verified before money moves. That's how trust stays intact.",
      "Wallet on signup so payouts can land when you clear the bar.",
      "Phantom is NOT for buying the token — MetaMask + Uniswap / bow.fun. Payout wallet is separate EVM.",
      "Threshold exists so promises stay real when the revenue path is live.",
    ],
    proofs: [
      `Solid $${PAYOUT_USD} bar — designed to be clearable and honest.`,
      "Weekly shill contest is separate (top 3 USDC).",
      "Creator board tracks activity toward the real economy.",
    ],
    ctas: [
      `Leaderboard → ${SITE}/#leaderboard`,
      `Connect wallet on signup → ${SITE}/signup`,
      "Clear the bar. Get paid. Solid only.",
    ],
  },
  token_burns: {
    hooks: [
      "12M+ tokens burnt.",
      "Dev doesn't sell. Chains keep breaking.",
      "Only on Robinhood Chain.",
      "Burns + builders. Not dump theater.",
      "Less supply. Same fire.",
    ],
    angles: [
      "July burn narrative: ~12M tokens burnt. Build, burn, don't dump on the herd.",
      `Contract ${CONTRACT} — Robinhood Chain. Verify it yourself.`,
      "Tokenomics + creator inflow — a machine, not just a meme.",
      "Industrial red economy: culture first, then chart pressure from real activity.",
      "While others farm exits, this project stacks burns and creators.",
    ],
    proofs: [
      "Public burn story + on-chain contract.",
      "Buy path locked to Uniswap / bow.fun (no Phantom).",
      "Creator product ships alongside the token narrative.",
    ],
    ctas: [
      `Chart / buy → ${SITE}/#buy`,
      `Contract: ${CONTRACT}`,
      "Read the whitepaper. Then decide.",
      "Verify the chain. Then join the herd.",
    ],
  },
  how_to_buy: {
    hooks: [
      "How to buy $ASTROBULL (do it right).",
      "Uniswap / bow.fun only.",
      "MetaMask · Robinhood Chain.",
      "Not on Phantom. Read that again.",
      "One chain. Correct wallet. Correct swap.",
    ],
    angles: [
      "You cannot buy this token on Phantom. Use MetaMask, add Robinhood Chain, swap on Uniswap or bow.fun.",
      `Paste contract ${CONTRACT} carefully. Check chain. Keep slippage sane.`,
      "How-to-Buy lives on the site — industrial red path, no fake mirrors.",
      "Support the herd: buy right, hold with conviction — or just create. Holding is optional.",
      "Wrong wallet = wrong chain = pain. MetaMask + RH Chain is the move.",
    ],
    proofs: [
      `Contract ${CONTRACT}`,
      "Robinhood Chain only.",
      `bow.fun/?token=${CONTRACT}`,
    ],
    ctas: [
      `How to Buy → ${SITE}/#buy`,
      "Open MetaMask → Robinhood Chain → Uniswap / bow.fun",
      `Direct bow.fun → bow.fun/?token=${CONTRACT}`,
    ],
  },
  platform_open: {
    hooks: [
      "GM GM ASTROBULLS.",
      "Platform open. Sign ups live.",
      "Battle-tested. Ready for the herd.",
      "Stop waiting. The door is open.",
      "Studio live. Board live. Herd live.",
    ],
    angles: [
      "Website was battle-tested. Sign ups are open — name, email, wallet, handles.",
      "Creator Studio + leaderboard + shill tool are live for anyone who can create.",
      "Drop content via the herd TG upload path. Get reviewed. Get featured.",
      "Don't wait for perfect. Join free. Holding optional.",
      "If you've been lurking — this is the entry candle for creators.",
    ],
    proofs: [
      "Signup, studio, shill board, leaderboard — shipping, not teasing.",
      "Telegram content drop is live for uploads.",
      "Weekly shill prizes + creator threshold economy.",
    ],
    ctas: [
      `Sign up → ${SITE}/signup`,
      `Studio → ${SITE}/studio`,
      `Shill packs → ${SITE}/shill`,
      "Link in bio energy: astrobull.xyz",
    ],
  },
  feature_creator: {
    hooks: [
      "Featured on the herd socials.",
      "This video is dope.",
      "Slaughterhouse just dropped heat.",
      "Spotlight on. Chains off.",
      "New face on the main channels.",
    ],
    angles: [
      "Big-up this creator — content cleared the bar and rides AstroBull socials.",
      "Cliffhanger energy. More from Slaughterhouse Productions loading.",
      "Herd spotlight: when we post you, the whole stack can see you.",
      "Create free. Get featured. Get paid. This is what featured looks like.",
      "Support the creator. Steal the energy. Make your own.",
    ],
    proofs: [
      "Featured = main socials, not a ghost like.",
      "Same DNA rules so every feature compounds the brand.",
      "Pipeline is open for the next one — that could be you.",
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
      "Not cute. Not corporate. Herd.",
      "Same bull. Every frame. Always.",
    ],
    angles: [
      "Astro Bull DNA locked: black eye-mask, curved horns, chains, green feather, cigar OR blue tears — never both.",
      "Horror-meme industrial vibe. Slaughterhouse Productions. Built to be unforgettable.",
      "Same bull every frame so the brand compounds. AI or original — stay on DNA.",
      "Chapter One: Breaking the Chains. The story keeps rolling.",
      "If it doesn't look like Astro, it isn't Astro. Lock the DNA.",
    ],
    proofs: [
      "Studio ships locked DNA prompts so AI stays on-model.",
      "Visual system: red / bone / industrial — zero pastel soup.",
      "Story + whitepaper live on site.",
    ],
    ctas: [
      `Story + whitepaper → ${SITE}`,
      "Use Studio DNA prompts. Stay consistent.",
      "Break the chains with us.",
      "We are all Astro.",
    ],
  },
};

const ALL_CAMPAIGNS = Object.keys(BANKS) as Exclude<ShillCampaign, "all">[];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!;
}

function pickN<T>(arr: T[], seed: number, n: number): T[] {
  if (!arr.length) return [];
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  for (let i = 0; i < n && out.length < arr.length; i++) {
    let idx = Math.abs(s) % arr.length;
    let guard = 0;
    while (used.has(idx) && guard < arr.length) {
      s = (s * 1103515245 + 12345) | 0;
      idx = Math.abs(s) % arr.length;
      guard++;
    }
    used.add(idx);
    out.push(arr[idx]!);
    s = (s * 1664525 + 1013904223) | 0;
  }
  return out;
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

function resolveCampaign(
  c: ShillCampaign,
  seed: number,
): Exclude<ShillCampaign, "all"> {
  if (c !== "all") return c;
  return pick(ALL_CAMPAIGNS, seed);
}

function platformLimits(p: ShillPlatform): {
  maxChars: number;
  maxTags: number;
  title: boolean;
} {
  switch (p) {
    case "x":
      return { maxChars: 275, maxTags: 5, title: false };
    case "tiktok":
      return { maxChars: 2200, maxTags: 8, title: false };
    case "instagram":
      return { maxChars: 2100, maxTags: 12, title: false };
    case "youtube":
      return { maxChars: 4500, maxTags: 10, title: true };
    case "snapchat":
      return { maxChars: 800, maxTags: 6, title: false };
    case "telegram":
      return { maxChars: 3500, maxTags: 8, title: false };
  }
}

function composeBody(opts: {
  style: ShillStyle;
  hook: string;
  angle: string;
  proof: string;
  cta: string;
  vibe?: string;
  mention?: string;
  platform: ShillPlatform;
  campaign: Exclude<ShillCampaign, "all">;
}): string {
  const {
    style,
    hook,
    angle,
    proof,
    cta,
    vibe,
    mention,
    platform,
    campaign,
  } = opts;

  const mentionLine = mention
    ? campaign === "feature_creator"
      ? `Big up ${mention} — this heat is riding the herd socials.`
      : `Shout-out ${mention}.`
    : "";

  const vibeLine = vibe?.trim() || "";

  const xNote =
    platform === "x"
      ? "X is follow / light push — main heat lives on TT / YT / Snap / TG."
      : "";

  if (style === "punchy") {
    return [
      hook,
      "",
      angle,
      vibeLine,
      mentionLine,
      "",
      cta,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (style === "hype") {
    return [
      hook.toUpperCase().replace(/\.$/, "") + ".",
      "",
      `${angle}`,
      proof,
      vibeLine ? `// ${vibeLine}` : "",
      mentionLine,
      "",
      "WE ARE ALL ASTRO.",
      cta,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (style === "deadpan") {
    return [
      hook,
      "",
      `Fact: ${angle}`,
      `Proof: ${proof}`,
      vibeLine ? `Note: ${vibeLine}` : "",
      mentionLine,
      "",
      cta,
      xNote,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (style === "story") {
    return [
      hook,
      "",
      "Here's the play:",
      angle,
      "",
      proof,
      vibeLine ? `\n${vibeLine}` : "",
      mentionLine ? `\n${mentionLine}` : "",
      "",
      cta,
    ]
      .filter((x) => x !== undefined)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  }

  if (style === "caption") {
    // Under-video style: short, emoji-free, scannable
    const bits = [hook.replace(/\.$/, ""), angle.split(". ")[0], mentionLine, cta]
      .filter(Boolean)
      .map((s) => String(s).replace(/\n/g, " ").trim());
    return bits.join(" · ");
  }

  // thread opener
  return [
    hook,
    "",
    "Thread 🧵",
    "",
    `1/ ${angle}`,
    "",
    `2/ ${proof}`,
    vibeLine ? `\n3/ ${vibeLine}` : "",
    mentionLine ? `\n${mentionLine}` : "",
    "",
    `→ ${cta}`,
    xNote,
  ]
    .filter((x) => x !== undefined)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function trimToLimit(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastBreak = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
  return (lastBreak > max * 0.6 ? cut.slice(0, lastBreak) : cut).trimEnd() + "…";
}

/** Build a ready-to-post shill pack. */
export function buildShillPack(opts: {
  platform: ShillPlatform;
  campaign?: ShillCampaign;
  style?: ShillStyle;
  vibe?: string;
  mention?: string;
  /** Force new randomness */
  salt?: number;
}): ShillPack {
  const campaignIn = opts.campaign ?? "all";
  const style = opts.style ?? "punchy";
  const salt = opts.salt ?? (Math.floor(Math.random() * 1e9) | 0);
  const seed =
    hashSeed(
      `${opts.platform}|${campaignIn}|${style}|${opts.vibe ?? ""}|${opts.mention ?? ""}|${salt}`,
    ) ^ salt;

  const campaign = resolveCampaign(campaignIn, seed);
  const bank = BANKS[campaign];
  const limits = platformLimits(opts.platform);

  const hook = pick(bank.hooks, seed);
  const angle = pick(bank.angles, seed + 17);
  const proof = pick(bank.proofs, seed + 31);
  const cta = pick(bank.ctas, seed + 47);

  const mention = opts.mention?.trim()
    ? opts.mention.startsWith("@")
      ? opts.mention.trim()
      : `@${opts.mention.trim()}`
    : "";

  const body = composeBody({
    style,
    hook,
    angle,
    proof,
    cta,
    vibe: opts.vibe,
    mention,
    platform: opts.platform,
    campaign,
  });

  const title = limits.title
    ? `AstroBull | ${hook.replace(/\.$/, "")}`.slice(0, 90)
    : hook;

  const hashtags = generateHashtags({
    topic: `${hook} ${angle} AstroBull get paid amplify ${campaign} ${opts.vibe ?? ""}`,
    kind: "caption",
    platforms: [
      opts.platform === "telegram" || opts.platform === "instagram"
        ? "x"
        : opts.platform,
    ],
    max: limits.maxTags,
    extra: [
      "AstroBull",
      "GetPaidToCreate",
      "BreakingTheChains",
      "WeAreAllAstro",
      "RobinhoodChain",
      "SlaughterhouseProductions",
    ],
  });

  const tagBlock = formatHashtags(hashtags);
  let fullPost =
    style === "caption"
      ? `${body}\n\n${tagBlock}`
      : `${body}\n\n${tagBlock}`;

  // X hard limit
  if (opts.platform === "x") {
    fullPost = trimToLimit(fullPost, limits.maxChars);
    // if still too long after tags, rebuild tighter
    if (fullPost.length > limits.maxChars) {
      fullPost = trimToLimit(
        [hook, "", angle, "", cta, "", formatHashtags(hashtags.slice(0, 4))].join(
          "\n",
        ),
        limits.maxChars,
      );
    }
  } else if (fullPost.length > limits.maxChars) {
    fullPost = trimToLimit(fullPost, limits.maxChars);
  }

  // Alt hooks for UI "swap hook" feature
  const alts = pickN(bank.hooks, seed + 99, 4).filter((h) => h !== hook);

  return {
    title,
    body,
    hashtags,
    fullPost,
    platform: opts.platform,
    campaign,
    style,
    hook,
    alts,
  };
}

/** Swap the hook line in an existing pack and rebuild fullPost. */
export function applyAltHook(pack: ShillPack, newHook: string): ShillPack {
  const body = pack.body.replace(pack.hook, newHook);
  // also try uppercase hype form
  const body2 = body.includes(newHook)
    ? body
    : pack.body.replace(pack.hook.toUpperCase().replace(/\.$/, "") + ".", newHook);
  const limits = platformLimits(pack.platform);
  let fullPost = `${body2}\n\n${formatHashtags(pack.hashtags)}`;
  if (fullPost.length > limits.maxChars) {
    fullPost = trimToLimit(fullPost, limits.maxChars);
  }
  return {
    ...pack,
    hook: newHook,
    body: body2,
    fullPost,
    title:
      pack.platform === "youtube"
        ? `AstroBull | ${newHook.replace(/\.$/, "")}`.slice(0, 90)
        : newHook,
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

export function attachWalletToShiller(
  handle: string,
  wallet: string,
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
      return "X";
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

export function styleLabel(s: ShillStyle): string {
  return STYLE_META.find((m) => m.id === s)?.label ?? s;
}
