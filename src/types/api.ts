/**
 * Backend wire DTOs — these mirror `BACKEND/app/schemas/*` EXACTLY.
 *
 * Rules:
 * - These are the raw shapes the backend returns over the wire. They are
 *   NOT the frontend domain types. Components never import from here.
 * - Only `lib/api/mappers/*` reads these and converts to domain types
 *   (`@/types/product`, etc.).
 * - Money fields arrive as decimal STRINGS (e.g. "7499.00"); mappers parse.
 * - Verify against `{API_BASE}/openapi.json` before changing anything here.
 *
 * Authoritative source: BACKEND/ai-context/API_CONTRACTS.md + the Pydantic
 * schemas in BACKEND/app/schemas/.
 */

/** Offset-paginated envelope — `Page[T]` in the backend. */
export interface BackendPage<T> {
  items: T[];
  next_cursor: string | null;
  total: number | null;
}

/** Uniform error envelope returned on every non-2xx. */
export interface BackendErrorBody {
  detail?: string;
  code?: string;
  request_id?: string;
  /** Validation errors / extra context live here. */
  meta?: unknown;
}

// ---------- Catalog ----------

/** `ProductListItem` — lean catalog-grid shape. */
export interface BackendProductListItem {
  id: string;
  slug: string;
  name: string;
  base_price: string;
  mrp: string | null;
  currency: string;
  primary_image_url: string | null;
  available: boolean;
  featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
}

/** `ImageRead`. */
export interface BackendImage {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
}

/** `VariantSummary`. `stock` is admin-only (undefined for public callers). */
export interface BackendVariant {
  id: string;
  sku: string;
  color: string | null;
  fabric: string | null;
  size: string | null;
  price: string;
  available: boolean;
  stock?: number | null;
}

/** `CategorySummary` — `description` is the single-source storefront subtitle. */
export interface BackendCategorySummary {
  id: string;
  slug: string;
  name: string;
  kind: string;
  description: string | null;
}

/** `ProductRead` — full detail. */
export interface BackendProductRead {
  id: string;
  slug: string;
  name: string;
  /** Admin-managed product code shown on the PDP (≠ variant SKU). */
  code: string | null;
  description: string | null;
  short_description: string | null;
  base_price: string;
  mrp: string | null;
  currency: string;
  status: string;
  available: boolean;
  tags: string[];
  featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  images: BackendImage[];
  variants: BackendVariant[];
  categories: BackendCategorySummary[];
}

/** `CategoryGroup` — `/categories` grouped by kind. */
export interface BackendCategoryGroup {
  fabric: BackendCategorySummary[];
  occasion: BackendCategorySummary[];
  region: BackendCategorySummary[];
  price_bracket: BackendCategorySummary[];
  color: BackendCategorySummary[];
  collection: BackendCategorySummary[];
}

/** Backend `?sort=` accepted values. */
export type BackendProductSort =
  | "new"
  | "price_asc"
  | "price_desc"
  | "bestseller"
  | "featured";

// ---------- Cart (`/account/cart`) ----------

/** `CartItemRead`. Money fields are decimal strings. */
export interface BackendCartItem {
  id: string;
  variant_id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  variant_label: string | null;
  image_url: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
  available: boolean;
  max_quantity: number;
}

/** `CartRead` — every cart mutation returns this full shape. */
export interface BackendCart {
  id: string | null;
  items: BackendCartItem[];
  item_count: number;
  distinct_count: number;
  subtotal: string;
  currency: string;
  updated_at: string | null;
  has_unavailable_items: boolean;
}

// ---------- Wishlist (`/account/wishlist`) ----------

/** `WishlistItemRead`. */
export interface BackendWishlistItem {
  id: string;
  product_id: string;
  product_slug: string;
  product_name: string;
  base_price: string;
  mrp: string | null;
  primary_image_url: string | null;
  available: boolean;
  added_at: string;
}

/** `WishlistRead`. */
export interface BackendWishlist {
  items: BackendWishlistItem[];
  count: number;
}

// ---------- Checkout (`/checkout`) ----------

/** `QuoteLineRead`. */
export interface BackendQuoteLine {
  variant_id: string;
  product_name: string;
  variant_label: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
  available: boolean;
  available_stock: number;
}

/** `CheckoutQuoteRead`. */
export interface BackendCheckoutQuote {
  items: BackendQuoteLine[];
  subtotal: string;
  shipping_amount: string;
  tax_amount: string;
  discount_amount: string;
  total: string;
  currency: string;
  has_unavailable_items: boolean;
}

/** `RazorpayHandoff`. */
export interface BackendRazorpayHandoff {
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount_paise: number;
  currency: string;
}

/** `PlaceOrderRead`. */
export interface BackendPlaceOrder {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: string;
  currency: string;
  payment: BackendRazorpayHandoff | null;
}

// ---------- Orders (`/orders`, `/account/orders`) ----------

/** `OrderItemRead`. */
export interface BackendOrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string | null;
  sku: string | null;
  primary_image_url: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
}

/** `ShipmentRead`. */
export interface BackendShipment {
  courier_name: string | null;
  tracking_id: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

/** Backend address dicts are free-form snake_case. */
export interface BackendOrderAddress {
  recipient_name?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

/** `OrderRead`. */
export interface BackendOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  email: string;
  phone: string;
  items: BackendOrderItem[];
  subtotal: string;
  shipping_amount: string;
  tax_amount: string;
  discount_amount: string;
  total: string;
  currency: string;
  shipping_address: BackendOrderAddress;
  billing_address: BackendOrderAddress | null;
  notes: string | null;
  placed_at: string | null;
  packed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  shipment: BackendShipment | null;
}
