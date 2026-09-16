import { type ReactNode, useEffect, useState } from "react";
import { RainbowKitProvider, darkTheme, useConnectModal } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useReconnect } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { getWagmiConfig, robinhoodChain } from "@/lib/wagmi";
import { registerConnectModal, saveWallet, shortAddr } from "@/lib/wallet";
import {
  clearAwaitingWalletReturn,
  isAwaitingWalletReturn,
  WALLET_RETURN_COPY,
} from "@/lib/wallet-return";
import { useWalletReturn } from "@/hooks/use-wallet-return";
import { InlineStatusText } from "@/components/InlineStatus";

function WalletSessionBridge() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { reconnect } = useReconnect();

  useEffect(() => {
    registerConnectModal(openConnectModal ?? null);
    return () => registerConnectModal(null);
  }, [openConnectModal]);

  useEffect(() => {
    void reconnect();
  }, [reconnect]);

  useEffect(() => {
    if (isConnected && address) saveWallet(address);
  }, [isConnected, address]);

  return null;
}

function WalletReturnBanner() {
  const { awaiting, justConnected, message, address } = useWalletReturn();
  if (!message && !awaiting && !justConnected) return null;
  return (
    <div
      className="sticky top-0 z-[60] border-b border-green/30 bg-black/90 px-4 py-2.5"
      role="status"
    >
      <InlineStatusText
        status={{
          kind: justConnected ? "ok" : awaiting ? "info" : "info",
          text:
            message ??
            (justConnected && address
              ? WALLET_RETURN_COPY.success(shortAddr(address))
              : WALLET_RETURN_COPY.awaiting),
        }}
      />
      {awaiting && isAwaitingWalletReturn() ? (
        <p className="mt-1 font-mono text-[10px] text-gold">
          {WALLET_RETURN_COPY.phantomHint}
        </p>
      ) : null}
    </div>
  );
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [config] = useState(() => getWagmiConfig());

  return (
    <WagmiProvider config={config} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#00ff66",
            accentColorForeground: "#050505",
            borderRadius: "small",
            fontStack: "system",
            overlayBlur: "small",
          })}
          initialChain={robinhoodChain}
          modalSize="wide"
          appInfo={{
            appName: "AstroBull",
            learnMoreUrl: "https://astrobull.xyz",
          }}
        >
          <WalletSessionBridge />
          <WalletReturnBanner />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { clearAwaitingWalletReturn };
