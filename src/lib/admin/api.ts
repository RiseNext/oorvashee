/**
 * Admin API seam — the ONE place admin backend field names appear. Every
 * function takes `authedFetch` (admin Clerk token) and returns mapped domain
 * types from `@/types/admin`. Backend enforces `role=admin` (403 otherwise).
 */
import type { AuthedFetch } from "@/lib/api/client";
import type { BackendPage } from "@/types/api";
import { mapPage, toNumber } from "@/lib/api/mappers";
import type { Paginated } from "@/types/product";
import type {
  AdminCategoryItem,
  AdminCustomerItem,
  AdminImage,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminProduct,
  AdminProductListItem,
  AdminVariant,
  AnalyticsOverview,
  FulfillmentKPI,
  InventoryItem,
  OrderStatusSummary,
  ProductStatus,
  TopProductRow,
} from "@/types/admin";

const n = toNumber;
type Dict = Record<string, unknown>;
const s = (v: unknown): string => (v == null ? "" : String(v));
const sn = (v: unknown): string | null => (v == null ? null : String(v));

// ============================ Analytics ============================

export async function getOverview(af: AuthedFetch): Promise<AnalyticsOverview> {
  const d = await af<Dict>("/admin/analytics/overview");
  return {
    totalRevenue: n(d.total_revenue as string),
    totalOrders: Number(d.total_orders ?? 0),
    paidOrders: Number(d.paid_orders ?? 0),
    averageOrderValue: n(d.average_order_value as string),
    unitsSold: Number(d.units_sold ?? 0),
    newCustomers: Number(d.new_customers ?? 0),
    guestOrders: Number(d.guest_orders ?? 0),
  };
}

export async function getFulfillmentKPIs(af: AuthedFetch): Promise<FulfillmentKPI> {
  const d = await af<Dict>("/admin/analytics/fulfillment");
  return {
    awaitingPacking: Number(d.awaiting_packing ?? 0),
    awaitingShipment: Number(d.awaiting_shipment ?? 0),
    inTransit: Number(d.in_transit ?? 0),
    deliveredToday: Number(d.delivered_today ?? 0),
    shippedMissingTracking: Number(d.shipped_missing_tracking ?? 0),
    codOutstanding: Number(d.cod_outstanding ?? 0),
  };
}

export async function getTopProducts(af: AuthedFetch, limit = 5): Promise<TopProductRow[]> {
  const d = await af<{ rows: Dict[] }>("/admin/analytics/top-products", { query: { limit } });
  return (d.rows ?? []).map((r) => ({
    productId: s(r.product_id),
    productName: s(r.product_name),
    productSlug: s(r.product_slug),
    unitsSold: Number(r.units_sold ?? 0),
    revenue: n(r.revenue as string),
    orders: Number(r.orders ?? 0),
  }));
}

export async function getOrderStatusSummary(af: AuthedFetch): Promise<OrderStatusSummary> {
  const d = await af<Dict>("/admin/orders/summary");
  return {
    placed: Number(d.placed ?? 0),
    packed: Number(d.packed ?? 0),
    shipped: Number(d.shipped ?? 0),
    delivered: Number(d.delivered ?? 0),
    cancelled: Number(d.cancelled ?? 0),
    awaitingFulfillment: Number(d.awaiting_fulfillment ?? 0),
    pendingShipment: Number(d.pending_shipment ?? 0),
    codPending: Number(d.cod_pending ?? 0),
    totalOrders: Number(d.total_orders ?? 0),
    totalRevenuePaid: n(d.total_revenue_paid as string),
  };
}

// ============================ Products ============================

function mapProductListItem(d: Dict): AdminProductListItem {
  return {
    id: s(d.id),
    slug: s(d.slug),
    name: s(d.name),
    status: s(d.status) as ProductStatus,
    basePrice: n(d.base_price as string),
    currency: s(d.currency),
    featured: Boolean(d.featured),
    isBestseller: Boolean(d.is_bestseller),
    isNew: Boolean(d.is_new),
    primaryImageUrl: sn(d.primary_image_url),
    totalStock: Number(d.total_stock ?? 0),
    variantCount: Number(d.variant_count ?? 0),
    categories: (d.categories as string[]) ?? [],
    updatedAt: s(d.updated_at),
  };
}

