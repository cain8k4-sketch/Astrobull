import { useCallback, useEffect, useState } from "react";
import { useAccount, useReconnect } from "wagmi";
import {
  clearAwaitingWalletReturn,
  isAwaitingWalletReturn,
  markAwaitingWalletReturn,
  subscribeWalletReturn,
  WALLET_RETURN_COPY,
} from "@/lib/wallet-return";
import { saveWallet, shortAddr } from "@/lib/wallet";

export function useWalletReturn() {
  const { address, isConnected } = useAccount();
  const { reconnectAsync } = useReconnect();
  const [awaiting, setAwaiting] = useState(false);
  const [justConnected, setJustConnected] = useState(false);

  useEffect(() => {
    const sync = () => setAwaiting(isAwaitingWalletReturn());
    sync();
    return subscribeWalletReturn(sync);
  }, []);

  const beginAwaiting = useCallback(() => {
    markAwaitingWalletReturn();
    setAwaiting(true);
    setJustConnected(false);
  }, []);

  const tryReconnect = useCallback(async () => {
    try {
      await reconnectAsync();
    } catch {
      /* session may still land via wagmi later */
    }
  }, [reconnectAsync]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onReturn = () => {
      if (document.visibilityState && document.hidden) return;
      void tryReconnect();
    };
    const onVis = () => {
      if (!document.hidden) void tryReconnect();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pageshow", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pageshow", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [tryReconnect]);

  useEffect(() => {
    if (!isConnected || !address) return;
    saveWallet(address);
    if (isAwaitingWalletReturn()) {
      clearAwaitingWalletReturn();
      setAwaiting(false);
      setJustConnected(true);
    }
  }, [address, isConnected]);

  const message = justConnected && address
    ? WALLET_RETURN_COPY.success(shortAddr(address))
    : awaiting
      ? WALLET_RETURN_COPY.awaiting
      : null;

  return {
    awaiting,
    justConnected,
    message,
    beginAwaiting,
    tryReconnect,
    address,
    isConnected,
  };
}
