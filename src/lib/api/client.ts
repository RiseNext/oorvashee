import { clientEnv } from "@/lib/env";
import { ApiError } from "./errors";

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
};

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
  const { body, query, headers, ...rest } = options;
  const res = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let details: unknown;
    try {
      details = await res.json();
    } catch {
      details = await res.text().catch(() => undefined);
    }
    throw new ApiError(
      `Request failed: ${res.status} ${res.statusText}`,
      res.status,
      details,
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