function mapVariant(d: Dict): AdminVariant {
  return {
    id: s(d.id),
    sku: s(d.sku),
    color: sn(d.color),
    fabric: sn(d.fabric),
    size: sn(d.size),
    priceOverride: d.price_override == null ? null : n(d.price_override as string),
    isDefault: Boolean(d.is_default),
    isActive: Boolean(d.is_active),
    stock: Number(d.stock ?? 0),
    reserved: Number(d.reserved ?? 0),
    lowStockThreshold: Number(d.low_stock_threshold ?? 0),
  };
}

function mapImage(d: Dict): AdminImage {
  return {
    id: s(d.id),
    publicId: s(d.cloudinary_public_id),
    url: s(d.url),
    altText: sn(d.alt_text),
    position: Number(d.position ?? 0),
    isPrimary: Boolean(d.is_primary),
  };
}

function mapProduct(d: Dict): AdminProduct {
  return {
    id: s(d.id),
    slug: s(d.slug),
    name: s(d.name),
    shortDescription: sn(d.short_description),
    description: sn(d.description),
    basePrice: n(d.base_price as string),
    mrp: d.mrp == null ? null : n(d.mrp as string),
    currency: s(d.currency),
    status: s(d.status) as ProductStatus,
    tags: (d.tags as string[]) ?? [],
    featured: Boolean(d.featured),
    isBestseller: Boolean(d.is_bestseller),
    isNew: Boolean(d.is_new),
    seoTitle: sn(d.seo_title),
    seoDescription: sn(d.seo_description),
    publishedAt: sn(d.published_at),
    updatedAt: s(d.updated_at),
    variants: ((d.variants as Dict[]) ?? []).map(mapVariant),
    images: ((d.images as Dict[]) ?? []).map(mapImage).sort((a, b) => a.position - b.position),
    categoryIds: (d.category_ids as string[]) ?? [],
  };
}

export interface ProductListParams {
  q?: string;
  status?: ProductStatus[];
  page?: number;
  pageSize?: number;
}

export function listProducts(
  af: AuthedFetch,
  params: ProductListParams = {},
): Promise<Paginated<AdminProductListItem>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  return af<BackendPage<Dict>>("/admin/products", {
    query: { q: params.q, status: params.status, page, page_size: pageSize },
  }).then((p) => mapPage(p, mapProductListItem, { page, pageSize }));
}

export function getProduct(af: AuthedFetch, id: string): Promise<AdminProduct> {
  return af<Dict>(`/admin/products/${id}`).then(mapProduct);
}

export function createProduct(
  af: AuthedFetch,
  body: { name: string; basePrice: number; shortDescription?: string },
): Promise<AdminProduct> {
  return af<Dict>("/admin/products", {
    method: "POST",
    body: {
      name: body.name,
      base_price: body.basePrice,
      short_description: body.shortDescription || undefined,
    },
  }).then(mapProduct);
}

