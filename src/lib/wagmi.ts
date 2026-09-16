import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { defineChain } from "viem";

/** Public WalletConnect Cloud project id (already in the live frontend bundle). */
const LIVE_WC_PROJECT_ID = "0c3775cf5cd130f1c2f9397425313ee6";

export const SITE_ORIGIN = "https://astrobull.xyz";
export const ROBINHOOD_CHAIN_ID = 4663;

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: "Robinhood Chain",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: { name: "RobinScan", url: "https://robinscan.io" },
  },
});

export function getWalletConnectProjectId() {
  const fromEnv = (
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined
  )?.trim();
  return fromEnv || LIVE_WC_PROJECT_ID;
}

export function hasWalletConnectProjectId() {
  return getWalletConnectProjectId().length > 8;
}

export function walletConnectMetadata() {
  return {
    name: "AstroBull",
    description: "AstroBull campaigns, launchpad, and herd.",
    url: SITE_ORIGIN,
    icons: [`${SITE_ORIGIN}/favicon.svg`],
  };
}

export function metamaskDappLink(href?: string) {
  const fallback = `${SITE_ORIGIN}/`;
  const raw = href || (typeof window !== "undefined" ? window.location.href : fallback);
  try {
    const url = new URL(raw, SITE_ORIGIN);
    if (url.protocol !== "https:") return url.href;
    return `https://metamask.app.link/dapp/${url.host}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "https://metamask.app.link/dapp/astrobull.xyz/";
  }
}

export function createWagmiConfig() {
  const projectId = getWalletConnectProjectId();
  const meta = walletConnectMetadata();
  return getDefaultConfig({
    appName: meta.name,
    projectId,
    appDescription: meta.description,
    appUrl: meta.url,
    appIcon: meta.icons[0],
    wallets: [
      {
        groupName: "Recommended",
        wallets: [metaMaskWallet, trustWallet, rainbowWallet],
      },
      {
        groupName: "WalletConnect",
        wallets: [walletConnectWallet, coinbaseWallet, injectedWallet],
      },
    ],
    chains: [mainnet, robinhoodChain],
    transports: {
      [mainnet.id]: http(),
      [robinhoodChain.id]: http(robinhoodChain.rpcUrls.default.http[0]),
    },
    ssr: true,
    walletConnectParameters: {
      metadata: meta,
      qrModalOptions: {
        themeMode: "dark",
        themeVariables: { "--wcm-z-index": "10000" },
      },
    },
  });
}

let cached: ReturnType<typeof createWagmiConfig> | null = null;

export function getWagmiConfig() {
  if (!cached) cached = createWagmiConfig();
  return cached;
}
