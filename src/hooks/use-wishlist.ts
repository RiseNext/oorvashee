"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED, SIGN_IN_URL } from "@/lib/auth/config";
import { toastApiError } from "@/lib/api/toast";
import * as wishlistApi from "@/lib/api/wishlist";
import { CART_QUERY_KEY } from "./use-cart";
import type { Cart } from "@/types/cart";
import type { Wishlist } from "@/types/wishlist";

export const WISHLIST_QUERY_KEY = ["wishlist"] as const;
const EMPTY: Wishlist = { items: [], count: 0 };

/**
 * Wishlist is backend-owned and auth-only (no backend guest-wishlist merge).
 * Guests attempting a wishlist action get a polished sign-in prompt rather than
 * a broken/fake local wishlist.
 */
export function useWishlist() {
  const { isLoaded, isSignedIn } = useAuthSession();
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const router = useRouter();
  const authed = CLERK_ENABLED && isSignedIn;

  const query = useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: () => wishlistApi.fetchWishlist(authedFetch),
    enabled: authed && isLoaded,
    staleTime: 30_000,
  });

  const wishlist = query.data ?? EMPTY;
  const has = (productId: string) =>
    wishlist.items.some((i) => i.productId === productId);

  const setWishlist = useCallback(
    (w: Wishlist) => qc.setQueryData(WISHLIST_QUERY_KEY, w),
    [qc],
  );

  const promptSignIn = useCallback((): boolean => {
    if (authed) return true;
    toast.message("Sign in to save to your wishlist", {
      action: { label: "Sign in", onClick: () => router.push(SIGN_IN_URL) },
    });
    return false;
  }, [authed, router]);

  const addMut = useMutation({
    mutationFn: (productId: string) =>
      wishlistApi.addToWishlist(authedFetch, productId),
    onSuccess: setWishlist,
    onError: (e) => toastApiError(e),
  });

  const removeMut = useMutation({
    mutationFn: (productId: string) =>
      wishlistApi.removeFromWishlist(authedFetch, productId),
    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: WISHLIST_QUERY_KEY });
      const prev = qc.getQueryData<Wishlist>(WISHLIST_QUERY_KEY);
      if (prev) {
        const items = prev.items.filter((i) => i.productId !== productId);
        setWishlist({ items, count: items.length });
      }
      return { prev };
    },
    onError: (e, _id, ctx) => {
      if (ctx?.prev) setWishlist(ctx.prev);
      toastApiError(e);
    },
    onSuccess: setWishlist,
  });

  const moveMut = useMutation({
    mutationFn: (v: { productId: string; variantId: string; quantity: number }) =>
      wishlistApi.moveWishlistToCart(authedFetch, v.productId, v.variantId, v.quantity),
    onSuccess: (cart: Cart) => {
      qc.setQueryData(CART_QUERY_KEY, cart);
      qc.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      toast.success("Moved to bag");
    },
    onError: (e) => toastApiError(e),
  });

  const toggle = useCallback(
    (productId: string) => {
      if (!promptSignIn()) return;
      if (has(productId)) removeMut.mutate(productId);
      else addMut.mutate(productId);
    },
    // `has` reads current query data each call; intentionally not a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [promptSignIn, addMut, removeMut],
  );

  const remove = useCallback(
    (productId: string) => {
      if (!promptSignIn()) return;
      removeMut.mutate(productId);
    },
    [promptSignIn, removeMut],
  );

  const moveToCart = useCallback(
    (productId: string, variantId: string, quantity = 1) => {
      if (!promptSignIn()) return;
      moveMut.mutate({ productId, variantId, quantity });
    },
    [promptSignIn, moveMut],
  );

  return {
    wishlist,
    isLoading: authed ? query.isLoading : false,
    isError: authed ? query.isError : false,
    authed,
    has,
    toggle,
    remove,
    moveToCart,
    isMutating: addMut.isPending || removeMut.isPending || moveMut.isPending,
  };
}
