import { clientEnv } from "@/lib/env";
import { ApiError } from "./errors";

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Clerk JWT for authenticated calls. Injected by `useApiClient` (F2). */
  token?: string | null;
  /** Required on `/checkout/orders` + `/payments/verify` (F4). */
  idempotencyKey?: string;
};

/**
 * The token-injecting fetch returned by `useApiClient().authedFetch`. API
 * modules for authenticated resources (cart, wishlist, account) accept this so
 * the token + 401-retry logic live in one place.
 */
export type AuthedFetch = <T>(path: string, options?: RequestOptions) => Promise<T>;

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = clientEnv.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, String(v));
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, query, headers, token, idempotencyKey, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (idempotencyKey) finalHeaders["Idempotency-Key"] = idempotencyKey;

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      parsed = await res.text().catch(() => undefined);
    }
    throw ApiError.from(res.status, res.statusText, parsed);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
