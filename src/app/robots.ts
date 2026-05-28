import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/jsonld";

/**
 * Crawl rules. Public catalog/marketing pages are indexable; operational and
 * personal surfaces (admin, account, cart/checkout, auth, guest order tracking)
 * are disallowed so they never enter the index or leak query params.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/cart",
        "/checkout",
        "/wishlist",
        "/sign-in",
        "/sign-up",
        "/sso-callback",
        "/orders/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
