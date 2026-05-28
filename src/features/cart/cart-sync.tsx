"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useApiClient } from "@/hooks/use-api-client";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { mergeServerCart } from "@/lib/api/cart";
import { CART_QUERY_KEY } from "@/hooks/use-cart";
import { useCartStore } from "@/store/cart-store";

/**
 * Merges the guest (localStorage) cart into the server cart once, right after
 * sign-in, then clears the guest store so there's a single source of truth.
 * Renders nothing; mounted app-wide in providers. No-op when auth is disabled.
 */
export function CartSync() {
  const { isLoaded, isSignedIn } = useAuthSession();
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const mergedRef = useRef(false);

  useEffect(() => {
    if (!CLERK_ENABLED || !isLoaded || !isSignedIn || mergedRef.current) return;
    mergedRef.current = true;

    const lines = useCartStore.getState().lines;
    if (lines.length === 0) return;

    const items = lines.map((l) => ({
      variant_id: l.variantId,
      quantity: l.quantity,
    }));

    mergeServerCart(authedFetch, items)
      .then((cart) => {
        qc.setQueryData(CART_QUERY_KEY, cart);
        useCartStore.getState().clear();
      })
      .catch(() => {
        // Merge failed (network/stock) — keep the guest cart and allow a retry
        // on the next mount rather than silently dropping items.
        mergedRef.current = false;
      });
  }, [isLoaded, isSignedIn, authedFetch, qc]);

  return null;
}
