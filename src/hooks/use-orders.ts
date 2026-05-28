"use client";

import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/hooks/use-api-client";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED } from "@/lib/auth/config";
import {
  fetchAccountOrder,
  fetchAccountOrders,
  getOrderByNumber,
} from "@/lib/api/orders";

/** Authenticated order history (paginated). */
export function useAccountOrders(page = 1) {
  const { authedFetch } = useApiClient();
  const { isLoaded, isSignedIn } = useAuthSession();
  const query = useQuery({
    queryKey: ["account-orders", page],
    queryFn: () => fetchAccountOrders(authedFetch, page),
    enabled: CLERK_ENABLED && isLoaded && isSignedIn,
    staleTime: 30_000,
  });
  return query;
}

/** Authenticated order detail. */
export function useAccountOrder(orderNumber: string) {
  const { authedFetch } = useApiClient();
  const { isLoaded, isSignedIn } = useAuthSession();
  return useQuery({
    queryKey: ["account-order", orderNumber],
    queryFn: () => fetchAccountOrder(authedFetch, orderNumber),
    enabled: CLERK_ENABLED && isLoaded && isSignedIn && Boolean(orderNumber),
    staleTime: 30_000,
  });
}

/** Guest order tracking — needs the email that placed the order. */
export function useOrderTracking(orderNumber: string, email: string | null) {
  const { authedFetch } = useApiClient();
  return useQuery({
    queryKey: ["order-track", orderNumber, email],
    queryFn: () => getOrderByNumber(authedFetch, orderNumber, email as string),
    enabled: Boolean(orderNumber) && Boolean(email),
    retry: false,
    staleTime: 15_000,
  });
}
