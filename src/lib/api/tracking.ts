/**
 * Live courier-tracking fetcher. Calls the BACKEND tracking endpoints (which in
 * turn call Daakia server-side with a short timeout). No Daakia credentials or
 * calls ever touch the browser. Returns `available: false` on any backend/Daakia
 * failure so the UI degrades gracefully.
 */
import type { AuthedFetch } from "@/lib/api/client";
import type { OrderTracking } from "@/types/order";

type Dict = Record<string, unknown>;
const sn = (v: unknown): string | null => (v == null ? null : String(v));

function mapTracking(d: Dict): OrderTracking {
  return {
    awb: sn(d.awb),
    vendorName: sn(d.vendor_name),
    lastStatus: sn(d.last_status),
    trackingUrl: sn(d.tracking_url),
    available: Boolean(d.available),
    events: ((d.events as Dict[]) ?? []).map((e) => ({
      message: sn(e.message),
      location: sn(e.location),
      status: sn(e.status),
      eventTime: sn(e.event_time),
    })),
  };
}

/**
 * Guest (email provided) → the email-gated public endpoint; authenticated (no
 * email) → the user-scoped account endpoint. Same gating as the order lookups.
 */
export function fetchLiveTracking(
  af: AuthedFetch,
  orderNumber: string,
  email: string | null,
): Promise<OrderTracking> {
  const enc = encodeURIComponent(orderNumber);
  const req = email
    ? af<Dict>(`/orders/${enc}/tracking`, { query: { email } })
    : af<Dict>(`/account/orders/${enc}/tracking`);
  return req.then(mapTracking);
}
