const STORAGE = "astrobull.wallet.v1";

export const METAMASK_DOWNLOAD = "https://metamask.io/download/";
export const UNISWAP_SWAP = `https://app.uniswap.org/swap?outputCurrency=0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03`;
export const BOW_BUY =
  "https://bow.fun/?token=0x5987dbf316dcefb6d0d35ee8f6884a0a1f12cb03";

/** Robinhood Chain — for add-network prompts */
export const RH_CHAIN = {
  chainId: "0x1237", // 4663
  chainName: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
  blockExplorerUrls: ["https://robinscan.io"],
} as const;

export function loadWallet(): string {
  try {
    return localStorage.getItem(STORAGE) || "";
  } catch {
    return "";
  }
}

export function saveWallet(address: string) {
  try {
    if (address) localStorage.setItem(STORAGE, address);
    else localStorage.removeItem(STORAGE);
  } catch {
    /* ignore */
  }
}

export function shortAddr(a: string) {
  if (!a || a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function isValidEthAddress(a: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(a.trim());
}

type EthProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getProvider(): EthProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    ethereum?: EthProvider & { providers?: EthProvider[] };
  };
  if (w.ethereum?.providers?.length) {
    const mm = w.ethereum.providers.find((x) => x.isMetaMask);
    if (mm) return mm;
    return w.ethereum.providers[0] ?? null;
  }
  if (w.ethereum) return w.ethereum;
  return null;
}

export function hasInjectedWallet() {
  return !!getProvider();
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  if (!provider) {
    throw new Error("NO_WALLET");
  }
  const accounts = (await provider.request({
    method: "eth_requestAccounts",
  })) as string[];
  const addr = accounts?.[0];
  if (!addr) throw new Error("No account returned.");

  // Best-effort: switch / add Robinhood Chain
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: RH_CHAIN.chainId }],
    });
  } catch (e) {
    const err = e as { code?: number };
    if (err?.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [RH_CHAIN],
        });
      } catch {
        /* user can add later */
      }
    }
  }

  saveWallet(addr);
  return addr;
}
