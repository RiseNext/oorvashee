/**
 * Courier portal domain types — the SLIM, delivery-only shape the backend
 * `/courier` API returns. Deliberately carries no payment, totals, email,
 * billing, or item data (see BACKEND/app/schemas/courier.py).
 */

export interface CourierDeliveryAddress {
  recipientName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface CourierOrder {
  orderNumber: string;
  customerName: string;
  phone: string;
  deliveryAddress: CourierDeliveryAddress;
  /** Fulfillment lifecycle only: placed | packed | shipped. */
  status: string;
  /** True when the admin has marked it Ready for Dispatch (status === "packed"). */
  isReady: boolean;
  awb: string | null;
  courierName: string | null;
}
