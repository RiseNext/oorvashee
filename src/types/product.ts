export type Money = number;

export interface ProductImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  inStock: boolean;
  /** DERIVED available = stock - active reservations (Phase 6). */
  availableQuantity?: number;
  /** DB-computed: in_stock|low|selling_fast|last_one|reserved|out_of_stock. */
  availabilityState?: string;
  options: Record<string, string>;
}

export interface ProductReviewSummary {
  average: number;
  count: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  price: Money;
  compareAtPrice?: Money;
  currency: string;
  badges?: Array<"new" | "sale" | "bestseller" | "limited">;
  image: ProductImage;
  hoverImage?: ProductImage;
  rating?: ProductReviewSummary;
  collection?: { slug: string; title: string };
  fabric?: string;
  /**
   * Backend availability flag (`available`). Optional so existing mock data
   * stays valid; treat `undefined` as available. Drives the "sold out"
   * state once real catalog reads land (F1).
   */
  available?: boolean;
}

export interface Product extends ProductSummary {
  /** Admin-managed product code shown on the PDP (≠ variant SKU). */
  code?: string;
  description: string;
  story?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  /** Backend free-form tags (real product data — drives spec/highlights). */
  tags?: string[];
  /** The product's taxonomy memberships (slug+name+kind) for breadcrumb + related. */
  categories?: { slug: string; name: string; kind: string }[];
  /** Backend SEO overrides for `generateMetadata`. */
  seo?: { title?: string; description?: string };
  attributes: {
    fabric?: string;
    weave?: string;
    region?: string;
    occasion?: string;
    blousePiece?: boolean;
    length?: string;
    width?: string;
    careInstructions?: string[];
  };
  relatedProductIds?: string[];
}

export interface Collection {
  id: string;
  slug: string;
  title: string;
  description?: string;
  heroImage?: ProductImage;
  productCount?: number;
}

export interface ProductListQuery {
  collection?: string;
  /** Free-text search (backend `/products?q=`). */
  q?: string;
  /** Backend category slugs (OR-filtered). Takes precedence over `collection`. */
  categorySlugs?: string[];
  fabric?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
