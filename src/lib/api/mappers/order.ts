/**
 * Checkout + order mappers — the ONLY place backend checkout/order field names
 * appear in domain code.
 */
import type {
  BackendCheckoutQuote,
  BackendCheckoutSession,
  BackendOrder,
  BackendOrderAddress,
  BackendOrderItem,
  BackendPlaceOrder,
} from "@/types/api";
import type {
  CheckoutQuote,
  CheckoutReservation,
  PlacedOrder,
} from "@/types/checkout";
import type {
  Order,
  OrderAddress,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";

import { PLACEHOLDER_IMAGE, toNumber } from "./product";

export function mapQuote(dto: BackendCheckoutQuote): CheckoutQuote {
  return {
    items: dto.items.map((i) => ({
      variantId: i.variant_id,
      productName: i.product_name,
      variantLabel: i.variant_label ?? undefined,
      unitPrice: toNumber(i.unit_price),
      quantity: i.quantity,
      lineTotal: toNumber(i.line_total),
      available: i.available,
      availableStock: i.available_stock,
    })),
    subtotal: toNumber(dto.subtotal),
    shippingAmount: toNumber(dto.shipping_amount),
    taxAmount: toNumber(dto.tax_amount),
    discountAmount: toNumber(dto.discount_amount),
    total: toNumber(dto.total),
    currency: dto.currency,
    hasUnavailableItems: dto.has_unavailable_items,
  };
}

export function mapCheckoutSession(
  dto: BackendCheckoutSession,
): CheckoutReservation {
  return {
    sessionId: dto.session_id,
    status: dto.status,
    expiresAt: dto.expires_at,
    expiresInSeconds: dto.expires_in_seconds,
    lines: dto.lines.map((l) => ({
      variantId: l.variant_id,
      productName: l.product_name,
      variantLabel: l.variant_label ?? undefined,
      requested: l.requested,
      available: l.available,
      reserved: l.reserved,
      reason: l.reason ?? undefined,
    })),
  };
}

export function mapPlacedOrder(dto: BackendPlaceOrder): PlacedOrder {
  return {
    orderNumber: dto.order_number,
    status: dto.status as OrderStatus,
    paymentStatus: dto.payment_status as PaymentStatus,
    paymentMethod: dto.payment_method as PaymentMethod,
    total: toNumber(dto.total),
    currency: dto.currency,
    payment: dto.payment
      ? {
          razorpayOrderId: dto.payment.razorpay_order_id,
          razorpayKeyId: dto.payment.razorpay_key_id,
          amountPaise: dto.payment.amount_paise,
          currency: dto.payment.currency,
        }
      : undefined,
  };
}

function mapAddress(a: BackendOrderAddress | null): OrderAddress | undefined {
  if (!a) return undefined;
  return {
    recipientName: a.recipient_name,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    state: a.state,
    postalCode: a.postal_code,
    country: a.country,
  };
}

function mapOrderItem(i: BackendOrderItem): OrderItem {
  return {
    id: i.id,
    productId: i.product_id,
    variantId: i.variant_id,
    productName: i.product_name,
    variantLabel: i.variant_label ?? undefined,
    sku: i.sku ?? undefined,
    image: { url: i.primary_image_url ?? PLACEHOLDER_IMAGE, alt: i.product_name },
    unitPrice: toNumber(i.unit_price),
    quantity: i.quantity,
    lineTotal: toNumber(i.line_total),
  };
}

export function mapOrder(dto: BackendOrder): Order {
  return {
    id: dto.id,
    orderNumber: dto.order_number,
    status: dto.status as OrderStatus,
    paymentStatus: dto.payment_status as PaymentStatus,
    paymentMethod: dto.payment_method as PaymentMethod,
    customerName: dto.customer_name,
    email: dto.email,
    phone: dto.phone,
    items: dto.items.map(mapOrderItem),
    subtotal: toNumber(dto.subtotal),
    shippingAmount: toNumber(dto.shipping_amount),
    taxAmount: toNumber(dto.tax_amount),
    discountAmount: toNumber(dto.discount_amount),
    total: toNumber(dto.total),
    currency: dto.currency,
    shippingAddress: mapAddress(dto.shipping_address) ?? {},
    billingAddress: mapAddress(dto.billing_address),
    notes: dto.notes ?? undefined,
    placedAt: dto.placed_at ?? undefined,
    packedAt: dto.packed_at ?? undefined,
    shippedAt: dto.shipped_at ?? undefined,
    deliveredAt: dto.delivered_at ?? undefined,
    cancelledAt: dto.cancelled_at ?? undefined,
    createdAt: dto.created_at,
    shipment: dto.shipment
      ? {
          courierName: dto.shipment.courier_name ?? undefined,
          trackingId: dto.shipment.tracking_id ?? undefined,
          trackingUrl: dto.shipment.tracking_url ?? undefined,
          shippedAt: dto.shipment.shipped_at ?? undefined,
          deliveredAt: dto.shipment.delivered_at ?? undefined,
        }
      : undefined,
  };
}
