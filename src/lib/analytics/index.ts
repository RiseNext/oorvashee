/**
 * Analytics seam — a single, typed, dependency-free entry point for product
 * and performance events. It is a **no-op until a sink is attached**, so it
 * adds zero runtime weight and no third-party network calls until a provider
 * (GTM/GA/PostHog/etc.) is wired in production.
 *
 * Sinks, in order:
 *  1. `window.dataLayer` (Google Tag Manager) if present.
 *  2. any function registered via `registerAnalyticsSink` (e.g. PostHog).
 *  3. dev console (development only) for visibility.
 *
 * Keep events typed and intentional — do not fire noisy/PII-bearing payloads.
 */

export type AnalyticsEvent =
  | { name: "page_view"; path: string }
  | { name: "view_item"; id: string; slug: string; price: number; currency: string }
  | { name: "view_item_list"; list: string; count: number }
  | { name: "search"; query: string; results?: number }
  | { name: "add_to_cart"; variantId: string; quantity: number; value: number; currency: string }
  | { name: "remove_from_cart"; variantId: string; quantity: number }
  | { name: "add_to_wishlist"; productId: string }
  | { name: "begin_checkout"; value: number; currency: string; items: number }
  | { name: "add_payment_info"; method: "razorpay" | "cod" }
  | { name: "purchase"; orderNumber: string; value: number; currency: string }
  | { name: "web_vital"; metric: string; value: number; rating: string; id: string };

type Sink = (event: AnalyticsEvent) => void;

const sinks = new Set<Sink>();

/** Register an additional sink (e.g. from a provider bootstrap). */
export function registerAnalyticsSink(sink: Sink): () => void {
  sinks.add(sink);
  return () => sinks.delete(sink);
}

interface DataLayerWindow extends Window {
  dataLayer?: Array<Record<string, unknown>>;
}

/** Fire an analytics event to every attached sink. Safe on the server (no-op). */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  const w = window as DataLayerWindow;
  if (Array.isArray(w.dataLayer)) {
    const { name, ...params } = event;
    w.dataLayer.push({ event: name, ...params });
  }

  for (const sink of sinks) {
    try {
      sink(event);
    } catch {
      /* a failing sink must never break the app */
    }
  }

  if (process.env.NODE_ENV === "development" && sinks.size === 0 && !Array.isArray(w.dataLayer)) {
    console.debug("[analytics]", event);
  }
}
