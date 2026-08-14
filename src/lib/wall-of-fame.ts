/**
 * Creators showcase / Wall of Fame data.
 * Edit this list anytime, then redeploy.
 *
 * workUrl     = direct link to their video / post
 * handle      = @username (shown large on the card)
 * thumbnailUrl = optional 16:9 image; YouTube workUrls auto-derive a thumb
 */

export type FamePlatform =
  | "tiktok"
  | "youtube"
  | "instagram"
  | "x"
  | "snapchat"
  | "other";

export type FameCreator = {
  id: string;
  /** Display name */
  name: string;
  /** Primary handle — shown full size on the card */
  handle: string;
  platform: FamePlatform;
  /** Link to their content (video / post) */
  workUrl: string;
  /** Optional profile URL (defaults derived for major platforms) */
  profileUrl?: string;
  /** 16:9 thumbnail of their work — YouTube auto-fills from workUrl if omitted */
  thumbnailUrl?: string;
  /** Short note e.g. "1.8k views" or video title */
  blurb?: string;
  /** Optional content title under the thumbnail */
  title?: string;
  /** Highlight on the wall */
  featured?: boolean;
};

/** Add new creators here — newest first is a good default */
export const WALL_OF_FAME: FameCreator[] = [
  {
    id: "1",
    name: "Astro Bull Official",
    handle: "@ASTROBULL.ROBINHOOD",
    platform: "youtube",
    workUrl: "https://youtu.be/v-s0HZgFKu8",
    profileUrl: "https://www.youtube.com/@ASTROBULL.ROBINHOOD",
    title: "Chapter 1 — Breaking the Chains",
    blurb: "Official channel cut",
    featured: true,
  },
  {
    id: "2",
    name: "Astro Bull TikTok",
    handle: "@astrobull.robinho",
    platform: "tiktok",
    workUrl: "https://vm.tiktok.com/ZN8d2Uqjb/",
    profileUrl: "https://www.tiktok.com/@astrobull.robinho",
    title: "Herd energy drop",
    blurb: "1.8k+ views",
    thumbnailUrl: "/astrobull-note.jpg",
    featured: true,
  },
];

export function platformLabel(p: FamePlatform): string {
  switch (p) {
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "instagram":
      return "Instagram";
    case "x":
      return "X";
    case "snapchat":
      return "Snapchat";
    default:
      return "Social";
  }
}

export function profileFromHandle(c: FameCreator): string | undefined {
  if (c.profileUrl) return c.profileUrl;
  const h = c.handle.replace(/^@/, "").trim();
  if (!h) return undefined;
  switch (c.platform) {
    case "tiktok":
      return `https://www.tiktok.com/@${h}`;
    case "youtube":
      return `https://www.youtube.com/@${h}`;
    case "instagram":
      return `https://www.instagram.com/${h}`;
    case "x":
      return `https://x.com/${h}`;
    case "snapchat":
      return `https://www.snapchat.com/add/${h}`;
    default:
      return undefined;
  }
}

/** Extract YouTube video id from common URL shapes */
export function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const embed = parts.indexOf("embed");
      if (embed >= 0 && parts[embed + 1]) return parts[embed + 1]!;
      const shorts = parts.indexOf("shorts");
      if (shorts >= 0 && parts[shorts + 1]) return parts[shorts + 1]!;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Best available thumbnail for a creator card */
export function thumbnailFor(c: FameCreator): string | null {
  if (c.thumbnailUrl) return c.thumbnailUrl;
  const yt = youtubeIdFromUrl(c.workUrl);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  return null;
}

export function displayHandle(c: FameCreator): string {
  return c.handle.startsWith("@") ? c.handle : `@${c.handle}`;
}
