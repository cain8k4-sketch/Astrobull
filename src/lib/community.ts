/**
 * Community / creator links — single source of truth.
 *
 * Content drop: private TG group — videos / images / clips only.
 * Files stay on Telegram’s servers — no website upload mess.
 *
 * Override with VITE_TG_CONTENT_UPLOAD_URL / VITE_TG_MAIN_URL in Vercel if needed.
 */

export const TG_MAIN =
  (import.meta.env.VITE_TG_MAIN_URL as string | undefined)?.trim() ||
  "https://t.me/Official_Astrobull_Robinhood";

/** Content-only creator upload — private group */
export const TG_CONTENT_UPLOAD =
  (import.meta.env.VITE_TG_CONTENT_UPLOAD_URL as string | undefined)?.trim() ||
  "https://t.me/+W2uA9TEBfK5iMzA8";

export const TG_CONTENT_LABEL = "Drop content on Telegram";
export const TG_CONTENT_SUB =
  "Content only · private group · video / image / clips · saved on Telegram · no site upload";
