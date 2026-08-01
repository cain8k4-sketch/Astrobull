/** Creator activity leaderboard — demo until live stats land in Supabase */

import { getSupabaseConfig, supabaseHeaders } from "./supabase";

export type LeaderboardEntry = {
  id: string;
  rank?: number;
  name: string;
  handle: string;
  platform: "TikTok" | "YouTube" | "Snapchat" | "X" | "Multi";
  posts: number;
  views: number;
  points: number;
  earnedUsd: number;
  featured: boolean;
};

const STORAGE = "astrobull.leaderboard.v1";

/** Pre-launch herd — replaced by live rows when Supabase is connected */
export const DEMO_LEADERS: LeaderboardEntry[] = [
  {
    id: "demo-1",
    name: "ChainBreaker",
    handle: "@chainbreaker.astro",
    platform: "TikTok",
    posts: 14,
    views: 182_400,
    points: 9_420,
    earnedUsd: 38.5,
    featured: true,
  },
  {
    id: "demo-2",
    name: "HerdVoice",
    handle: "@herdvoice",
    platform: "YouTube",
    posts: 9,
    views: 141_200,
    points: 7_880,
    earnedUsd: 31.0,
    featured: true,
  },
  {
    id: "demo-3",
    name: "NeonHoof",
    handle: "@neonhoof",
    platform: "Snapchat",
    posts: 22,
    views: 98_600,
    points: 6_150,
    earnedUsd: 24.2,
    featured: false,
  },
  {
    id: "demo-4",
    name: "MooonRunner",
    handle: "@mooonrunner",
    platform: "Multi",
    posts: 11,
    views: 76_300,
    points: 4_920,
    earnedUsd: 18.75,
    featured: true,
  },
  {
    id: "demo-5",
    name: "ScarMask",
    handle: "@scarmask.rh",
    platform: "TikTok",
    posts: 8,
    views: 54_100,
    points: 3_440,
    earnedUsd: 12.1,
    featured: false,
  },
  {
    id: "demo-6",
    name: "FeatherGlow",
    handle: "@featherglow",
    platform: "YouTube",
    posts: 6,
    views: 41_800,
    points: 2_710,
    earnedUsd: 9.4,
    featured: false,
  },
  {
    id: "demo-7",
    name: "Deadlink",
    handle: "@deadlink.astro",
    platform: "X",
    posts: 19,
    views: 33_200,
    points: 2_180,
    earnedUsd: 6.8,
    featured: false,
  },
  {
    id: "demo-8",
    name: "Paty99",
    handle: "@paty99cents",
    platform: "TikTok",
    posts: 5,
    views: 21_500,
    points: 1_420,
    earnedUsd: 4.2,
    featured: false,
  },
];

export function scoreEntry(e: Omit<LeaderboardEntry, "points" | "id"> & { id?: string }): number {
  return Math.round(
    e.views * 0.04 + e.posts * 80 + e.earnedUsd * 25 + (e.featured ? 400 : 0),
  );
}

export function rankEntries(list: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...list]
    .map((e) => ({
      ...e,
      points: e.points || scoreEntry(e),
    }))
    .sort((a, b) => b.points - a.points || b.views - a.views)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) {
      const parsed = JSON.parse(raw) as LeaderboardEntry[];
      if (Array.isArray(parsed) && parsed.length) return rankEntries(parsed);
    }
  } catch {
    /* ignore */
  }
  return rankEntries(DEMO_LEADERS);
}

export function saveLeaderboard(list: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(rankEntries(list)));
  } catch {
    /* ignore */
  }
}

export function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

export function formatUsd(n: number) {
  return `$${n.toFixed(n >= 10 ? 0 : 2)}`;
}

/** Live fetch from Supabase table `leaderboard` */
export async function fetchLiveLeaderboard(): Promise<{
  rows: LeaderboardEntry[];
  source: "live" | "demo";
  message?: string;
}> {
  const cfg = getSupabaseConfig();
  if (!cfg) {
    return { rows: loadLeaderboard(), source: "demo" };
  }

  try {
    const res = await fetch(
      `${cfg.url}/rest/v1/leaderboard?select=*&order=points.desc&limit=50`,
      { headers: supabaseHeaders(cfg.key) },
    );
    if (!res.ok) {
      return {
        rows: loadLeaderboard(),
        source: "demo",
        message: `Live table not ready (${res.status}) — showing preview herd`,
      };
    }
    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      return {
        rows: loadLeaderboard(),
        source: "demo",
        message: "Live table empty — preview herd until first stats land",
      };
    }
    const rows = rankEntries(
      data.map((r, i) => ({
        id: String(r.id ?? r.wallet ?? i),
        name: String(r.name ?? r.creator_name ?? "Creator"),
        handle: String(r.handle ?? r.handle_tiktok ?? r.handle_youtube ?? "—"),
        platform: (String(r.platform ?? "Multi") as LeaderboardEntry["platform"]) || "Multi",
        posts: Number(r.posts ?? r.post_count ?? 0),
        views: Number(r.views ?? r.total_views ?? 0),
        points: Number(r.points ?? 0),
        earnedUsd: Number(r.earned_usd ?? r.total_earned ?? 0),
        featured: Boolean(r.featured),
      })),
    );
    return { rows, source: "live" };
  } catch {
    return {
      rows: loadLeaderboard(),
      source: "demo",
      message: "Could not reach live DB — preview herd",
    };
  }
}
