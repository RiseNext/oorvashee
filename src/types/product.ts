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
}

export interface Product extends ProductSummary {
  description: string;
  story?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: {
    fabric?: string;
    weave?: string;
    region?: string;
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
