"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/hooks/use-api-client";
import { fetchLiveTracking } from "@/lib/api/tracking";

/**
 * Live courier tracking, loaded SEPARATELY from the order so the page paints
 * instantly and a slow/unreachable Daakia never blocks it. `enabled` should be
 * true only when the order actually has an AWB (otherwise there's nothing to
 * track). Pass `email` for the guest tracking page; omit it on the authenticated
 * account page.
 */
export function useLiveTracking({
  orderNumber,
  email,
  enabled,
}: {
  orderNumber: string;
  email?: string | null;
  enabled: boolean;
}) {
  const { authedFetch } = useApiClient();
  return useQuery({
    queryKey: ["live-tracking", orderNumber, email ?? "self"],
    queryFn: () => fetchLiveTracking(authedFetch, orderNumber, email ?? null),
    enabled: enabled && Boolean(orderNumber),
    staleTime: 60_000,
    retry: 1,
  });
}
