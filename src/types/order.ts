import type { CartLine, CartTotals } from "./cart";

export interface Address {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  items: CartLine[];
  totals: CartTotals;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentId?: string;
}
