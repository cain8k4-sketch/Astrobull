/**
 * Community / creator links — single source of truth.
 *
 * Content drop: creators send video/image/clips in Telegram only.
 * Files stay on Telegram’s servers — no website upload mess.
 *
 * Set VITE_TG_CONTENT_UPLOAD_URL in Vercel to a dedicated content-only
 * group/channel invite (recommended). Falls back to the main herd chat.
 */

export const TG_MAIN =
  (import.meta.env.VITE_TG_MAIN_URL as string | undefined)?.trim() ||
  "https://t.me/Official_Astrobull_Robinhood";

/** Content-only creator upload chat (Telegram) */
export const TG_CONTENT_UPLOAD =
  (import.meta.env.VITE_TG_CONTENT_UPLOAD_URL as string | undefined)?.trim() ||
  TG_MAIN;

export const TG_CONTENT_LABEL = "Drop content on Telegram";
export const TG_CONTENT_SUB =
  "Content only · video / image / clips · saved on Telegram · no site upload";
