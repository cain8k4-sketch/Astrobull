import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Check, ExternalLink, UserPlus, Wallet } from "lucide-react";
import {
  METAMASK_DOWNLOAD,
  connectWallet,
  hasInjectedWallet,
  isValidEthAddress,
  loadWallet,
  saveWallet,
  shortAddr,
} from "@/lib/wallet";
import {
  isValidEmail,
  loadLastSignup,
  notifyOwnerAll,
  pushSignupToSupabase,
  saveSignup,
} from "@/lib/signup";
import { cn } from "@/lib/utils";
import TgContentDrop from "@/components/TgContentDrop";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Astro Bull Creators" },
      {
        name: "description",
        content:
          "Join the Astro Bull herd. Name, email, social handles, and Robinhood Chain wallet. Holding optional.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [snap, setSnap] = useState("");
  const [x, setX] = useState("");
  const [ig, setIg] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [hasInjected, setHasInjected] = useState(false);
  const [already, setAlready] = useState<string | null>(null);

  useEffect(() => {
    setWallet(loadWallet());
    setHasInjected(hasInjectedWallet());
    const last = loadLastSignup();
    if (last) {
      setAlready(last.name);
      setName(last.name);
      setEmail(last.email);
      setTiktok(last.handle_tiktok || "");
      setYoutube(last.handle_youtube || "");
      setSnap(last.handle_snapchat || "");
      setX(last.handle_x || "");
      setIg(last.handle_instagram || "");
      if (last.wallet) setWallet(last.wallet);
    }
  }, []);

  async function onConnect() {
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      const addr = await connectWallet();
      setWallet(addr);
      setHasInjected(true);
    } catch (e) {
      const m = e instanceof Error ? e.message : "Connect failed";
      if (m === "NO_WALLET") {
        setErr("No wallet found. Install MetaMask below, then come back.");
      } else {
        setErr(m);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setErr(null);
    setOk(null);

    const n = name.trim();
    const em = email.trim();
    const w = wallet.trim();
    const hTik = tiktok.trim();
    const hYt = youtube.trim();
    const hSnap = snap.trim();
    const hX = x.trim();
    const hIg = ig.trim();

    if (n.length < 2) {
      setErr("Enter your creator name.");
      return;
    }
    if (!isValidEmail(em)) {
      setErr("Enter a valid email.");
      return;
    }
    if (!hTik && !hYt && !hSnap && !hX && !hIg) {
      setErr("Add at least one social handle so we can find your work.");
      return;
    }
    if (!isValidEthAddress(w)) {
      setErr("Connect or paste a valid 0x wallet (42 characters) at the bottom.");
      return;
    }

    setSubmitting(true);
    try {
      saveWallet(w);
      const entry = saveSignup({
        name: n,
        email: em,
        wallet: w,
        handle_tiktok: hTik,
        handle_youtube: hYt,
        handle_snapchat: hSnap,
        handle_x: hX,
        handle_instagram: hIg,
      });

      const cloud = await pushSignupToSupabase(entry);
      const notes = await notifyOwnerAll(entry);

      setAlready(n);
      const notifyBit = notes.email || notes.webhook || notes.mailto ? ` ${notes.detail}.` : "";

      if (cloud.ok) {
        setOk(
          `You're signed up as a creator. Status: pending. Saved to the cloud.${notifyBit} We are all Astro.`,
        );
      } else if (cloud.offline) {
        setOk(
          `You're signed up as a creator. Status: pending. Saved on this device (add Supabase keys for live cloud).${notifyBit}`,
        );
      } else {
        setOk(
          `You're signed up as a creator. Status: pending. Device save OK — cloud note: ${cloud.status || cloud.message || "check RLS"}.${notifyBit}`,
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 md:px-6 md:py-14">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red">
        Creator sign-up
      </p>
      <h1 className="mt-2 font-display text-4xl uppercase leading-none text-fg sm:text-5xl">
        Join the herd
      </h1>
      <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
        Details first, wallet last, then submit. Status starts as{" "}
        <span className="text-green">pending</span>.{" "}
        <span className="text-green">Holding $ASTROBULL is optional.</span>
      </p>

      <div className="mt-5">
        <TgContentDrop variant="banner" />
      </div>

      {already ? (
        <div className="mt-4 border border-green/40 bg-green/10 px-3 py-3 font-mono text-xs text-green">
          Signed up on this device as <strong>{already}</strong>. You can update and
          re-submit anytime.
        </div>
      ) : null}

      <form
        onSubmit={(e) => void onSubmit(e)}
        className="mt-6 space-y-4 rounded-md border-2 border-green/45 bg-gradient-to-b from-green/10 to-black/40 p-5 md:p-6"
        noValidate
      >
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your creator name"
            autoComplete="name"
            className={inputCls}
            required
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            className={inputCls}
            required
          />
        </Field>

        <div className="border-t border-white/10 pt-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red">
            Your social handles
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            At least one required — so we can find and feature you.
          </p>
        </div>

        <Field label="TikTok">
          <input
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="@yourtiktok"
            className={inputCls}
          />
        </Field>
        <Field label="YouTube">
          <input
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="@channel or URL"
            className={inputCls}
          />
        </Field>
        <Field label="Snapchat">
          <input
            value={snap}
            onChange={(e) => setSnap(e.target.value)}
            placeholder="snap username"
            className={inputCls}
          />
        </Field>
        <Field label="X (optional)">
          <input
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="@yourx"
            className={inputCls}
          />
        </Field>
        <Field label="Instagram (optional)">
          <input
            value={ig}
            onChange={(e) => setIg(e.target.value)}
            placeholder="@yourig"
            className={inputCls}
          />
        </Field>

        <div className="space-y-2 border-t border-white/10 pt-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-green">
            Connect wallet
          </p>
          <p className="font-mono text-[11px] text-muted">
            Robinhood Chain 0x address for USDC / USDT payouts ($50 threshold). Last step
            before sign-up.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConnect()}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-red px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(255,0,51,0.3)] disabled:opacity-55"
          >
            <Wallet size={14} />
            {busy ? "Connecting…" : "Connect wallet"}
          </button>
          <a
            href={METAMASK_DOWNLOAD}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-sm border border-green/50 px-4 py-3.5 font-mono text-[11px] font-bold uppercase tracking-wider text-green no-underline hover:bg-green/10"
          >
            <ExternalLink size={14} />
            Create wallet (MetaMask)
          </a>
          {!hasInjected ? (
            <p className="font-mono text-[11px] leading-relaxed text-muted">
              No wallet detected. Tap{" "}
              <strong className="text-green">Create wallet (MetaMask)</strong> — free. Come
              back and hit Connect, or paste below.
            </p>
          ) : null}
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            Or paste an address
          </p>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x…"
            spellCheck={false}
            autoComplete="off"
            className={inputCls}
            required
          />
          {wallet && isValidEthAddress(wallet) ? (
            <p className="font-mono text-[11px] text-green">
              {shortAddr(wallet)} ready for payouts
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-red px-4 py-4 font-mono text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_0_18px_rgba(255,0,51,0.35)] disabled:opacity-55"
        >
          <UserPlus size={14} />
          {submitting ? "Signing up…" : "Sign up as creator"}
        </button>

        {ok ? (
          <p className="flex items-start gap-2 font-mono text-xs text-green">
            <Check size={14} className="mt-0.5 shrink-0" />
            {ok}
          </p>
        ) : null}
        {err ? <p className="font-mono text-xs text-red-hot">{err}</p> : null}
      </form>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/studio"
          className="inline-flex items-center justify-center border border-white/20 px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-fg no-underline hover:border-red"
        >
          Creator Studio
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center font-mono text-[11px] uppercase tracking-widest text-muted no-underline hover:text-green"
        >
          ← Back home
        </Link>
      </div>
    </main>
  );
}

const inputCls = cn(
  "w-full rounded-sm border border-white/15 bg-bg px-3 py-3 font-mono text-sm text-fg outline-none focus:border-green",
);

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
