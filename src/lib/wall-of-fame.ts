/**
 * Wall of Fame — featured creators who posted Astro Bull content
 * on socials. Edit this list anytime, then redeploy.
 *
 * workUrl  = direct link to their video / post
 * handle   = @username (with or without @)
 * platform = where the work lives
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
  handle: string;
  platform: FamePlatform;
  /** Link to their content (video / post) */
  workUrl: string;
  /** Optional profile URL (defaults derived for major platforms) */
  profileUrl?: string;
  /** Short note e.g. "1.8k views" or "Featured reel" */
  blurb?: string;
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
    blurb: "Featured channel cut",
    featured: true,
  },
  {
    id: "2",
    name: "Astro Bull TikTok",
    handle: "@astrobull.robinho",
    platform: "tiktok",
    workUrl: "https://vm.tiktok.com/ZN8d2Uqjb/",
    profileUrl: "https://www.tiktok.com/@astrobull.robinho",
    blurb: "1.8k+ views · herd energy",
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
