import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Serve modern formats (AVIF first, WebP fallback) for smaller payloads
    // and better LCP. Cloudinary already does f_auto on its own URLs; this
    // covers the Next image optimizer for all sources.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images at the edge for a day to cut repeat work.
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      // Production product media — Cloudinary `secure_url`s from the backend.
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Dev/staging seed images. The backend seed system uses picsum.photos
      // placeholders (see BACKEND/app/seeds/base.py::picsum_url). Real product
      // images uploaded via the admin media flow are Cloudinary URLs above.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  async rewrites() {
    // Jio NXDOMAIN fix: browser API calls go to THIS site's own origin
    // (`/api/v1/*`) and are proxied server-side to Railway, so the browser never
    // resolves `*.up.railway.app` (Reliance Jio's DNS returns NXDOMAIN for it,
    // breaking Add to Cart / Buy Now for Jio users). Server-side fetches bypass
    // this entirely — they hit `BACKEND_ORIGIN` directly (see lib/api/client.ts).
    //
    // CRITICAL: scoped to `/api/v1/:path*`, NOT `/api/:path*`, so the local
    // `/api/revalidate` route handler is untouched. The `/api/v1` prefix is
    // preserved end-to-end to match the backend's route structure
    // (FastAPI mounts every router under `/api/v1`).
    const backendOrigin = process.env.BACKEND_ORIGIN ?? "http://localhost:8000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
    ];
  },
  async redirects() {
    // The canonical product URL is `/product/[slug]` (the WhatsApp/Instagram
    // bot URL contract). Legacy/demo product-detail paths that used to live
    // under category folders or new-arrivals 308-redirect to it so any link
    // already shared keeps working and search engines consolidate.
    //
    // NOTE: category LISTING URLs (`/saris/[category]`) are intentionally NOT
    // redirected — per the approved hybrid nav, the curated slugs remain
    // canonical and resolve to backend categories server-side.
    return [
      {
        source: "/saris/:category/:slug",
        destination: "/product/:slug",
        permanent: true,
      },
      {
        source: "/new-arrivals/:slug",
        destination: "/product/:slug",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
