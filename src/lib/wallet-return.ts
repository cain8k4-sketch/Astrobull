const AWAIT_KEY = "astrobull.wc.awaiting";
const EVENT = "astrobull-wallet-return";

export type WalletReturnPhase = "idle" | "awaiting" | "connected" | "error";

export type WalletReturnState = {
  phase: WalletReturnPhase;
  message: string | null;
  address?: string;
};

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function markAwaitingWalletReturn() {
  try {
    sessionStorage.setItem(AWAIT_KEY, "1");
  } catch {
    /* ignore */
  }
  emit();
}

export function clearAwaitingWalletReturn() {
  try {
    sessionStorage.removeItem(AWAIT_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function isAwaitingWalletReturn() {
  try {
    return sessionStorage.getItem(AWAIT_KEY) === "1";
  } catch {
    return false;
  }
}

export function subscribeWalletReturn(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

export const WALLET_RETURN_COPY = {
  awaiting:
    "Approve in your wallet, then switch back to this browser tab. We will finish linking when you return.",
  phantomHint:
    "Phantom is not recommended for Robinhood Chain — prefer MetaMask or Trust. If you already approved in Phantom, return to this tab.",
  success: (short: string) => `Connected ${short}. Welcome back — session linked.`,
  trust:
    "Trust users: tap Trust in the list for QR, or use Scan QR. If the deep link stays in the wallet, open astrobull.xyz inside Trust Browser.",
} as const;
