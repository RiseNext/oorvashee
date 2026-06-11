/**
 * Public checkout + payment API. `quote` is anonymous; `placeOrder` + `verify`
 * accept an optional Bearer (to link the order to a user) and REQUIRE an
 * `Idempotency-Key` (passed through `authedFetch` → `apiFetch`). Going through
 * `authedFetch` means authed users' orders are linked automatically.
 */
import type {
  BackendCheckoutQuote,
  BackendCheckoutSession,
  BackendOrder,
  BackendPlaceOrder,
} from "@/types/api";
import type {
  CheckoutAddressInput,
  CheckoutCustomerInput,
  CheckoutQuote,
  CheckoutReservation,
  PlacedOrder,
} from "@/types/checkout";
import type { Order, PaymentMethod } from "@/types/order";
import type { AuthedFetch } from "./client";
import {
  mapCheckoutSession,
  mapOrder,
  mapPlacedOrder,
  mapQuote,
} from "./mappers/order";

export interface QuoteLineInput {
  variantId: string;
  quantity: number;
}

function toWireLines(items: QuoteLineInput[]) {
  return items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity }));
}

function toWireAddress(a: CheckoutAddressInput) {
  return {
    recipient_name: a.recipientName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 || undefined,
    city: a.city,
    state: a.state,
    postal_code: a.postalCode,
    country: a.country || "IN",
  };
}

export interface QuoteParams {
  items: QuoteLineInput[];
  shippingPostalCode?: string;
  couponCode?: string;
}

export function requestQuote(
  af: AuthedFetch,
  params: QuoteParams,
): Promise<CheckoutQuote> {
  return af<BackendCheckoutQuote>("/checkout/quote", {
    method: "POST",
    body: {
      items: toWireLines(params.items),
      shipping_postal_code: params.shippingPostalCode || undefined,
      coupon_code: params.couponCode || undefined,
    },
  }).then(mapQuote);
}

/**
 * POST /checkout — atomic, cart-level reservation. Reads the user's SERVER
 * cart (authed only), row-locks every variant, and holds available stock for
 * ~3 minutes. A 409 (reservation_conflict) carries the per-line breakdown in
 * `error.meta.lines`. Idempotent: re-calling refreshes the same session.
 */
export function startCheckout(af: AuthedFetch): Promise<CheckoutReservation> {
  return af<BackendCheckoutSession>("/checkout", { method: "POST" }).then(
    mapCheckoutSession,
  );
}

export interface StartPaymentParams {
  customer: CheckoutCustomerInput;
  shippingAddress: CheckoutAddressInput;
  billingAddress?: CheckoutAddressInput;
  notes?: string;
}

/**
 * POST /checkout/{sessionId}/pay — transitions the reservation to
 * PAYMENT_PROCESSING (15-min backstop), creates the PENDING order, and returns
 * the Razorpay handoff. The webhook is the source of truth for completion.
 */
export function startPayment(
  af: AuthedFetch,
  sessionId: string,
  params: StartPaymentParams,
): Promise<PlacedOrder> {
  return af<BackendPlaceOrder>(`/checkout/${sessionId}/pay`, {
    method: "POST",
    body: {
      customer: {
        email: params.customer.email,
        phone: params.customer.phone,
        full_name: params.customer.fullName,
      },
      shipping_address: toWireAddress(params.shippingAddress),
      billing_address: params.billingAddress
        ? toWireAddress(params.billingAddress)
        : undefined,
      notes: params.notes || undefined,
    },
  }).then(mapPlacedOrder);
}

/**
 * POST /checkout/{sessionId}/cancel — release the hold immediately when the
 * customer dismisses or fails the Razorpay widget. Frees the reserved stock
 * for others and cancels the unpaid order. 204 No Content; idempotent.
 */
export function cancelCheckout(
  af: AuthedFetch,
  sessionId: string,
): Promise<void> {
  return af<void>(`/checkout/${sessionId}/cancel`, { method: "POST" });
}

export interface PlaceOrderParams {
  items: QuoteLineInput[];
  customer: CheckoutCustomerInput;
  shippingAddress: CheckoutAddressInput;
  billingAddress?: CheckoutAddressInput;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

export function placeOrder(
  af: AuthedFetch,
  params: PlaceOrderParams,
  idempotencyKey: string,
): Promise<PlacedOrder> {
  return af<BackendPlaceOrder>("/checkout/orders", {
    method: "POST",
    idempotencyKey,
    body: {
      items: toWireLines(params.items),
      customer: {
        email: params.customer.email,
        phone: params.customer.phone,
        full_name: params.customer.fullName,
      },
      shipping_address: toWireAddress(params.shippingAddress),
      billing_address: params.billingAddress
        ? toWireAddress(params.billingAddress)
        : undefined,
      payment_method: params.paymentMethod,
      coupon_code: params.couponCode || undefined,
      notes: params.notes || undefined,
    },
  }).then(mapPlacedOrder);
}

export interface VerifyParams {
  orderNumber: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export function verifyPayment(
  af: AuthedFetch,
  params: VerifyParams,
  idempotencyKey: string,
): Promise<Order> {
  return af<BackendOrder>("/payments/verify", {
    method: "POST",
    idempotencyKey,
    body: {
      order_number: params.orderNumber,
      razorpay_order_id: params.razorpayOrderId,
      razorpay_payment_id: params.razorpayPaymentId,
      razorpay_signature: params.razorpaySignature,
    },
  }).then(mapOrder);
}
