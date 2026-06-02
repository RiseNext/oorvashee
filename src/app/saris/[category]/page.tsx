import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { getCollectionBySlug, listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/jsonld";

// ISR: revalidate every 5 min (plus on-demand via revalidateTag). Replaces
// force-dynamic so each view is served from cache instead of re-fetching the
// catalog per request.
//
// No generateStaticParams: category pages render on first request and then
// cache (dynamicParams defaults to true). This keeps `next build` independent
// of backend availability rather than prebuilding every category against a
// cross-region backend at build time.
export const revalidate = 300;

// The approved listing template paginates/sorts client-side, so we hand it a
// generous page of the category (backend caps page_size at 100). Server-driven
// pagination is a later optimisation; the launch catalog is well under this.
const CATALOG_PAGE_SIZE = 100;

// Slugs are now the canonical backend category slugs (see TAXONOMY.md) — the
// page resolves the category directly from the backend, no translation layer.
// Dedupe the lookup across generateMetadata + the render.
const loadCategory = cache((slug: string) => getCollectionBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = await loadCategory(category).catch(() => null);
  if (!cat) return { title: "Sarees" };
  return {
    title: cat.title,
    description: cat.description,
    alternates: { canonical: `/saris/${category}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // Unknown slug → 404. A real backend category (incl. the "pattu" parent,
  // which returns the union of its weave children) → render.
  const cat = await loadCategory(category);
  if (!cat) notFound();

  const page = await listProducts({
    categorySlugs: [category],
    pageSize: CATALOG_PAGE_SIZE,
  });

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Sarees", path: "/saris" },
    { name: cat.title, path: `/saris/${category}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <SareeListingPage
        title={cat.title}
        subtitle={cat.description}
        products={toCardProducts(page.items)}
      />
    </>
  );
}
