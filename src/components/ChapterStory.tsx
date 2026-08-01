import { useReveal } from "@/hooks/use-reveal";
import { Link } from "@tanstack/react-router";

const BEATS = [
  {
    num: "01",
    title: "The Escape",
    desc: "He was 99 cents away from becoming a beef patty at McDonald's. He broke his chains and ran.",
    accent: "text-red border-red/50",
  },
  {
    num: "02",
    title: "The Herd",
    desc: "He gathers the fallen, the forgotten, the diamond hands. No one rises alone.",
    accent: "text-green border-green/50",
  },
  {
    num: "03",
    title: "The Mission",
    desc: "He burns and never sells. He builds in bear markets. He does what no dev has done before.",
    accent: "text-gold border-gold/50",
  },
  {
    num: "04",
    title: "The Moon",
    desc: "The destination was always clear. It called during the darkest hours. Now he answers. MOOOOON.",
    accent: "text-fg border-white/25",
  },
] as const;

export default function ChapterStory() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="story" className="bg-bg">
      <div className="relative h-[42vw] min-h-[220px] max-h-[480px] w-full overflow-hidden">
        <video
          src="/chapter1-story.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/30 via-transparent to-bg" />
        <div className="absolute bottom-0 left-0 p-5 md:p-10">
          <span className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-green sm:text-xs">
            <span className="h-2 w-2 rotate-45 bg-green shadow-[0_0_10px_#00ff66]" />
            The story of AstroBull
          </span>
        </div>
      </div>

      <div ref={ref} className="reveal px-4 py-14 sm:px-8 md:px-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display uppercase leading-none text-fg" style={{ fontSize: "clamp(3rem, 12vw, 6rem)" }}>
            Chapter
            <br />
            <span className="animate-flicker">01</span>
          </h2>

          <p className="mt-6 max-w-2xl border-l-2 border-red/40 pl-5 font-mono text-[11px] uppercase leading-relaxed tracking-wide text-muted sm:text-xs">
            Breaking the chains — rising from nearly becoming a beef patty at the slaughterhouse
            to a rising star on a mission to the{" "}
            <span className="font-bold text-red">Moooon</span>
          </p>

          <p className="mt-10 font-display text-2xl uppercase tracking-wide text-fg sm:text-3xl">
            Breaking the chains.
          </p>

          <div className="mt-6 max-w-xl space-y-5 border-l-2 border-red/30 pl-5 font-mono text-sm leading-relaxed text-muted">
            <p>
              One breath from the slaughterhouse floor — inches from getting ground into a 99¢
              McDonald's beef patty —{" "}
              <span className="font-bold text-fg">AstroBull rose.</span>
            </p>
            <p>
              He didn't just escape.{" "}
              <span className="font-bold text-fg">He became the Breaker of Chains.</span>
            </p>
            <p>
              No developer has ever moved like this.
              <br />
              He burns.
              <br />
              He never sells.
              <br />
              Leader, not follower.
              <br />
              Builds while the market is bleeding out.
              <br />
              <span className="text-fg">
                Raises the whole community across every platform — substance and legend in the
                making.
              </span>
            </p>
          </div>

          <div className="mt-8 border border-red/40 bg-red/10 px-5 py-5">
            <p className="font-display text-xl uppercase leading-snug tracking-wide text-fg sm:text-2xl">
              Stay Bullish...
              <br />
              Stay <span className="animate-flicker">AstroBullish!</span>
              <br />
              Together We Rise!
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-red/80">
              Only on Robinhood Chain
            </p>
          </div>

          <div className="mt-8 border border-green/30 bg-green/5 px-5 py-4">
            <p className="mb-1 font-mono text-xs font-bold uppercase tracking-wide text-green">
              Content creators — this project is for you
            </p>
            <p className="font-mono text-xs leading-relaxed text-muted">
              Join us. Create content. Keep the story alive. AstroBull gives creators a place to
              shine — free AI studio or upload your own.
            </p>
            <Link
              to="/studio"
              className="mt-3 inline-block font-mono text-[11px] font-bold uppercase tracking-widest text-green underline-offset-4 hover:underline"
            >
              Open Creator Studio →
            </Link>
          </div>

          <div className="mt-12 space-y-5">
            {BEATS.map((b) => (
              <div key={b.num} className={`border-l-2 pl-4 ${b.accent.split(" ")[1]}`}>
                <div className="mb-1 flex items-center gap-3">
                  <span className={`font-mono text-xs font-bold tracking-widest ${b.accent.split(" ")[0]}`}>
                    {b.num}
                  </span>
                  <span className="font-display text-base uppercase tracking-wide text-fg">
                    {b.title}
                  </span>
                </div>
                <p className="font-mono text-xs leading-relaxed text-muted">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
