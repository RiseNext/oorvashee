import { clientEnv, serverEnv } from "@/lib/env";
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
  /**
   * Next.js server-side ISR window in seconds (maps to `fetch`'s
   * `next.revalidate`). Server-only: the browser fetch ignores it, so passing
   * it from a catalog read is safe even when the same helper runs on the client.
   * Only set this for cacheable, non-personalized GETs.
   */
  revalidate?: number | false;
  /** Cache tags for on-demand invalidation via `revalidateTag` (server-only). */
  tags?: string[];
};

/**
 * The token-injecting fetch returned by `useApiClient().authedFetch`. API
 * modules for authenticated resources (cart, wishlist, account) accept this so
 * the token + 401-retry logic live in one place.
 */
export type AuthedFetch = <T>(path: string, options?: RequestOptions) => Promise<T>;

/**
 * The API origin to hit, chosen at call time by execution context:
 *
 *   - SERVER (SSR/ISR/RSC, `typeof window === "undefined"`): hit Railway
 *     DIRECTLY via the server-only `BACKEND_ORIGIN` — identical to today, so
 *     there is no self-hop through the public domain and no build-time
 *     dependency on oorvashee.com resolving.
 *   - BROWSER: use the same-origin `NEXT_PUBLIC_API_BASE_URL`
 *     (https://oorvashee.com/api/v1) so the browser never resolves railway.app —
 *     Reliance Jio's DNS NXDOMAINs `*.up.railway.app`. The next.config rewrite
 *     proxies `/api/v1/*` to Railway server-side, preserving auth headers.
 *
 * Both bases already include the `/api/v1` prefix, so request paths are relative
 * to it exactly as before.
 */
function apiBase(): string {
  if (typeof window === "undefined") {
    return `${serverEnv.BACKEND_ORIGIN.replace(/\/$/, "")}/api/v1`;
  }
  return clientEnv.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = apiBase();
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
  const { body, query, headers, token, idempotencyKey, revalidate, tags, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string> | undefined),
  };
  if (token) finalHeaders.Authorization = `Bearer ${token}`;
  if (idempotencyKey) finalHeaders["Idempotency-Key"] = idempotencyKey;

  // Server-side caching hints. Only attached when a caller opts in (catalog
  // reads), so mutations and authenticated/token'd requests stay uncached.
  const nextInit =
    revalidate !== undefined || tags
      ? {
          next: {
            ...(revalidate !== undefined ? { revalidate } : {}),
            ...(tags ? { tags } : {}),
          },
        }
      : undefined;

  const res = await fetch(buildUrl(path, query), {
    ...rest,
    ...nextInit,
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
