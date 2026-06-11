import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailPage } from "@/features/product-detail/product-detail-page";
import { toProductDetailData } from "@/features/product-detail/adapt";
import { getProductBySlug, getRelatedProducts } from "@/lib/api/products";
import { primaryDepartment, toCardProducts } from "@/lib/catalog/presenters";
import { JsonLd, breadcrumbSchema, productSchema } from "@/lib/seo/jsonld";

// ISR: product detail (price/stock/availability) revalidates every 10 min and
// on-demand via revalidateTag("products" / "product:<slug>") after an admin
// edit — so pages are served from cache instead of re-rendered per request.
//
// We intentionally do NOT prebuild slugs via generateStaticParams: pages render
// on first request and then cache (dynamicParams defaults to true). This keeps
// `next build` independent of backend availability and avoids caching a stale
// 404 if a product fetch transiently fails during a build-time prerender.
export const revalidate = 600;

// Dedupe the product fetch across generateMetadata + the page render.
const loadProduct = cache((slug: string) => getProductBySlug(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug).catch(() => null);
  if (!product) return { title: "Product Unavailable" };

  const description =
    product.seo?.description ?? product.story ?? product.description.slice(0, 160);
  const image = product.image?.url;

  return {
    title: product.seo?.title ?? product.title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.seo?.title ?? product.title,
      description,
      url: `/product/${product.slug}`,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    robots: product.available ? undefined : { index: false, follow: true },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 404 (unknown slug) → null → notFound(). A 200 with available=false
  // (out of stock / reserved by another customer / archived) still renders the
  // FULL product page — the BuyZone shows the availability state and disables
  // Add to Cart / Buy Now. We never replace the page with a bare "unavailable"
  // screen, so a momentarily-held product stays fully browsable.
  const product = await loadProduct(slug);
  if (!product) notFound();

  // Breadcrumb / "view all" → the product's primary department. Slugs are
  // canonical, so we link the real category page directly.
  const dept = primaryDepartment(product.categories);
  const categoryHref = dept ? `/saris/${dept.slug}` : "/saris";
  const categoryLabel = dept?.name ?? "All Sarees";

  // Related rail — same fabric family, current product excluded. Tolerant of
  // backend hiccups so the PDP still renders if the rail can't load.
  const related = await getRelatedProducts(product, 8).catch(() => []);
  const relatedCards = toCardProducts(related);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: categoryLabel, path: categoryHref },
    { name: product.title, path: `/product/${product.slug}` },
  ]);

  return (
    <>
      <JsonLd data={[productSchema(product), breadcrumb]} />
      <ProductDetailPage
        product={toProductDetailData(product)}
        variants={product.variants}
        categoryHref={categoryHref}
        categoryLabel={categoryLabel}
        similar={relatedCards}
        youMayAlsoLike={relatedCards}
      />
    </>
  );
}
