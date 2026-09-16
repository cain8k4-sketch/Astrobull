import WallOfFame from "@/components/WallOfFame";

/** Showcase grid used by /creators — same featured-creator cards as the hall. */
export default function CreatorsGrid({ showHeader = true }: { showHeader?: boolean }) {
  return <WallOfFame showHeader={showHeader} />;
}