export interface ProductUpdateBody {
  name?: string;
  shortDescription?: string;
  description?: string;
  basePrice?: number;
  mrp?: number | null;
  tags?: string[];
  featured?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export function updateProduct(af: AuthedFetch, id: string, body: ProductUpdateBody): Promise<AdminProduct> {
  return af<Dict>(`/admin/products/${id}`, {
    method: "PATCH",
    body: {
      name: body.name,
      short_description: body.shortDescription,
      description: body.description,
      base_price: body.basePrice,
      mrp: body.mrp,
      tags: body.tags,
      featured: body.featured,
      is_bestseller: body.isBestseller,
      is_new: body.isNew,
      seo_title: body.seoTitle,
      seo_description: body.seoDescription,
    },
  }).then(mapProduct);
}

export type ProductTransition = "publish" | "unpublish" | "archive" | "unarchive";

export function transitionProduct(af: AuthedFetch, id: string, t: ProductTransition): Promise<AdminProduct> {
  return af<Dict>(`/admin/products/${id}/${t}`, { method: "POST" }).then(mapProduct);
}

// ---------- Variants ----------
export interface VariantCreateInput {
  sku: string;
  color?: string | null;
  fabric?: string | null;
  size?: string | null;
  /** Per-variant price; falls back to product.basePrice when null. */
  priceOverride?: number | null;
  isActive?: boolean;
  isDefault?: boolean;
  /** Seeds the variant's inventory row in the same transaction. */
  initialStock?: number;
  lowStockThreshold?: number;
}

/** Create a variant (+ its inventory row). Backend keys it by product id. */
export function createVariant(
  af: AuthedFetch,
  productId: string,
  input: VariantCreateInput,
): Promise<AdminVariant> {
  return af<Dict>(`/admin/products/${productId}/variants`, {
    method: "POST",
    body: {
      sku: input.sku,
      color: input.color ?? null,
      fabric: input.fabric ?? null,
      size: input.size ?? null,
      price_override: input.priceOverride ?? null,
      is_active: input.isActive ?? true,
      is_default: input.isDefault ?? false,
      initial_stock: input.initialStock ?? 0,
      low_stock_threshold: input.lowStockThreshold ?? 2,
    },
  }).then(mapVariant);
}

export interface VariantUpdateInput {
  color?: string | null;
  fabric?: string | null;
  size?: string | null;
  priceOverride?: number | null;
  isActive?: boolean;
  isDefault?: boolean;
}

/**
 * Partial variant update. Only the provided fields are sent. Stock is NOT
 * updatable here — it flows through the inventory adjust endpoint. Setting
 * `isActive: false` is the soft-deactivate path (reversible).
 */
export function updateVariant(
  af: AuthedFetch,
  productId: string,
  variantId: string,
  patch: VariantUpdateInput,
): Promise<AdminVariant> {
  const body: Record<string, unknown> = {};
  if (patch.color !== undefined) body.color = patch.color;
  if (patch.fabric !== undefined) body.fabric = patch.fabric;
  if (patch.size !== undefined) body.size = patch.size;
  if (patch.priceOverride !== undefined) body.price_override = patch.priceOverride;
  if (patch.isActive !== undefined) body.is_active = patch.isActive;
  if (patch.isDefault !== undefined) body.is_default = patch.isDefault;
  return af<Dict>(`/admin/products/${productId}/variants/${variantId}`, {
    method: "PATCH",
    body,
  }).then(mapVariant);
}

// ---------- Categories (product assignment) ----------

/**
 * Replace a product's category set (PUT = replace-semantics, idempotent under
 * retry). Backend validates every id is an existing, active category and
 * returns the full updated product.
 */
export function setProductCategories(
  af: AuthedFetch,
  productId: string,
  categoryIds: string[],
): Promise<AdminProduct> {
  return af<Dict>(`/admin/products/${productId}/categories`, {
    method: "PUT",
    body: { category_ids: categoryIds },
  }).then(mapProduct);
}

// ---------- Media (Cloudinary signed upload) ----------
export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  uploadUrl: string;
  folder: string;
  eager: string[];
  publicId: string | null;
  resourceType: string;
}

export function signUpload(af: AuthedFetch, entityId: string): Promise<UploadSignature> {
  return af<Dict>("/admin/media/sign", {
    method: "POST",
    body: { context: "product", entity_id: entityId },
  }).then((d) => ({
    cloudName: s(d.cloud_name),
    apiKey: s(d.api_key),
    timestamp: Number(d.timestamp),
    signature: s(d.signature),
    uploadUrl: s(d.upload_url),
    folder: s(d.folder),
    eager: (d.eager as string[]) ?? [],
    publicId: sn(d.public_id),
    resourceType: s(d.resource_type) || "image",
  }));
}

/**
 * Upload a file to Cloudinary with the signed envelope, returning the raw
 * Cloudinary result (the backend re-verifies its signature on attach).
 *
 * Only the stable, deterministic fields the backend signs are transmitted:
 * `timestamp`, `folder`, and (when present) `eager` / `public_id`. `eager` is
 * pipe-joined to match the backend's canonicalisation exactly. Cloudinary sorts
 * the received params itself before verifying, so append order is irrelevant —
 * only the values (and the set) must match what was signed.
 */
