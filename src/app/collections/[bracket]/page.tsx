import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";
import { getPriceBracket, PRICE_BRACKETS } from "@/lib/catalog/price-brackets";

// ISR: the budget brackets are a fixed, static set, so prebuild all of them and
// revalidate every 5 min (plus on-demand via revalidateTag("products")). The
// product fetch below is caught so the build stays backend-independent.
export const revalidate = 300;

// Brackets come from static config — no backend needed to enumerate them.
export function generateStaticParams() {
  return PRICE_BRACKETS.map((b) => ({ bracket: b.slug }));
}

// The approved listing template paginates/sorts client-side; hand it a generous
// page (backend caps page_size at 100). Server-driven pagination is a later
// optimisation — composable on top of this since the price filter is just
// another query param.
const PAGE_SIZE = 100;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bracket: string }>;
}): Promise<Metadata> {
  const { bracket } = await params;
  const b = getPriceBracket(bracket);
  if (!b) return { title: "Collection" };
  return {
    title: `Sarees ${b.title}`,
    description: `Handwoven sarees ${b.title.toLowerCase()} — curated by budget.`,
    alternates: { canonical: `/collections/${bracket}` },
  };
}

export default async function BudgetCollectionPage({
  params,
}: {
  params: Promise<{ bracket: string }>;
}) {
  const { bracket } = await params;
  const b = getPriceBracket(bracket);
  if (!b) notFound();

  const page = await listProducts({
    priceMin: b.priceMin,
    priceMax: b.priceMax,
    pageSize: PAGE_SIZE,
  }).catch(() => null);

  return (
    <SareeListingPage
      title={b.title}
      subtitle="Sarees For You"
      products={page ? toCardProducts(page.items) : []}
      emptyTitle="Nothing in this range yet"
      emptyBody="New pieces are added often — explore our other collections in the meantime."
    />
  );
}
