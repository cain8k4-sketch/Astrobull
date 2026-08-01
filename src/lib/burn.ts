/** Live on-chain burn read for Astro Bull on Robinhood Chain. */

export const TOKEN = "0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03";
/** Standard EVM burn sink */
export const BURN_DEAD = "0x000000000000000000000000000000000000dEaD";
/** Zero-address burns (some projects use this) */
export const BURN_ZERO = "0x0000000000000000000000000000000000000000";
/** Project dev wallet (does not sell — burns) */
export const DEV_WALLET = "0x0a5f25a3dd2d707abe9b43393f01fc80655a733f";

/** Official public RPC */
export const RH_RPCS = [
  "https://rpc.mainnet.chain.robinhood.com",
  "https://robinhood-rpc.publicnode.com",
] as const;

export const TOKEN_DECIMALS = 18;

/**
 * Project-reported burn total from official burn activity
 * ($ASTROBULL · 23 txs · ~11.67M)
 */
export const DOCUMENTED_BURNT = 11_670_000;
export const BURN_TX_COUNT = 23;

const BALANCE_OF = "0x70a08231";
const TOTAL_SUPPLY = "0x18160ddd";

function padAddress(addr: string): string {
  return addr.replace(/^0x/i, "").toLowerCase().padStart(64, "0");
}

async function ethCall(
  rpc: string,
  to: string,
  data: string,
): Promise<string | null> {
  try {
    const res = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [{ to, data }, "latest"],
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string; error?: unknown };
    if (!json.result || typeof json.result !== "string") return null;
    return json.result;
  } catch {
    return null;
  }
}

function hexToTokens(hex: string, decimals = TOKEN_DECIMALS): number {
  try {
    const raw = BigInt(hex);
    const base = 10n ** BigInt(decimals);
    return Number(raw / base);
  } catch {
    return 0;
  }
}

export type BurnSnapshot = {
  dead: number;
  zero: number;
  devBalance: number;
  onChainTotal: number;
  totalSupply: number;
  rpc: string;
  updatedAt: string;
};

export async function fetchLiveBurn(): Promise<BurnSnapshot | null> {
  for (const rpc of RH_RPCS) {
    const deadHex = await ethCall(
      rpc,
      TOKEN,
      BALANCE_OF + padAddress(BURN_DEAD),
    );
    if (deadHex == null) continue;

    const zeroHex = await ethCall(
      rpc,
      TOKEN,
      BALANCE_OF + padAddress(BURN_ZERO),
    );
    const devHex = await ethCall(
      rpc,
      TOKEN,
      BALANCE_OF + padAddress(DEV_WALLET),
    );
    const supplyHex = await ethCall(rpc, TOKEN, TOTAL_SUPPLY);

    const dead = hexToTokens(deadHex);
    const zero = zeroHex ? hexToTokens(zeroHex) : 0;
    const devBalance = devHex ? hexToTokens(devHex) : 0;
    const totalSupply = supplyHex ? hexToTokens(supplyHex) : 1_000_000_000;

    return {
      dead,
      zero,
      devBalance,
      onChainTotal: dead + zero,
      totalSupply,
      rpc,
      updatedAt: new Date().toISOString(),
    };
  }
  return null;
}

export function formatTokens(n: number): string {
  return Math.floor(n).toLocaleString("en-US");
}

/** Human short form e.g. 11.67M */
export function formatTokensShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    // keep 2 decimals for values under 100M (11.67M not 11.7M)
    const s = m >= 100 ? m.toFixed(1) : m.toFixed(2);
    return `${s.replace(/\.?0+$/, "")}M`;
  }
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return formatTokens(n);
}
