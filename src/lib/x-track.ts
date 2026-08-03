/** Track main AstroBull X account — posts, mentions, retweets (open search + optional snapshots). */

export const MAIN_X_HANDLE = "AstroBull_RH";
export const MAIN_X_URL = `https://x.com/${MAIN_X_HANDLE}`;

const SNAP_KEY = "astrobull.x.track.snap.v1";

export type XTrackSnapshot = {
  posts: number | null;
  mentions: number | null;
  retweets: number | null;
  note: string;
  updatedAt: string;
};

/** Live search / profile deep links (works without API keys). */
export function xProfileUrl(handle = MAIN_X_HANDLE) {
  return `https://x.com/${handle.replace(/^@/, "")}`;
}

export function xPostsSearchUrl(handle = MAIN_X_HANDLE) {
  const h = handle.replace(/^@/, "");
  return `https://x.com/search?q=from%3A${encodeURIComponent(h)}&src=typed_query&f=live`;
}

export function xMentionsSearchUrl(handle = MAIN_X_HANDLE) {
  const h = handle.replace(/^@/, "");
  return `https://x.com/search?q=%40${encodeURIComponent(h)}%20-from%3A${encodeURIComponent(h)}&src=typed_query&f=live`;
}

export function xRetweetsSearchUrl(handle = MAIN_X_HANDLE) {
  const h = handle.replace(/^@/, "");
  // filter:nativeretweets on posts from the account
  return `https://x.com/search?q=from%3A${encodeURIComponent(h)}%20filter%3Anativeretweets&src=typed_query&f=live`;
}

export function xRepliesSearchUrl(handle = MAIN_X_HANDLE) {
  const h = handle.replace(/^@/, "");
  return `https://x.com/search?q=to%3A${encodeURIComponent(h)}&src=typed_query&f=live`;
}

export function loadXSnapshot(): XTrackSnapshot {
  try {
    const raw = localStorage.getItem(SNAP_KEY);
    if (raw) {
      const p = JSON.parse(raw) as XTrackSnapshot;
      if (p && typeof p === "object") return p;
    }
  } catch {
    /* ignore */
  }
  return {
    posts: null,
    mentions: null,
    retweets: null,
    note: "Open the live X searches below. Save a snapshot when you count stats.",
    updatedAt: "",
  };
}

export function saveXSnapshot(snap: Partial<XTrackSnapshot>): XTrackSnapshot {
  const next: XTrackSnapshot = {
    ...loadXSnapshot(),
    ...snap,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SNAP_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
