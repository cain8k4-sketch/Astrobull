import ChapterHeader from "./ChapterHeader";
import { useReveal } from "@/hooks/use-reveal";

export default function ChapterNFTs() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="nfts" className="border-t border-chain/15 bg-iron px-5 py-20 md:px-16 md:py-28">
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <ChapterHeader
          numeral="IV"
          title="Season One"
          dek="Scarcity where it matters. Accessibility for everyone else."
        />

        <div className="mb-8 overflow-hidden rounded-md border border-chain/25">
          <video
            src="/nft-visual.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-blood/45 bg-void/40 px-6 py-6">
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-neon/80">
              Season 1 — Rare
            </div>
            <p className="font-body text-sm leading-relaxed text-bone/90">
              Limited-supply exclusive NFTs aligned with the token’s long-term burn thesis, with
              staking opportunities tied to the rare set.
            </p>
          </div>
          <div className="rounded-md border border-chain/30 bg-void/40 px-6 py-6">
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-chain">
              Later Drops
            </div>
            <p className="font-body text-sm leading-relaxed text-bone/90">
              Affordable, higher-supply mints so the wider community can own a piece of Astro
              Bull. All revenue flows back into buybacks and burns.
            </p>
          </div>
        </div>

        <p className="mt-6 font-body text-sm italic text-chain">
          Full details of the first drop will be announced when ready.
        </p>
      </div>
    </section>
  );
}
