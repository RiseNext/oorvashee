/**
 * Admin domain types (camelCase). Wire DTOs (snake_case) live in
 * `lib/admin/api.ts` and are mapped there — components only see these.
 */
import type { Paginated } from "./product";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "./order";

export type ProductStatus = "draft" | "published" | "unavailable" | "archived";

// ---------- Products ----------
export interface AdminProductListItem {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  basePrice: number;
  currency: string;
  featured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  primaryImageUrl: string | null;
  totalStock: number;
  variantCount: number;
  categories: string[];
  updatedAt: string;
}

export interface AdminVariant {
  id: string;
  sku: string;
  color: string | null;
  fabric: string | null;
  size: string | null;
  priceOverride: number | null;
  isDefault: boolean;
  isActive: boolean;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
}

export interface AdminImage {
  id: string;
  publicId: string;
  url: string;
  altText: string | null;
  position: number;
  isPrimary: boolean;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  /** Admin-managed product code shown on the storefront PDP (≠ variant SKU). */
  code: string | null;
  shortDescription: string | null;
  description: string | null;
  basePrice: number;
  mrp: number | null;
  currency: string;
  status: ProductStatus;
  tags: string[];
  featured: boolean;
  isBestseller: boolean;
  isNew: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  updatedAt: string;
  variants: AdminVariant[];
  images: AdminImage[];
  categoryIds: string[];
}

// ---------- Orders ----------
export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  currency: string;
  itemCount: number;
  hasShipment: boolean;
  createdAt: string;
}

export interface AdminOrderItem {
  id: string;
  productName: string;
  variantLabel: string | null;
  sku: string | null;
  primaryImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface AdminTimelineEvent {
  at: string;
  type: string;
  summary: string;
}

export interface AdminShipment {
  courierName: string | null;
  trackingId: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  shippingAddress: Record<string, unknown>;
  notes: string | null;
  createdAt: string;
  items: AdminOrderItem[];
  shipment: AdminShipment | null;
  timeline: AdminTimelineEvent[];
}

export interface OrderStatusSummary {
  placed: number;
  packed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  awaitingFulfillment: number;
  pendingShipment: number;
  codPending: number;
  totalOrders: number;
  totalRevenuePaid: number;
}

// ---------- Inventory ----------
export interface InventoryItem {
  variantId: string;
  sku: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantLabel: string | null;
  stock: number;
  /** Derived — SUM of active (reserved + payment_processing) reservations. */
  reserved: number;
  available: number;
  /** Cumulative units sold (forward-only analytics). */
  sold: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  price: number;
}

// ---------- Reservations ----------
export type ReservationBucket = "active" | "expired" | "completed" | "cancelled";

export interface AdminReservation {
  id: string;
  checkoutSessionId: string;
  variantId: string;
  sku: string;
  productName: string;
  userId: string;
  quantity: number;
  status: string;
  bucket: ReservationBucket;
  /** Active row already past its expiry, awaiting the cron sweep. */
  isExpired: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Categories ----------
export interface AdminCategoryItem {
  id: string;
  slug: string;
  name: string;
  kind: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
}

// ---------- Customers ----------
export interface AdminCustomerItem {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  ordersCount: number;
  paidOrdersCount: number;
  lifetimeValue: number;
  lastOrderAt: string | null;
  createdAt: string;
}

// ---------- Analytics ----------
export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  averageOrderValue: number;
  unitsSold: number;
  newCustomers: number;
  guestOrders: number;
}

export interface FulfillmentKPI {
  awaitingPacking: number;
  awaitingShipment: number;
  inTransit: number;
  deliveredToday: number;
  shippedMissingTracking: number;
  codOutstanding: number;
}

export interface TopProductRow {
  productId: string;
  productName: string;
  productSlug: string;
  unitsSold: number;
  revenue: number;
  orders: number;
}

export type { Paginated };
