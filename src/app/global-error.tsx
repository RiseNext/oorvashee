"use client";

import { useEffect } from "react";

/**
 * Last-resort boundary for failures in the root layout itself (outside any
 * route segment). It must render its own <html>/<body>. Kept dependency-free
 * and inline-styled so it works even if the app shell/CSS failed to load.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 24,
          textAlign: "center",
          background: "#F0E6D3",
          color: "#3D1A08",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: 4, textTransform: "uppercase", color: "#C9A84C", margin: 0 }}>
          Something slipped
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 500, margin: 0 }}>We couldn&apos;t load Oorvashee</h1>
        <p style={{ maxWidth: 420, fontSize: 15, color: "#6b5a4d", margin: 0, fontFamily: "system-ui, sans-serif" }}>
          This is usually temporary. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 8,
            padding: "12px 28px",
            border: "none",
            borderRadius: 6,
            background: "#7B0D0D",
            color: "#fff",
            fontSize: 12,
            letterSpacing: 2,
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
