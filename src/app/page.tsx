import dynamic from "next/dynamic";
import { Navbar } from "@/features/navbar";
// Hero is the above-the-fold LCP region and is now a Server Component (no client
// JS), so it stays a static import and renders eagerly.
import { Hero } from "@/features/home/sections/hero";
import type { HomeCollection } from "@/features/home/sections/shop-by-collection";
import { getCollectionBySlug, listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";
import { Footer } from "@/components/shared/footer";

// Below-the-fold home sections are client components (motion reveals + the
// ProductCard grid). Code-split them so their JS is a separate, deferred chunk
// instead of part of the initial route bundle. SSR stays ON (default) so the
// HTML and SEO are unchanged — only the JavaScript is deferred.
const ShopByCollection = dynamic(() =>
  import("@/features/home/sections/shop-by-collection").then((m) => m.ShopByCollection),
);
const NewArrivals = dynamic(() =>
  import("@/features/home/sections/new-arrivals").then((m) => m.NewArrivals),
);
const SareesForYou = dynamic(() =>
  import("@/features/home/sections/sarees-for-you").then((m) => m.SareesForYou),
);

// Landing page reads the live catalog via ISR: statically rendered and
// revalidated every 5 minutes (and on-demand through revalidateTag, see
// app/api/revalidate). Visitors get a cached page — fast TTFB — instead of
// waiting on ~11 backend calls per request. The category lookups also dedupe to
// a single /categories fetch (see lib/api/products::fetchCategoryGroup), so the
// home page now makes ~7 distinct calls, all cached, instead of 11 live ones.
// Each fetch is still independently caught so a backend hiccup never blanks the
// page — affected sections simply hide rather than throwing.
export const revalidate = 300;

// Curated tabs for the "Collection" section. All five map to seeded backend
// categories; any that return no products are dropped so there are no empty tabs.
const HOME_COLLECTION_SLUGS = [
  "kanchi-pattu-saree",
  "banaras-sarees",
  "cotton-sarees",
  "pattu",
  "fancy-sarees",
];

async function loadHomeCollections(): Promise<HomeCollection[]> {
  const results = await Promise.all(
    HOME_COLLECTION_SLUGS.map(async (slug) => {
      // Label + products both from the real backend category (canonical slug).
      const [cat, page] = await Promise.all([
        getCollectionBySlug(slug).catch(() => null),
        listProducts({ categorySlugs: [slug], pageSize: 5 }).catch(() => null),
      ]);
      const products = page ? toCardProducts(page.items) : [];
      return {
        id: slug,
        label: cat?.title ?? slug,
        href: `/saris/${slug}`,
        products,
      };
    }),
  );
  return results.filter((c) => c.products.length > 0);
}

export default async function HomePage() {
  const [newArrivals, collections] = await Promise.all([
    listProducts({ sort: "newest", pageSize: 5 })
      .then((p) => toCardProducts(p.items))
      .catch(() => []),
    loadHomeCollections().catch(() => []),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ShopByCollection collections={collections} />
        <NewArrivals products={newArrivals} />
        <SareesForYou />
      </main>
      <Footer />
    </>
  );
}
