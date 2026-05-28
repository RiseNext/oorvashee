/**
 * Domain `Product` → `ProductDetailData` (the shape the approved product-detail
 * UI consumes). Everything here is composed from REAL backend data, except the
 * store-level policy copy (returns/shipping/manufacturer/care), which is the
 * same for every product and is sourced from `siteConfig` — that is legitimate
 * static site content, not fabricated product data.
 *
 * Fields the backend genuinely does not have yet (e.g. customer reviews) are
 * left at neutral zero values; the UI hides those blocks gracefully rather
 * than showing invented numbers (see buy-zone empty-state guards).
 */
import { siteConfig } from "@/config/site";
import { PLACEHOLDER_IMAGE } from "@/lib/api/mappers";
import type { Product } from "@/types/product";
import type { ProductColor, ProductDetailData } from "./data";

function titleize(value: string): string {
  return value
    .split(/[-\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function uniq(values: (string | undefined | null)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

/** Store-level policy copy — identical across products, sourced from config. */
function brandContent() {
  const { contact, fullName } = siteConfig;
  return {
    returnPolicy:
      "We accept returns within 7 days of delivery, provided the item is unused, " +
      "unwashed, and in its original packaging with all tags intact.\n\n" +
      `To start a return, email ${contact.email} with your order number. ` +
      "Exchanges are processed within 5–7 business days of receiving the item.",
    shippingInfo:
      "Orders are dispatched within 1–2 business days.\n\n" +
      "Estimated delivery:\n" +
      "• Metro cities: 2–4 business days\n" +
      "• Tier 2 / Tier 3: 4–7 business days\n" +
      "• International: 10–14 business days",
    manufacturedBy: `${fullName}\n${contact.address}`,
    customerCare:
      `Email: ${contact.email}\n` +
      `Phone / WhatsApp: ${contact.phone}\n` +
      "Mon–Sat, 10 AM – 7 PM IST",
  };
}

export function toProductDetailData(product: Product): ProductDetailData {
  const primaryImage = product.images[0]?.url ?? PLACEHOLDER_IMAGE;
  const images = product.images.length > 0
    ? product.images.map((i) => i.url)
    : [PLACEHOLDER_IMAGE];

  // Variant-derived option axes (all real). The backend seed has colour +
  // fabric per variant; size is usually absent for sarees → empty arrays,
  // which the UI hides.
  const colors: ProductColor[] = uniq(
    product.variants.map((v) => v.options.color),
  ).map((label) => ({ label, swatch: primaryImage }));
  const fabrics = uniq(product.variants.map((v) => v.options.fabric));
  const sizes = uniq(product.variants.map((v) => v.options.size));

  // Specification rows — only include those backed by real data.
  const specification: { label: string; value: string }[] = [];
  if (product.attributes.fabric)
    specification.push({ label: "Fabric", value: product.attributes.fabric });
  if (product.attributes.region)
    specification.push({ label: "Region", value: product.attributes.region });
  if (product.attributes.occasion)
    specification.push({ label: "Occasion", value: product.attributes.occasion });
  if (colors.length)
    specification.push({
      label: "Colours Available",
      value: colors.map((c) => c.label).join(", "),
    });
  if (product.tags?.length)
    specification.push({
      label: "Highlights",
      value: product.tags.map(titleize).join(", "),
    });

  const brand = brandContent();

  return {
    id: product.id,
    slug: product.slug,
    category: product.attributes.fabric ?? product.fabric ?? "Sarees",
    // Safe default; the detail route overrides this with a resolved curated
    // category href so the breadcrumb + "view all" point somewhere real.
    categorySlug: "/saris",
    name: product.title,
    code: product.variants[0]?.sku ?? "",
    price: product.price,
    mrp: product.compareAtPrice,
    // No review system yet — zero keeps the UI honest (rating block hidden).
    rating: 0,
    reviewCount: 0,
    images,
    sizes,
    colors,
    fabrics,
    description: product.description,
    specification,
    returnPolicy: brand.returnPolicy,
    shippingInfo: brand.shippingInfo,
    manufacturedBy: brand.manufacturedBy,
    customerCare: brand.customerCare,
  };
}
