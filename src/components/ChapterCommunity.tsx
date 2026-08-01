import ChapterHeader from "./ChapterHeader";
import { useReveal } from "@/hooks/use-reveal";

const RISKS = [
  "Developer has committed to burning the entire 6% allocation and never selling.",
  "Continuous organic content keeps the project visible and alive indefinitely.",
  "Revenue is recycled into buybacks and burns rather than extracted.",
  "Transparent burn process — manual today, controlled burner bot under founder oversight tomorrow.",
];

export default function ChapterCommunity() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section
      id="community"
      className="border-t border-chain/15 bg-iron px-5 py-20 md:px-16 md:py-28"
    >
      <div ref={ref} className="reveal mx-auto max-w-3xl">
        <ChapterHeader
          numeral="VI"
          title="We Are All Astro"
          dek="A community-run movement, not a top-down team."
        />

        <p className="max-w-xl font-body leading-relaxed text-bone/90">
          The founder acts as Slaughterhouse Productions Manager — facilitating the vision,
          managing burns, coordinating content, and supporting creators — while the community
          drives growth, culture, and daily activity. Diamond hands are celebrated. Traders are
          welcomed. Creators are elevated.
        </p>

        <div className="chain-rule my-10" />

        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-chain">
          Risk mitigation
        </p>
        <ul className="space-y-3">
          {RISKS.map((r) => (
            <li key={r} className="flex gap-3 font-body text-sm leading-relaxed text-bone/85">
              <span className="mt-1 text-blood-bright">◆</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
