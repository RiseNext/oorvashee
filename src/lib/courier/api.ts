/**
 * Courier API seam — the ONE place courier backend field names appear. Every
 * function takes `authedFetch` (courier Clerk token) and returns the slim
 * `CourierOrder` domain type. The backend enforces `role=courier` (403
 * otherwise) and only ever returns delivery fields.
 */
import type { AuthedFetch } from "@/lib/api/client";
import type { CourierOrder } from "@/types/courier";

type Dict = Record<string, unknown>;
const s = (v: unknown): string => (v == null ? "" : String(v));
const sn = (v: unknown): string | null => (v == null ? null : String(v));

function mapOrder(d: Dict): CourierOrder {
  const a = (d.delivery_address as Dict) ?? {};
  return {
    orderNumber: s(d.order_number),
    customerName: s(d.customer_name),
    phone: s(d.phone),
    deliveryAddress: {
      recipientName: sn(a.recipient_name),
      phone: sn(a.phone),
      line1: sn(a.line1),
      line2: sn(a.line2),
      city: sn(a.city),
      state: sn(a.state),
      postalCode: sn(a.postal_code),
      country: sn(a.country),
    },
    status: s(d.status),
    isReady: Boolean(d.is_ready),
    awb: sn(d.awb),
    courierName: sn(d.courier_name),
  };
}

/** Paid orders awaiting / at dispatch (slim, delivery-only). */
export function listDispatchOrders(af: AuthedFetch): Promise<CourierOrder[]> {
  return af<Dict[]>("/courier/orders").then((rows) => (rows ?? []).map(mapOrder));
}

/** Set the AWB/tracking number on a Ready order (backend transitions packed → shipped). */
export function setAwb(
  af: AuthedFetch,
  orderNumber: string,
  awb: string,
  courierName?: string,
): Promise<CourierOrder> {
  return af<Dict>(`/courier/orders/${encodeURIComponent(orderNumber)}/awb`, {
    method: "POST",
    body: { awb, ...(courierName ? { courier_name: courierName } : {}) },
  }).then(mapOrder);
}
