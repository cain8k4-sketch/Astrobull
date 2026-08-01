/** Automated Astro Bull hashtag engine — brand core + topic + platform + type. */

export const CORE_TAGS = [
  "AstroBull",
  "RobinhoodChain",
  "WeAreAllAstro",
  "DiamondHands",
  "SlaughterhouseProductions",
] as const;

const TOPIC_MAP: { test: RegExp; tags: string[] }[] = [
  { test: /moon|lunar|night|space|astro/i, tags: ["ToTheMoon", "CryptoMoon"] },
  { test: /chain|break|free|escape|cell/i, tags: ["BreakingTheChains", "Unchained"] },
  { test: /feather|glow|magic|mission/i, tags: ["GlowingFeather", "OriginStory"] },
  { test: /slaughter|horror|scare|blood|dark/i, tags: ["HorrorMeme", "DarkArt"] },
  { test: /beef|patty|99|sign|neon/i, tags: ["99CentBeef", "NeonSign"] },
  { test: /bull|bullish|pump|rally/i, tags: ["Bullish", "BullRun"] },
  { test: /meme|viral|funny|comedy/i, tags: ["MemeCoin", "CryptoMemes"] },
  { test: /create|creator|studio|content|artist/i, tags: ["ContentCreator", "GetFeatured"] },
  { test: /paid|money|earn|usdc|usdt|payout/i, tags: ["GetPaidToCreate", "CreatorEconomy"] },
  { test: /robinhood|rh\b/i, tags: ["Robinhood", "OnChain"] },
  { test: /video|reel|short|tiktok|clip/i, tags: ["ShortForm", "ViralVideo"] },
  { test: /art|image|poster|paint|draw/i, tags: ["CryptoArt", "DigitalArt"] },
  { test: /story|lore|chapter|saga/i, tags: ["CryptoStory", "Chapter1"] },
  { test: /chain.?saw|weapon|fight/i, tags: ["ActionMeme"] },
  { test: /tear|cry|emotion|feel/i, tags: ["HeStillHasFeelings"] },
];

const KIND_TAGS: Record<string, string[]> = {
  image: ["AIArt", "CryptoArt"],
  video: ["ShortForm", "Reels"],
  writing: ["CryptoTwitter", "Thread"],
  caption: ["SocialCopy"],
  upload: ["OriginalContent", "CreatorUpload"],
  midjourney: ["Midjourney", "AIArt"],
  system: ["PromptEngineering"],
  prompt: ["AIPrompt"],
};

const PLATFORM_TAGS: Record<string, string[]> = {
  x: ["CryptoTwitter"],
  tiktok: ["TikTok", "FYP"],
  youtube: ["YouTube", "YouTubeShorts"],
  snapchat: ["Snapchat", "Spotlight"],
  facebook: ["Facebook"],
};

function cleanTag(raw: string): string | null {
  const t = raw.replace(/^#/, "").replace(/[^A-Za-z0-9_]/g, "");
  if (t.length < 2 || t.length > 40) return null;
  // Prefer Pascal-ish for multiword already joined
  return t;
}

function fromText(text: string): string[] {
  const found: string[] = [];
  for (const m of text.match(/#[A-Za-z][\w]*/g) || []) {
    const c = cleanTag(m);
    if (c) found.push(c);
  }
  return found;
}

function fromTopicWords(topic: string): string[] {
  const words = topic
    .split(/[\s,./|]+/)
    .map((w) => w.replace(/[^A-Za-z0-9]/g, ""))
    .filter((w) => w.length >= 4 && w.length <= 18);
  const out: string[] = [];
  for (const w of words.slice(0, 4)) {
    // skip boring words
    if (/^(this|that|with|from|into|your|have|will|just|been|they|them)$/i.test(w))
      continue;
    out.push(w.charAt(0).toUpperCase() + w.slice(1));
  }
  return out;
}

export type HashtagInput = {
  topic?: string;
  caption?: string;
  body?: string;
  kind?: string;
  platforms?: string[];
  extra?: string[];
  /** max tags including core (default 12) */
  max?: number;
};

/**
 * Build a de-duplicated hashtag set:
 * core brand → platform → content type → topic map → extracted # → topic words → extras
 */
export function generateHashtags(input: HashtagInput = {}): string[] {
  const max = input.max ?? 12;
  const bag: string[] = [];
  const seen = new Set<string>();

  const push = (tags: string[]) => {
    for (const raw of tags) {
      const c = cleanTag(raw);
      if (!c) continue;
      const key = c.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      bag.push(c);
      if (bag.length >= max) return;
    }
  };

  // 1) Always-on brand core
  push([...CORE_TAGS]);

  // 2) Platforms selected for push
  if (input.platforms?.length) {
    for (const p of input.platforms) {
      push(PLATFORM_TAGS[p.toLowerCase()] || []);
    }
  }

  // 3) Content kind
  if (input.kind) {
    push(KIND_TAGS[input.kind] || []);
  }

  // 4) Topic / scene keyword map
  const blob = [input.topic, input.caption, input.body].filter(Boolean).join(" ");
  if (blob) {
    for (const row of TOPIC_MAP) {
      if (row.test.test(blob)) push(row.tags);
    }
    // 5) Any # already in text
    push(fromText(blob));
    // 6) Light topic words
    if (input.topic) push(fromTopicWords(input.topic));
  }

  // 7) Caller extras
  if (input.extra?.length) push(input.extra);

  // Guarantee minimum useful set
  if (bag.length < 5) {
    push(["Crypto", "MemeCoin", "Web3", "ContentCreator"]);
  }

  return bag.slice(0, max);
}

export function formatHashtags(tags: string[]): string {
  return tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
}

/** One-line block for captions / share sheets */
export function hashtagBlock(input: HashtagInput): string {
  return formatHashtags(generateHashtags(input));
}
