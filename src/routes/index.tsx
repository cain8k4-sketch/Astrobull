import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/Hero";
import ChapterStory from "@/components/ChapterStory";
import CreatorStudio from "@/components/CreatorStudio";
import CreatorLeaderboard from "@/components/CreatorLeaderboard";
import ShillPromo from "@/components/ShillPromo";
import HowToBuy from "@/components/HowToBuy";
import QuickLinks from "@/components/QuickLinks";
import ChapterRoadmap from "@/components/ChapterRoadmap";
import ChapterTokenomics from "@/components/ChapterTokenomics";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: HomePage,
});

/** Order: title → story → studio → creator board → shill → how to buy → links → roadmap → tokenomics */
function HomePage() {
  return (
    <main>
      <Hero />
      <ChapterStory />
      <section id="studio" className="border-t border-white/5 bg-bg">
        <CreatorStudio />
      </section>
      <CreatorLeaderboard />
      <ShillPromo />
      <HowToBuy />
      <QuickLinks />
      <ChapterRoadmap />
      <ChapterTokenomics />
      <Footer />
    </main>
  );
}
