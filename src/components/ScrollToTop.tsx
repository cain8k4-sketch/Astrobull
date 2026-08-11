import { useLayoutEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * On every route change / visit, land at the top of the page.
 * If the URL has a #section hash (e.g. #wall-of-fame), scroll to that section instead.
 */
export default function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const href = useRouterState({ select: (s) => s.location.href });

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // Stop the browser restoring the last scroll position on refresh / back-forward
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* ignore */
    }

    const raw = (hash || "").replace(/^#/, "").trim();
    if (raw) {
      // Let the target section paint, then scroll to it
      const go = () => {
        const el = document.getElementById(raw);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
        } else {
          window.scrollTo(0, 0);
        }
      };
      requestAnimationFrame(go);
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash, href]);

  return null;
}
