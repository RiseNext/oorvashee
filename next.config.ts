import type { NextConfig } from "next";

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

export default nextConfig;
