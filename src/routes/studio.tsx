import { createFileRoute } from "@tanstack/react-router";
import CreatorStudio from "@/components/CreatorStudio";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Creator Studio — Astro Bull" },
      {
        name: "description",
        content:
          "Create Astro Bull content with Grok, Claude, or ChatGPT — or upload your own. Character locked. Keys stay on your device.",
      },
    ],
  }),
  component: StudioPage,
});

function StudioPage() {
  return (
    <main>
      <CreatorStudio />
    </main>
  );
}
