"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";

import { apiFetch, type RequestOptions } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { CLERK_ENABLED, CLERK_JWT_TEMPLATE } from "@/lib/auth/config";

/**
 * Authenticated API client — the single seam where the Clerk session token is
 * injected into backend requests. Components/hooks call `authedFetch` (never
 * the bare `apiFetch`) for `/account/*`, `/cart/*`, and authenticated checkout.
 *
 * Token lifecycle: `getToken()` returns a cached valid JWT or transparently
 * refreshes it (Clerk handles refresh). On a backend 401 (token rotated/just
 * expired) we force a fresh token once and retry — a seamless recovery with no
 * visible re-auth. Persistent 401/403 surface as `ApiError` for `toastApiError`.
 */

type TokenOpts = { template?: string; skipCache?: boolean };

function tokenOptions(skipCache = false): TokenOpts | undefined {
  if (!CLERK_JWT_TEMPLATE && !skipCache) return undefined;
  return {
    ...(CLERK_JWT_TEMPLATE ? { template: CLERK_JWT_TEMPLATE } : {}),
    ...(skipCache ? { skipCache: true } : {}),
  };
}

function useClerkApiClient() {
  const { getToken } = useAuth();

  const authedFetch = useCallback(
    async <T,>(path: string, options: RequestOptions = {}): Promise<T> => {
      const token = await getToken(tokenOptions());
      try {
        return await apiFetch<T>(path, { ...options, token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          // Token just rotated/expired — force-refresh once and retry.
          const fresh = await getToken(tokenOptions(true));
          if (fresh && fresh !== token) {
            return await apiFetch<T>(path, { ...options, token: fresh });
          }
        }
        throw error;
      }
    },
    [getToken],
  );

  return { authedFetch };
}

function useGuestApiClient() {
  const authedFetch = useCallback(
    <T,>(path: string, options: RequestOptions = {}): Promise<T> =>
      apiFetch<T>(path, options),
    [],
  );
  return { authedFetch };
}

// Build-time-stable selection (see config.ts).
export const useApiClient = CLERK_ENABLED ? useClerkApiClient : useGuestApiClient;
