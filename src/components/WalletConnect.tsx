import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Unplug, Wallet } from "lucide-react";
import {
  PHANTOM_DOWNLOAD,
  connectWallet,
  hasInjectedWallet,
  isPhantomInstalled,
  isValidEthAddress,
  loadWallet,
  saveWallet,
  shortAddr,
} from "@/lib/wallet";
import { cn } from "@/lib/utils";

export default function WalletConnect() {
  const [address, setAddress] = useState("");
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasInjected, setHasInjected] = useState(false);
  const [phantom, setPhantom] = useState(false);

  useEffect(() => {
    setAddress(loadWallet());
    setHasInjected(hasInjectedWallet());
    setPhantom(isPhantomInstalled());
  }, []);

  async function onConnect() {
    setErr(null);
    setMsg(null);
    setBusy(true);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      setMsg("Wallet connected. Payouts can route here when the pool is live.");
      setHasInjected(true);
      setPhantom(isPhantomInstalled());
    } catch (e) {
      const m = e instanceof Error ? e.message : "Connect failed";
      if (m === "NO_WALLET") {
        setErr("No wallet found in this browser. Create one with Phantom below.");
      } else {
        setErr(m);
      }
    } finally {
      setBusy(false);
    }
  }

  function onSaveManual() {
    setErr(null);
    setMsg(null);
    const a = manual.trim();
    if (!isValidEthAddress(a)) {
      setErr("Enter a valid 0x… address (42 characters).");
      return;
    }
    saveWallet(a);
    setAddress(a);
    setManual("");
    setMsg("Address saved on this device for future payouts.");
  }

  function onDisconnect() {
    saveWallet("");
    setAddress("");
    setMsg("Wallet cleared from this device.");
  }

  async function onCopy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="mb-6 rounded-md border border-green/40 bg-green/5 p-5 md:p-6">
      <div className="mb-1 flex items-center gap-2">
        <Wallet size={16} className="text-green" />
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-green">
          Payout wallet
        </p>
      </div>
      <h2 className="font-display text-xl uppercase text-fg sm:text-2xl">
        Connect or create a wallet
      </h2>
      <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
        Link a wallet so you can get paid in{" "}
        <span className="text-fg">USDC / USDT</span> (and Robinhood-chain assets)
        when verified performance hits the <span className="text-green">$50 threshold</span>.{" "}
        <span className="text-green">Holding $ASTROBULL is optional.</span>
      </p>

      {address ? (
        <div className="mt-4 border border-green/40 bg-bg/70 px-3 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-green">
            Connected
          </p>
          <div className="mt-1 flex items-start gap-2">
            <code className="flex-1 break-all font-mono text-xs text-fg sm:text-sm">
              {address}
            </code>
            <button
              type="button"
              onClick={() => void onCopy()}
              className="shrink-0 text-muted hover:text-fg"
              aria-label="Copy address"
            >
              {copied ? (
                <Check size={14} className="text-green" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted">
            {shortAddr(address)} · saved on this device
          </p>
          <button
            type="button"
            onClick={onDisconnect}
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-red hover:underline"
          >
            <Unplug size={12} /> Disconnect
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={busy}
              onClick={() => void onConnect()}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-red px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(255,0,51,0.3)] disabled:opacity-55",
              )}
            >
              <Wallet size={14} />
              {busy
                ? "Connecting…"
                : hasInjected
                  ? phantom
                    ? "Connect Phantom"
                    : "Connect wallet"
                  : "Connect wallet"}
            </button>
            <a
              href={PHANTOM_DOWNLOAD}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-green/50 px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-green no-underline hover:bg-green/10"
            >
              <ExternalLink size={14} />
              {hasInjected ? "Get Phantom app" : "Create wallet (Phantom)"}
            </a>
          </div>

          {!hasInjected ? (
            <p className="font-mono text-[11px] leading-relaxed text-muted">
              No wallet detected. Tap{" "}
              <strong className="text-green">Create wallet (Phantom)</strong> —
              free, takes about a minute. Come back here and hit Connect.
            </p>
          ) : (
            <p className="font-mono text-[11px] text-muted">
              Wallet extension detected
              {phantom ? " (Phantom)" : ""}. Connect to save your payout address.
            </p>
          )}

          <div className="border-t border-white/10 pt-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
              Or paste an address
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder="0x…"
                className="flex-1 rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none focus:border-green"
              />
              <button
                type="button"
                onClick={onSaveManual}
                className="rounded-sm border border-white/20 px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-fg hover:border-green/50"
              >
                Save address
              </button>
            </div>
          </div>
        </div>
      )}

      {msg ? (
        <p className="mt-3 font-mono text-xs text-green">{msg}</p>
      ) : null}
      {err ? (
        <p className="mt-3 font-mono text-xs text-red-hot">{err}</p>
      ) : null}
    </section>
  );
}
