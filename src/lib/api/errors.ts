import type { BackendErrorBody } from "@/types/api";

/**
 * Normalised API error. Carries the backend's `{detail, code, request_id}`
 * envelope so the UI can map `code` → friendly copy and surface
 * `requestId` for support.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly requestId?: string;
  readonly details?: unknown;

  constructor(params: {
    status: number;
    code: string;
    detail: string;
    requestId?: string;
    details?: unknown;
  }) {
    super(params.detail);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.detail = params.detail;
    this.requestId = params.requestId;
    this.details = params.details;
  }

  /** Build from a fetch Response + its parsed body (envelope or raw). */
  static from(status: number, statusText: string, body: unknown): ApiError {
    const envelope = isErrorBody(body) ? body : undefined;
    return new ApiError({
      status,
      code: envelope?.code ?? `http_${status}`,
      detail:
        envelope?.detail ??
        (typeof body === "string" && body ? body : `Request failed: ${status} ${statusText}`),
      requestId: envelope?.request_id,
      details: body,
    });
  }
}

function isErrorBody(body: unknown): body is BackendErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    ("detail" in body || "code" in body || "request_id" in body)
  );
}
