import ChapterHeader from "./ChapterHeader";
import { useReveal } from "@/hooks/use-reveal";

export default function ChapterOrigin() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="origin" className="bg-void px-5 py-20 md:px-16 md:py-28">
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <ChapterHeader numeral="I" title="The Origin" dek="Every saga starts with a cage." />

        <div className="relative mb-10 overflow-hidden rounded-md border border-blood/30">
          <video
            src="/chapter1-story.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="aspect-video w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void to-transparent p-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-blood-bright">
              The story of Astro Bull
            </span>
          </div>
        </div>

        <div className="border border-blood/25 bg-iron px-6 py-8 md:px-10 md:py-10">
          <p className="font-body text-lg leading-relaxed text-bone/90">
            Day after day, Astro stares through the bars of his cell at a neon sign:{" "}
            <span className="font-mono text-blood-bright">99¢ beef patty</span> — a constant
            reminder of the fate that awaits him if nothing changes.
          </p>
          <p className="mt-5 font-body text-lg leading-relaxed text-bone/90">
            One solitary night a mysterious feather drifts into his cell. Held toward the
            moonlight it begins to glow — revealing his mission: break the chains, burn the
            slaughterhouse, and begin a new life.
          </p>
          <p className="mt-5 font-body text-base italic leading-relaxed text-chain">
            He still has feelings. The full narrative is told chapter by chapter through
            community content, with deliberate cliffhangers. More animals from the
            slaughterhouse will get their own stories. A horror movie is part of the long-term
            vision.
          </p>
        </div>

        <p className="red-flash mt-10 font-display text-2xl uppercase tracking-wide md:text-3xl">
          “We are all Astro.”
        </p>
      </div>
    </section>
  );
}
