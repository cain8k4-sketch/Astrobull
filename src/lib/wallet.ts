const STORAGE = "astrobull.wallet.v1";

export const PHANTOM_DOWNLOAD = "https://phantom.app/download";
export const PHANTOM_HOME = "https://phantom.app/";

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
  isPhantom?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getProvider(): EthProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    phantom?: { ethereum?: EthProvider };
    ethereum?: EthProvider & { providers?: EthProvider[] };
  };
  if (w.phantom?.ethereum) return w.phantom.ethereum;
  if (w.ethereum?.isPhantom) return w.ethereum;
  if (w.ethereum?.providers?.length) {
    const p = w.ethereum.providers.find((x) => x.isPhantom);
    if (p) return p;
  }
  // Fallback: any injected EVM wallet
  if (w.ethereum) return w.ethereum;
  return null;
}

export function hasInjectedWallet() {
  return !!getProvider();
}

export function isPhantomInstalled() {
  if (typeof window === "undefined") return false;
  const w = window as Window & { phantom?: { ethereum?: EthProvider } };
  return !!w.phantom?.ethereum || !!(getProvider()?.isPhantom);
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
