import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl } from "@/lib/seo/jsonld";
import { listCollections, listProducts } from "@/lib/api/products";

// Regenerate hourly so newly published products/categories appear without a
// redeploy. Resilient by design: if the backend is unreachable (e.g. during a
// build), we still emit the static + canonical-nav routes and never fail.
export const revalidate = 3600;

// Cap the crawl so a large catalog can't produce an unbounded sitemap in one
// file. Well above the launch catalog; split via generateSitemaps if it grows.
const MAX_PRODUCT_PAGES = 20;
const PRODUCT_PAGE_SIZE = 100;

/** Canonical `/saris/[category]` slugs declared in the approved navigation. */
function navCategorySlugs(): string[] {
  const slugs = new Set<string>();
  const walk = (items: typeof siteConfig.nav) => {
    for (const item of items) {
      const m = item.href.match(/^\/saris\/([^/]+)$/);
      if (m) slugs.add(m[1]);
      if (item.children) walk(item.children as typeof siteConfig.nav);
    }
  };
  walk(siteConfig.nav);
  return [...slugs];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/saris"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/new-arrivals"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/collections"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/our-craft"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/support"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categorySlugs = new Set(navCategorySlugs());
  const productEntries: MetadataRoute.Sitemap = [];

  // Best-effort live enumeration; failures fall back to static + nav routes.
  try {
    const collections = await listCollections();
    for (const c of collections) categorySlugs.add(c.slug);
  } catch {
    /* keep nav-derived category slugs */
  }

  try {
    for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
      const res = await listProducts({ page, pageSize: PRODUCT_PAGE_SIZE });
      for (const p of res.items) {
        productEntries.push({
          url: absoluteUrl(`/product/${p.slug}`),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      if (page >= res.totalPages) break;
    }
  } catch {
    /* no live products available — emit static + categories only */
  }

  const categoryEntries: MetadataRoute.Sitemap = [...categorySlugs].map((slug) => ({
    url: absoluteUrl(`/saris/${slug}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
