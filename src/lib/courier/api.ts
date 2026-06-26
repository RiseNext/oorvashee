/**
 * Courier API seam — the ONE place courier backend field names appear. Every
 * function takes `authedFetch` (courier Clerk token) and returns the slim
 * `CourierOrder` domain type. The backend enforces `role=courier` (403
 * otherwise) and only ever returns delivery fields.
 */
import type { AuthedFetch } from "@/lib/api/client";
import type { CourierOrder, CourierVendor } from "@/types/courier";

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
    vendorId: d.vendor_id == null ? null : Number(d.vendor_id),
  };
}

/** Paid orders awaiting / at dispatch (slim, delivery-only). */
export function listDispatchOrders(af: AuthedFetch): Promise<CourierOrder[]> {
  return af<Dict[]>("/courier/orders").then((rows) => (rows ?? []).map(mapOrder));
}

/** Daakia carriers for the AWB dropdown (backend calls Daakia; cached there). */
export function listVendors(af: AuthedFetch): Promise<CourierVendor[]> {
  return af<Dict[]>("/courier/vendors").then((rows) =>
    (rows ?? []).map((d) => ({
      vendorId: Number(d.vendor_id),
      vendorName: sn(d.vendor_name),
    })),
  );
}

/**
 * Set the AWB + carrier (vendor) on a Ready order. The backend transitions
 * packed → shipped and stores the vendor so the customer page can track live.
 */
export function setAwb(
  af: AuthedFetch,
  orderNumber: string,
  awb: string,
  vendorId: number,
  vendorName?: string | null,
): Promise<CourierOrder> {
  return af<Dict>(`/courier/orders/${encodeURIComponent(orderNumber)}/awb`, {
    method: "POST",
    body: {
      awb,
      vendor_id: vendorId,
      ...(vendorName ? { vendor_name: vendorName } : {}),
    },
  }).then(mapOrder);
}
