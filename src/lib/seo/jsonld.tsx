/**
 * Structured data (JSON-LD) — the single seam for schema.org markup.
 *
 * Builders return plain objects; <JsonLd> renders them as a sanitised
 * `application/ld+json` script (the `<` → `<` escape blocks XSS via
 * any backend-sourced string, per the Next.js JSON-LD guide). Render these
 * inside Server Components (layout/page) only.
 */
import { siteConfig } from "@/config/site";
import type { Product } from "@/types/product";

/** Resolve a path to an absolute canonical URL on the production origin. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}

type Json = Record<string, unknown>;

export function JsonLd({ data }: { data: Json | Json[] }) {
  return (
    <script
      type="application/ld+json"
      // Server-rendered; escape `<` to neutralise any HTML injected via data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.fullName,
    url: siteConfig.url,
    image: absoluteUrl("/opengraph-image"),
    logo: absoluteUrl("/opengraph-image"),
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phone,
    currenciesAccepted: siteConfig.currency,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressCountry: "IN",
    },
    sameAs: Object.values(siteConfig.social),
  };
}

export function webSiteSchema(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteConfig.fullName,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-IN",
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

export function productSchema(product: Product): Json {
  const url = absoluteUrl(`/product/${product.slug}`);
  const images = (product.images?.length ? product.images : product.image ? [product.image] : [])
    .map((img) => img.url)
    .filter(Boolean);
  const sku = product.variants?.[0]?.sku;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.seo?.description ?? product.story ?? product.description?.slice(0, 300),
    image: images.length ? images : undefined,
    sku,
    brand: { "@type": "Brand", name: siteConfig.fullName },
    category: product.categories?.find((c) => c.kind === "fabric")?.name,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency || siteConfig.currency,
      price: product.price,
      availability: product.available === false
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absoluteUrl("/#organization") },
    },
  };
}
