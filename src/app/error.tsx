"use client";

import { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Route error boundary. Catches failures from server components (e.g. the
 * catalog API being unreachable) and offers a retry instead of a crash.
 * Client component per Next.js requirement.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for diagnostics; real telemetry hooks land in a later phase.
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-1 flex-col items-center justify-center gap-5 px-5 text-center">
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.35em] text-gold">
        Something slipped
      </p>
      <h1 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
        We couldn&apos;t load this page
      </h1>
      <p className="max-w-md font-body text-sm text-text-secondary sm:text-base">
        This is usually temporary. Please try again in a moment — if it keeps
        happening, our team is already on it.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-cta-fill px-6 py-3",
            "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300",
            "hover:bg-cta-fill-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
          )}
        >
          Try again
        </button>
        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
            "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
            "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
          )}
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
