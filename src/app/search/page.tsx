import type { Metadata } from "next";

import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";

// Live search results — render per request (like the rest of the catalog) so
// `next build` never depends on backend availability.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Oorvashee collection of handwoven sarees.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <SareeListingPage
        title="Search"
        subtitle="Find your saree"
        products={[]}
        emptyTitle="Search our collection"
        emptyBody="Use the search bar above to find sarees by name, weave, or collection."
      />
    );
  }

  const page = await listProducts({ q: query, pageSize: 100 }).catch(() => null);
  const products = page ? toCardProducts(page.items) : [];

  return (
    <SareeListingPage
      title="Search"
      subtitle={`Results for “${query}”`}
      products={products}
      emptyTitle={`No matches for “${query}”`}
      emptyBody="Try a different spelling or a broader term — or explore all our sarees."
    />
  );
}
