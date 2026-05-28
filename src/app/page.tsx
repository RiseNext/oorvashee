import { Navbar } from "@/features/navbar";
import {
  Hero,
  ShopByCollection,
  NewArrivals,
  SareesForYou,
  type HomeCollection,
} from "@/features/home";
import { getCollectionBySlug, listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";

// Landing page reads live catalog. Render per request and degrade gracefully:
// each fetch is independently caught so a backend hiccup never blanks the page
// — affected sections simply hide rather than throwing.
export const dynamic = "force-dynamic";

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
    </>
  );
}
