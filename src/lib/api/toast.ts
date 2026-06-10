import { toast } from "sonner";
import { ApiError } from "./errors";

/**
 * Maps backend error `code`s to customer-friendly copy. Anything not
 * listed falls back to the backend `detail` string, then a generic line.
 */
const FRIENDLY_BY_CODE: Record<string, string> = {
  rate_limit_exceeded: "Too many requests — please wait a moment and try again.",
  out_of_stock: "Sorry, this piece just sold out.",
  not_found: "We couldn't find what you were looking for.",
  validation_error: "Please check the highlighted fields and try again.",
  unauthenticated: "Please sign in to continue.",
  forbidden: "You don't have permission to do that.",
  payment_failed: "Payment couldn't be completed. Please try again.",
  idempotency_conflict: "This request was already processed.",
  reservation_conflict: "Some items are no longer available — please update your bag.",
  reservation_expired: "Your 3-minute hold expired — refreshing your reservation.",
  payment_in_progress: "A payment is already in progress for this checkout.",
  product_unavailable: "This piece is no longer available.",
};

/**
 * Surface an API error as a toast. Logs status/code/requestId to the
 * console for support correlation (the backend's `X-Request-ID`).
 */
export function toastApiError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): void {
  if (error instanceof ApiError) {
    const message = FRIENDLY_BY_CODE[error.code] ?? error.detail ?? fallback;
    toast.error(message, {
      description: error.requestId ? `Reference: ${error.requestId}` : undefined,
    });
    if (typeof console !== "undefined") {
      console.error(
        `[ApiError] ${error.status} ${error.code}`,
        error.requestId ? `req=${error.requestId}` : "",
        error.details,
      );
    }
    return;
  }
  toast.error(fallback);
  if (typeof console !== "undefined" && error) console.error(error);
}
