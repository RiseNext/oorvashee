import type { OrderStatus, PaymentMethod, PaymentStatus } from "./order";

export interface CheckoutCustomerInput {
  email: string;
  phone: string;
  fullName: string;
}

export interface CheckoutAddressInput {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  /** ISO-2; backend defaults to "IN". */
  country: string;
}

export interface QuoteItem {
  variantId: string;
  productName: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  available: boolean;
  availableStock: number;
}

/** Server-authoritative totals (the ONLY trusted pricing). */
export interface CheckoutQuote {
  items: QuoteItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  hasUnavailableItems: boolean;
}

export interface RazorpayHandoff {
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountPaise: number;
  currency: string;
}

export interface PlacedOrder {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  currency: string;
  /** Present only for razorpay orders — drives the Razorpay widget. */
  payment?: RazorpayHandoff;
}
