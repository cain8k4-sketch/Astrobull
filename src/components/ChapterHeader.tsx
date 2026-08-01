export default function ChapterHeader({
  numeral,
  title,
  dek,
}: {
  numeral: string;
  title: string;
  dek?: string;
}) {
  return (
    <div className="mb-10 md:mb-12">
      <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-blood-bright">
        Chapter {numeral}
      </div>
      <h2 className="font-display text-4xl uppercase leading-[0.95] text-bone md:text-6xl">
        {title}
      </h2>
      {dek ? (
        <p className="mt-4 max-w-xl font-body text-base text-chain md:text-lg">{dek}</p>
      ) : null}
      <div className="chain-rule mt-6 w-full max-w-md" />
    </div>
  );
}
