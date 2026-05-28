"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query via `useSyncExternalStore` — the React 19 way to
 * read from an external source without the cascading-render / hydration
 * pitfalls of `setState` inside an effect.
 *
 * The server snapshot is `false`, so SSR / first paint agree (components
 * must tolerate the first render being mobile-like); the real value is read
 * synchronously on the client after hydration.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  // Server / pre-hydration snapshot: assume not-matching (mobile-first).
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
