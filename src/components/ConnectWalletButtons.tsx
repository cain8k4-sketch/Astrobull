import { useEffect, useRef, useState } from "react";
import { ExternalLink, QrCode, Wallet } from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";
import {
  hasWalletConnectProjectId,
  metamaskDappLink,
} from "@/lib/wagmi";
import { connectWallet, openWalletModal, saveWallet, shortAddr } from "@/lib/wallet";
import { WALLET_RETURN_COPY } from "@/lib/wallet-return";
import { useWalletReturn } from "@/hooks/use-wallet-return";
import { InlineStatusText, type InlineStatus } from "@/components/InlineStatus";

const TONES = {
  yellow: "bg-gold text-black hover:bg-[#ffe14d]",
  green: "bg-green text-black hover:bg-green/90",
  red: "bg-red text-white hover:bg-red-hot",
} as const;

type Tone = keyof typeof TONES;

type Props = {
  onConnected?: (address: string) => void;
  tone?: Tone;
  connectLabel?: string;
  fullWidth?: boolean;
  showMobileHelpers?: boolean;
};

export function ConnectWalletButtons({
  onConnected,
  tone = "yellow",
  connectLabel = "Connect wallet",
  fullWidth = false,
  showMobileHelpers = false,
}: Props) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { connectAsync, connectors } = useConnect();
  const seen = useRef("");
  const [qrBusy, setQrBusy] = useState(false);
  const [local, setLocal] = useState<InlineStatus | null>(null);
  const { awaiting, justConnected, message, beginAwaiting } = useWalletReturn();

  useEffect(() => {
    if (!isConnected || !address) return;
    if (seen.current.toLowerCase() === address.toLowerCase()) return;
    seen.current = address;
    saveWallet(address);
    onConnected?.(address);
  }, [address, isConnected, onConnected]);

  function startConnectUi() {
    beginAwaiting();
    setLocal({
      kind: "info",
      text: WALLET_RETURN_COPY.awaiting,
    });
  }

  function onClickConnect() {
    setLocal(null);
    if (isConnected && address) {
      saveWallet(address);
      onConnected?.(address);
      return;
    }
    startConnectUi();
    if (openConnectModal) {
      openConnectModal();
      return;
    }
    if (openWalletModal()) return;
    void connectWallet()
      .then((addr) => {
        saveWallet(addr);
        onConnected?.(addr);
      })
      .catch((e) => {
        const m = e instanceof Error ? e.message : "Connect failed.";
        setLocal({
          kind: "err",
          text: m === "NO_WALLET" ? "No injected wallet. Use Scan QR or Open in MetaMask." : m,
        });
      });
  }

  async function onScanQr() {
    setLocal(null);
    if (!hasWalletConnectProjectId()) {
      setLocal({ kind: "err", text: "WalletConnect project id missing." });
      return;
    }
    startConnectUi();
    setQrBusy(true);
    try {
      const wc =
        connectors.find((c) => c.id === "walletConnect") ??
        connectors.find((c) => c.name.toLowerCase().includes("walletconnect"));
      if (!wc) {
        if (openConnectModal) {
          openConnectModal();
          return;
        }
        throw new Error("WalletConnect connector not ready.");
      }
      const result = await connectAsync({ connector: wc });
      const addr = result.accounts[0];
      if (!addr) throw new Error("WalletConnect returned no account.");
      saveWallet(addr);
      onConnected?.(addr);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "WalletConnect failed.";
      const blocked = /publish custom payload|unauthorized|not been authorized|project id/i.test(
        raw,
      );
      setLocal({
        kind: "err",
        text: blocked
          ? "WalletConnect blocked for this domain. Add astrobull.xyz on Reown Cloud allowlist, or open this page inside Trust/MetaMask Browser."
          : raw,
      });
    } finally {
      setQrBusy(false);
    }
  }

  const status: InlineStatus | null = local
    ? local
    : justConnected && address
      ? { kind: "ok", text: WALLET_RETURN_COPY.success(shortAddr(address)) }
      : awaiting && message
        ? { kind: "info", text: message }
        : null;

  return (
    <div className={cn("space-y-2", fullWidth && "w-full")}>
      <button
        type="button"
        onClick={onClickConnect}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest",
          TONES[tone],
          fullWidth && "w-full min-h-11 py-3.5",
        )}
      >
        <Wallet size={14} />
        {isConnected && address ? `Connected ${shortAddr(address)}` : connectLabel}
      </button>

      {showMobileHelpers ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={qrBusy}
            onClick={() => void onScanQr()}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-green/50 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-green disabled:opacity-50"
          >
            <QrCode size={14} />
            {qrBusy ? "Opening QR…" : "Scan QR (WalletConnect)"}
          </button>
          <a
            href={metamaskDappLink()}
            className="inline-flex min-h-10 items-center justify-center gap-2 border border-white/25 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-white no-underline"
          >
            <ExternalLink size={14} />
            Open in MetaMask
          </a>
        </div>
      ) : null}

      {showMobileHelpers ? (
        <div className="space-y-1">
          <p className="font-mono text-[10px] leading-relaxed text-muted">
            {WALLET_RETURN_COPY.trust}
          </p>
          <p className="font-mono text-[10px] leading-relaxed text-gold">
            {WALLET_RETURN_COPY.phantomHint}
          </p>
        </div>
      ) : null}

      <InlineStatusText status={status} />
    </div>
  );
}

export function WalletConnectAutoModal({
  open,
  onClose,
  onConnected,
}: {
  open: boolean;
  onClose: () => void;
  onConnected: (address: string) => void;
}) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const opened = useRef(false);
  const { beginAwaiting } = useWalletReturn();

  useEffect(() => {
    if (!open) {
      opened.current = false;
      return;
    }
    if (isConnected && address) {
      onConnected(address);
      onClose();
      return;
    }
    if (opened.current) return;
    opened.current = true;
    beginAwaiting();
    const t = window.setTimeout(() => {
      if (openConnectModal) openConnectModal();
      else openWalletModal();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, isConnected, address, openConnectModal, onConnected, onClose, beginAwaiting]);

  return null;
}
