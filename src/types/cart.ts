import type { Money, ProductImage } from "./product";

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  variantTitle?: string;
  image: ProductImage;
  unitPrice: Money;
  compareAtUnitPrice?: Money;
  quantity: number;
  maxQuantity?: number;
}

export interface CartTotals {
  subtotal: Money;
  discount: Money;
  shipping: Money;
  tax: Money;
  total: Money;
}

/**
 * Unified read shape produced by BOTH the guest cart (Zustand) and the server
 * cart (backend `CartRead`). Components consume only this; `useCart` picks the
 * source based on auth. Authoritative totals (shipping/tax/discount) come from
 * `/checkout/quote` in F4 — `subtotal` here is the line sum only.
 */
export interface CartItem {
  /** Server line id, or `${productId}::${variantId}` for a guest line. */
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  variantLabel?: string;
  image: ProductImage;
  unitPrice: Money;
  quantity: number;
  lineTotal: Money;
  available: boolean;
  /** Current stock ceiling (informational; checkout re-validates under lock). */
  maxQuantity: number;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  /** Sum of quantities. */
  itemCount: number;
  /** Number of distinct lines. */
  distinctCount: number;
  subtotal: Money;
  currency: string;
  hasUnavailableItems: boolean;
}

export interface AppliedCoupon {
  code: string;
  description?: string;
  amountOff: Money;
}
