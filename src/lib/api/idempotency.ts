/**
 * Idempotency-Key generation for write endpoints the backend protects
 * (`/checkout/orders`, `/payments/verify`). Generate ONE key per logical
 * submit attempt and reuse it across retries so a network blip can't
 * double-charge or double-create.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for any environment without WebCrypto.
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
