/**
 * Presentation adapters — domain types → the props the APPROVED storefront
 * components already expect. This keeps the visual components untouched while
 * their data source becomes the live backend.
 *
 * Layering: backend wire DTO → (lib/api/mappers) → domain types → (here) →
 * presentational props. Components never see backend OR domain churn beyond
 * these seams.
 */
import type { Product as CardProduct } from "@/components/shared/product-card";
import type { ProductSummary } from "@/types/product";

/**
 * Domain product → the shared `ProductCard` shape. Critically, the card `href`
 * is the CANONICAL `/product/[slug]` (the WhatsApp/Instagram bot URL contract)
 * — every card across the storefront now links there.
 */
export function toCardProduct(p: ProductSummary): CardProduct {
  return {
    id: p.id,
    // Backend catalog list items carry no separate "product code"; the card
    // renders `{code} {name}` and tolerates an empty code (name carries it).
    code: "",
    name: p.title,
    price: p.price,
    mrp: p.compareAtPrice,
    image: p.image.url,
    href: `/product/${p.slug}`,
    category: p.collection?.title ?? p.fabric,
  };
}

/** Map a list of domain summaries to card props. */
export function toCardProducts(items: ProductSummary[]): CardProduct[] {
  return items.map(toCardProduct);
}

// Collection-kind categories that are groupings/campaigns rather than a leaf
// department — excluded when choosing a product's breadcrumb category. This is
// rendering logic (which category to link), NOT a taxonomy definition.
const NON_LEAF_COLLECTION_SLUGS = new Set(["pattu", "diwali-2026", "wedding-edit"]);

/**
 * Pick the most specific department category for a product's breadcrumb /
 * "view all" link. Prefers a leaf department over the "Pattu" parent or a
 * seasonal collection. Slugs are canonical (== storefront slugs), so the
 * caller links `/saris/${slug}` directly.
 */
export function primaryDepartment(
  categories: { slug: string; name: string; kind: string }[] | undefined,
): { slug: string; name: string } | null {
  if (!categories?.length) return null;
  const collections = categories.filter((c) => c.kind === "collection");
  const chosen =
    collections.find((c) => !NON_LEAF_COLLECTION_SLUGS.has(c.slug)) ??
    collections[0];
  return chosen ? { slug: chosen.slug, name: chosen.name } : null;
}
