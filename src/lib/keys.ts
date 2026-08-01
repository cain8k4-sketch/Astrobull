import type { ProviderId } from "./ai-providers";

const STORAGE = "astrobull.aiKeys.v3";
const UP_STORAGE = "astrobull.uploads.v1";

export type KeyMap = Partial<Record<ProviderId, string>>;

export function loadKeys(): KeyMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) || "{}") as KeyMap;
  } catch {
    return {};
  }
}

export function saveKeys(keys: KeyMap) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(keys));
  } catch {
    /* ignore quota */
  }
}

export function maskKey(k: string) {
  if (!k || k.length < 10) return "••••";
  return `${k.slice(0, 6)}…${k.slice(-4)}`;
}

export interface UploadMeta {
  title: string;
  desc: string;
  type: string;
  name: string;
  size: number;
  mime: string;
  at: string;
}

export function loadUploads(): UploadMeta[] {
  try {
    return JSON.parse(localStorage.getItem(UP_STORAGE) || "[]") as UploadMeta[];
  } catch {
    return [];
  }
}

export function saveUpload(meta: UploadMeta) {
  const list = loadUploads();
  list.unshift(meta);
  try {
    localStorage.setItem(UP_STORAGE, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* ignore */
  }
}