export async function uploadToCloudinary(sig: UploadSignature, file: File): Promise<Dict> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("signature", sig.signature);
  fd.append("folder", sig.folder);
  if (sig.eager.length > 0) fd.append("eager", sig.eager.join("|"));
  if (sig.publicId) fd.append("public_id", sig.publicId);

  // TEMPORARY forensic debug — REMOVE after diagnosing Cloudinary 401.
  // Logs every transmitted FormData field/value (file shown as a summary).
  const debugFields: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    debugFields[k] = v instanceof File ? `File(${v.name}, ${v.size}B, ${v.type})` : String(v);
  }
  console.warn("[DEBUG cloudinary upload] url:", sig.uploadUrl, "fields:", debugFields);

  const res = await fetch(sig.uploadUrl, { method: "POST", body: fd });
  if (!res.ok) {
    // TEMPORARY forensic debug — surface the real Cloudinary error body.
    const body = await res.text().catch(() => "<unreadable>");
    console.error("[DEBUG cloudinary upload] FAILED", res.status, res.statusText, body);
    throw new Error(`Cloudinary upload failed: ${res.status} ${body}`);
  }
  return (await res.json()) as Dict;
}

/** Attach an uploaded Cloudinary asset to a product (backend verifies the signature). */
export function attachProductImage(
  af: AuthedFetch,
  productId: string,
  cloudinaryResponse: Dict,
  opts: { isPrimary?: boolean; altText?: string } = {},
): Promise<void> {
  return af<Dict>(`/admin/products/${productId}/images`, {
    method: "POST",
    body: {
      cloudinary_response: cloudinaryResponse,
      is_primary: opts.isPrimary ?? false,
      alt_text: opts.altText,
    },
  }).then(() => undefined);
}

export function deleteProductImage(af: AuthedFetch, productId: string, imageId: string): Promise<void> {
  return af<void>(`/admin/products/${productId}/images/${imageId}`, { method: "DELETE" }).then(() => undefined);
}

// ============================ Orders ============================

function mapOrderListItem(d: Dict): AdminOrderListItem {
  return {
    id: s(d.id),
    orderNumber: s(d.order_number),
    customerName: s(d.customer_name),
    email: s(d.email),
    status: s(d.status) as AdminOrderListItem["status"],
    paymentStatus: s(d.payment_status) as AdminOrderListItem["paymentStatus"],
    paymentMethod: s(d.payment_method) as AdminOrderListItem["paymentMethod"],
    total: n(d.total as string),
    currency: s(d.currency),
    itemCount: Number(d.item_count ?? 0),
    hasShipment: Boolean(d.has_shipment),
    createdAt: s(d.created_at),
  };
}

function mapOrderDetail(d: Dict): AdminOrderDetail {
  return {
    id: s(d.id),
    orderNumber: s(d.order_number),
    customerName: s(d.customer_name),
    email: s(d.email),
    phone: s(d.phone),
    status: s(d.status) as AdminOrderDetail["status"],
    paymentStatus: s(d.payment_status) as AdminOrderDetail["paymentStatus"],
    paymentMethod: s(d.payment_method) as AdminOrderDetail["paymentMethod"],
    subtotal: n(d.subtotal as string),
    shippingAmount: n(d.shipping_amount as string),
    taxAmount: n(d.tax_amount as string),
    discountAmount: n(d.discount_amount as string),
    total: n(d.total as string),
    currency: s(d.currency),
    shippingAddress: (d.shipping_address as Dict) ?? {},
    notes: sn(d.notes),
    createdAt: s(d.created_at),
    items: ((d.items as Dict[]) ?? []).map((i) => ({
      id: s(i.id),
      productName: s(i.product_name),
      variantLabel: sn(i.variant_label),
      sku: sn(i.sku),
      primaryImageUrl: sn(i.primary_image_url),
      unitPrice: n(i.unit_price as string),
      quantity: Number(i.quantity ?? 0),
      lineTotal: n(i.line_total as string),
    })),
    shipment: d.shipment
      ? {
          courierName: sn((d.shipment as Dict).courier_name),
          trackingId: sn((d.shipment as Dict).tracking_id),
          trackingUrl: sn((d.shipment as Dict).tracking_url),
          shippedAt: sn((d.shipment as Dict).shipped_at),
          deliveredAt: sn((d.shipment as Dict).delivered_at),
        }
      : null,
    timeline: ((d.timeline as Dict[]) ?? []).map((t) => ({
      at: s(t.at),
      type: s(t.type),
      summary: s(t.summary),
    })),
  };
}

