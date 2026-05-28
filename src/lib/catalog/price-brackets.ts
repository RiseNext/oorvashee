/**
 * Budget collection brackets ("Sarees For You" cards).
 *
 * Each bracket maps an SEO-friendly slug → an inclusive backend price window
 * (`priceMin`/`priceMax`, INR). The backend filters with `base_price >= min`
 * and `base_price <= max`, so to express the spec's exclusive lower bound
 * ("1000 < price") over 2-decimal currency we set `priceMin` to the previous
 * ceiling + 0.01 — exact, not a hack. Adding a new bracket here is the only
 * change needed; the route + cards consume this list.
 */
export interface PriceBracket {
  slug: string;
  /** Short label for the cards (matches the baked-in card art). */
  label: string;
  /** Heading shown on the collection page. */
  title: string;
  priceMin?: number;
  priceMax: number;
}

export const PRICE_BRACKETS: PriceBracket[] = [
  { slug: "under-1000", label: "Under ₹1,000", title: "Under ₹1,000", priceMax: 1000 },
  { slug: "under-2000", label: "Under ₹2,000", title: "₹1,000 – ₹2,000", priceMin: 1000.01, priceMax: 2000 },
  { slug: "under-5000", label: "Under ₹5,000", title: "₹2,000 – ₹5,000", priceMin: 2000.01, priceMax: 5000 },
  { slug: "under-10000", label: "Under ₹10,000", title: "₹5,000 – ₹10,000", priceMin: 5000.01, priceMax: 10000 },
];

export function getPriceBracket(slug: string): PriceBracket | undefined {
  return PRICE_BRACKETS.find((b) => b.slug === slug);
}
