"use client";

import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query.
 *
 * Defaults to `false` during SSR / first paint so server and client output
 * agree — components must tolerate the first render being mobile-like.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
