import { useLayoutEffect, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Always open at the top of the page unless the URL has an intentional #hash.
 * Also re-asserts top shortly after load so late effects cannot yank the view down.
 */
export default function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });

  const pinTop = () => {
    if (typeof window === "undefined") return;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }
    const raw = (hash || "").replace(/^#/, "").trim();
    if (raw) {
      const el = document.getElementById(raw);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  useLayoutEffect(() => {
    pinTop();
  }, [pathname, hash]);

  useEffect(() => {
    // Beat any late scrollIntoView from child components on first paint
    pinTop();
    const t1 = window.setTimeout(pinTop, 50);
    const t2 = window.setTimeout(pinTop, 200);
    const t3 = window.setTimeout(pinTop, 500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname, hash]);

  return null;
}
