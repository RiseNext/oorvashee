import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

// Default social share card for the whole site. Product pages override this
// with their own product image via `generateMetadata`. Generated at build
// (statically optimised) — no external font/asset dependency.
export const alt = `${siteConfig.fullName} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F0E6D3",
          color: "#3D1A08",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", width: 64, height: 3, background: "#C9A84C", marginBottom: 40 }} />
        <div style={{ display: "flex", fontSize: 104, fontWeight: 600, letterSpacing: -2, color: "#7B0D0D" }}>
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 34, letterSpacing: 2 }}>
          {siteConfig.tagline}
        </div>
        <div style={{ display: "flex", width: 64, height: 3, background: "#C9A84C", marginTop: 40 }} />
      </div>
    ),
    { ...size },
  );
}
