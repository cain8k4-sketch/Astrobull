import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import SiteNav from "@/components/SiteNav";
import ScrollDownButton from "@/components/ScrollDownButton";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Astro Bull — Breaking the Chains" },
      {
        name: "description",
        content:
          "Astro Bull is a community-powered meme movement on Robinhood Chain. Create free, get featured, get paid. We are all Astro.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="animate-flicker font-display text-6xl uppercase">404</h1>
      <p className="mt-3 font-mono text-sm uppercase tracking-widest text-muted">
        Dead end.
      </p>
      <a
        href="/"
        className="mt-6 bg-red px-5 py-3 font-mono text-xs uppercase tracking-widest text-white no-underline"
      >
        Back home
      </a>
    </div>
  ),
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="grain min-h-dvh bg-bg text-fg">
        <SiteNav />
        <Outlet />
        <ScrollDownButton />
      </div>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