export interface OrderListParams {
  q?: string;
  status?: string[];
  page?: number;
  pageSize?: number;
}

export function listOrders(
  af: AuthedFetch,
  params: OrderListParams = {},
): Promise<Paginated<AdminOrderListItem>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  return af<BackendPage<Dict>>("/admin/orders", {
    query: { q: params.q, status: params.status, page, page_size: pageSize },
  }).then((p) => mapPage(p, mapOrderListItem, { page, pageSize }));
}

// NB: admin order endpoints are keyed by the order **id** (UUID), not the
// order_number — callers pass `order.id`.
export function getOrder(af: AuthedFetch, id: string): Promise<AdminOrderDetail> {
  return af<Dict>(`/admin/orders/${id}`).then(mapOrderDetail);
}

export function markPacked(af: AuthedFetch, num: string): Promise<AdminOrderDetail> {
  return af<Dict>(`/admin/orders/${num}/packed`, { method: "POST" }).then(mapOrderDetail);
}

export function markShipped(
  af: AuthedFetch,
  num: string,
  shipment: { courierName?: string; trackingId?: string; trackingUrl?: string },
): Promise<AdminOrderDetail> {
  return af<Dict>(`/admin/orders/${num}/shipped`, {
    method: "POST",
    body: {
      courier_name: shipment.courierName,
      tracking_id: shipment.trackingId,
      tracking_url: shipment.trackingUrl,
    },
  }).then(mapOrderDetail);
}

export function markDelivered(af: AuthedFetch, num: string): Promise<AdminOrderDetail> {
  return af<Dict>(`/admin/orders/${num}/delivered`, { method: "POST" }).then(mapOrderDetail);
}

export function markCodPaid(af: AuthedFetch, num: string): Promise<AdminOrderDetail> {
  return af<Dict>(`/admin/orders/${num}/cod-paid`, { method: "POST" }).then(mapOrderDetail);
}

export function cancelOrder(af: AuthedFetch, num: string, reason: string): Promise<AdminOrderDetail> {
  return af<Dict>(`/admin/orders/${num}/cancel`, {
    method: "POST",
    body: { reason },
  }).then(mapOrderDetail);
}

export function addOrderNote(af: AuthedFetch, num: string, note: string): Promise<AdminOrderDetail> {
  return af<Dict>(`/admin/orders/${num}/notes`, { method: "POST", body: { note } }).then(mapOrderDetail);
}

// ============================ Inventory ============================

function mapInventoryItem(d: Dict): InventoryItem {
  return {
    variantId: s(d.variant_id),
    sku: s(d.sku),
    productId: s(d.product_id),
    productName: s(d.product_name),
    productSlug: s(d.product_slug),
    variantLabel: sn(d.variant_label),
    stock: Number(d.stock ?? 0),
    reserved: Number(d.reserved ?? 0),
    available: Number(d.available ?? 0),
    lowStockThreshold: Number(d.low_stock_threshold ?? 0),
    isLowStock: Boolean(d.is_low_stock),
    isOutOfStock: Boolean(d.is_out_of_stock),
    price: n(d.price as string),
  };
}

export interface InventoryListParams {
  q?: string;
  lowStockOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export function listInventory(
  af: AuthedFetch,
  params: InventoryListParams = {},
): Promise<Paginated<InventoryItem>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  return af<BackendPage<Dict>>("/admin/inventory", {
    query: { q: params.q, low_stock_only: params.lowStockOnly, page, page_size: pageSize },
  }).then((p) => mapPage(p, mapInventoryItem, { page, pageSize }));
}

