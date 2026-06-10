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

/**
 * Order tracking — also used by the post-payment success page. The Razorpay
 * webhook is the source of truth, so we POLL until payment is finalised: every
 * 2.5s while `payment_status === "pending"`, stopping once it's
 * paid/failed/refunded or after ~20 attempts (~50s) as a safety cap.
 */
export function useOrderTracking(orderNumber: string, email: string | null) {
  const { authedFetch } = useApiClient();
  return useQuery({
    queryKey: ["order-track", orderNumber, email],
    queryFn: () => getOrderByNumber(authedFetch, orderNumber, email as string),
    enabled: Boolean(orderNumber) && Boolean(email),
    retry: false,
    staleTime: 0,
    refetchInterval: (query) => {
      const order = query.state.data;
      if (!order) return 2500; // first fetch still in flight
      if (order.paymentStatus === "pending") {
        // Keep polling for the webhook, but cap total attempts.
        return query.state.dataUpdateCount >= 20 ? false : 2500;
      }
      return false; // paid / failed / refunded / cod_pending — settled
    },
  });
}
