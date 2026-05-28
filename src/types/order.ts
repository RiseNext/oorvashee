import type { ProductImage } from "./product";

export type OrderStatus =
  | "placed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cod_pending";

export type PaymentMethod = "razorpay" | "cod";

export interface OrderAddress {
  recipientName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantLabel?: string;
  sku?: string;
  image: ProductImage;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderShipment {
  courierName?: string;
  trackingId?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  notes?: string;
  placedAt?: string;
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  shipment?: OrderShipment;
}
