import { useReveal } from "@/hooks/use-reveal";

const PHASES = [
  {
    id: "01",
    title: "Launch & Community",
    badge: "Current",
    body: "Token deployed. Liquidity locked. Community forming. Content creation mission begins. ~12M tokens already burned.",
    color: "text-red",
    border: "border-red",
    glow: "shadow-[0_0_20px_rgba(255,0,51,0.25)]",
  },
  {
    id: "02",
    title: "Expansion",
    badge: null,
    body: "Flood every major platform with high-quality Astro Bull content. Feature top creators. Grow organic reach and volume. First NFT drops.",
    color: "text-green",
    border: "border-green",
    glow: "",
  },
  {
    id: "03",
    title: "The Eternal Saga",
    badge: null,
    body: "More chapters. More characters from the slaughterhouse. Path to a full horror movie. Ongoing burns. Continuous community elevation.",
    color: "text-gold",
    border: "border-gold/60",
    glow: "",
  },
] as const;

export default function ChapterRoadmap() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="roadmap" className="border-t border-white/5 bg-bg px-4 py-16 sm:px-8 md:px-14 md:py-24">
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        {/* ROAD white + MAP flashing red — no photo */}
        <h2
          className="text-center font-display uppercase leading-none tracking-wide"
          style={{ fontSize: "clamp(3.2rem, 14vw, 7rem)" }}
        >
          <span className="text-fg">Road</span>
          <span className="animate-flicker">Map</span>
        </h2>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-muted sm:text-xs">
          — The path to decimation —
        </p>

        <div className="mt-10 space-y-0">
          {PHASES.map((p, i) => (
            <div
              key={p.id}
              className={`border ${p.border}/40 bg-surface px-6 py-7 ${i === 0 ? p.glow : ""} ${
                i < PHASES.length - 1 ? "border-b-0" : ""
              }`}
            >
              <div className={`font-display text-5xl leading-none ${p.color} sm:text-6xl`}>
                <span className={i === 0 ? "animate-flicker" : ""}>{p.id}</span>
              </div>
              <h3 className="mt-4 font-display text-2xl uppercase tracking-wide text-fg sm:text-3xl">
                {p.title}
              </h3>
              {p.badge ? (
                <span className="mt-3 inline-block border border-red/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-red">
                  ★ {p.badge}
                </span>
              ) : null}
              <p className="mt-4 max-w-lg font-mono text-xs uppercase leading-relaxed tracking-wide text-muted sm:text-sm">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-red/40 bg-red/10 px-5 py-5 text-center">
          <p className="font-display text-lg uppercase tracking-wide text-red sm:text-xl">
            Dev doesn't sell. He burns —{" "}
            <span className="text-fg">all revenues go back into the project.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
