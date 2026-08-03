import { createFileRoute } from "@tanstack/react-router";
import ShillTool from "@/components/ShillTool";

export const Route = createFileRoute("/shill")({
  head: () => ({
    meta: [
      { title: "Shill Tool — Astro Bull" },
      {
        name: "description",
        content:
          "Generate on-brand AstroBull shill posts, copy hashtags, climb the shill leaderboard. Separate from creator activity.",
      },
    ],
  }),
  component: ShillPage,
});

function ShillPage() {
  return (
    <main>
      <ShillTool />
    </main>
  );
}