export function adjustStock(
  af: AuthedFetch,
  variantId: string,
  mode: "set" | "increment" | "decrement",
  value: number,
  note?: string,
): Promise<InventoryItem> {
  return af<Dict>(`/admin/inventory/${variantId}/adjust`, {
    method: "POST",
    body: { mode, value, reason: "manual_adjustment", note },
  }).then((d) => ({
    // adjust returns a movement result; the list re-fetches for fresh rows.
    variantId: s(d.variant_id),
    sku: s(d.sku),
    productId: "",
    productName: "",
    productSlug: "",
    variantLabel: null,
    stock: Number(d.stock_after ?? 0),
    reserved: Number(d.reserved ?? 0),
    available: Math.max(0, Number(d.stock_after ?? 0) - Number(d.reserved ?? 0)),
    lowStockThreshold: 0,
    isLowStock: false,
    isOutOfStock: Number(d.stock_after ?? 0) === 0,
    price: 0,
  }));
}

// ============================ Categories ============================

function mapCategoryItem(d: Dict): AdminCategoryItem {
  return {
    id: s(d.id),
    slug: s(d.slug),
    name: s(d.name),
    kind: s(d.kind),
    parentId: sn(d.parent_id),
    displayOrder: Number(d.display_order ?? 0),
    isActive: Boolean(d.is_active),
  };
}

export function listCategories(af: AuthedFetch): Promise<AdminCategoryItem[]> {
  return af<BackendPage<Dict> | Dict[]>("/admin/categories", { query: { page_size: 100 } }).then((p) => {
    const items = Array.isArray(p) ? p : ((p as BackendPage<Dict>).items ?? []);
    return items.map(mapCategoryItem);
  });
}

export function setCategoryActive(af: AuthedFetch, id: string, active: boolean): Promise<void> {
  return af<Dict>(`/admin/categories/${id}/${active ? "unarchive" : "archive"}`, {
    method: "POST",
  }).then(() => undefined);
}

// ============================ Policies ============================

export interface AdminPolicy {
  id: string;
  /** Immutable storefront key (privacy | shipping | refund | terms). */
  key: string;
  title: string;
  summary: string | null;
  /** Full text; paragraphs separated by blank lines. */
  body: string;
  displayOrder: number;
  isActive: boolean;
  updatedAt: string;
}

function mapPolicy(d: Dict): AdminPolicy {
  return {
    id: s(d.id),
    key: s(d.key),
    title: s(d.title),
    summary: sn(d.summary),
    body: s(d.body),
    displayOrder: Number(d.display_order ?? 0),
    isActive: Boolean(d.is_active),
    updatedAt: s(d.updated_at),
  };
}

/** All store policies (active + hidden), in display order. */
export function listPolicies(af: AuthedFetch): Promise<AdminPolicy[]> {
  return af<Dict[]>("/admin/policies").then((rows) => (rows ?? []).map(mapPolicy));
}

export interface PolicyUpdateBody {
  title?: string;
  summary?: string;
  body?: string;
  displayOrder?: number;
  isActive?: boolean;
}

/** Edit a policy. `key` is immutable, so it is never sent. */
export function updatePolicy(
  af: AuthedFetch,
  id: string,
  patch: PolicyUpdateBody,
): Promise<AdminPolicy> {
  const body: Record<string, unknown> = {};
  if (patch.title !== undefined) body.title = patch.title;
  if (patch.summary !== undefined) body.summary = patch.summary;
  if (patch.body !== undefined) body.body = patch.body;
  if (patch.displayOrder !== undefined) body.display_order = patch.displayOrder;
  if (patch.isActive !== undefined) body.is_active = patch.isActive;
  return af<Dict>(`/admin/policies/${id}`, { method: "PATCH", body }).then(mapPolicy);
}

// ============================ Customers ============================

function mapCustomerItem(d: Dict): AdminCustomerItem {
  return {
    id: s(d.id),
    email: s(d.email),
    fullName: sn(d.full_name),
    phone: sn(d.phone),
    ordersCount: Number(d.orders_count ?? 0),
    paidOrdersCount: Number(d.paid_orders_count ?? 0),
    lifetimeValue: n(d.lifetime_value as string),
    lastOrderAt: sn(d.last_order_at),
    createdAt: s(d.created_at),
  };
}

export function listCustomers(
  af: AuthedFetch,
  params: { q?: string; page?: number; pageSize?: number } = {},
): Promise<Paginated<AdminCustomerItem>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  return af<BackendPage<Dict>>("/admin/customers", {
    query: { q: params.q, page, page_size: pageSize },
  }).then((p) => mapPage(p, mapCustomerItem, { page, pageSize }));
}
