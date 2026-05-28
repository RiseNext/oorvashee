"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { toastApiError } from "@/lib/api/toast";
import * as cartApi from "@/lib/api/cart";
import { useCartStore } from "@/store/cart-store";
import type { Cart, CartItem, CartLine } from "@/types/cart";
import type { ProductImage } from "@/types/product";

export const CART_QUERY_KEY = ["cart"] as const;

const EMPTY_CART: Cart = {
  id: null,
  items: [],
  itemCount: 0,
  distinctCount: 0,
  subtotal: 0,
  currency: "INR",
  hasUnavailableItems: false,
};

/** Derive the unified Cart shape from the guest (Zustand) lines. */
function guestCartOf(lines: CartLine[]): Cart {
  const items: CartItem[] = lines.map((l) => ({
    id: l.id,
    variantId: l.variantId,
    productId: l.productId,
    slug: l.slug,
    title: l.title,
    variantLabel: l.variantTitle,
    image: l.image,
    unitPrice: l.unitPrice,
    quantity: l.quantity,
    lineTotal: l.unitPrice * l.quantity,
    available: true, // revalidated against stock at checkout
    maxQuantity: l.maxQuantity ?? 99,
  }));
  return {
    id: null,
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    distinctCount: items.length,
    subtotal: items.reduce((s, i) => s + i.lineTotal, 0),
    currency: "INR",
    hasUnavailableItems: false,
  };
}

export interface AddToCartInput {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  variantLabel?: string;
  image: ProductImage;
  unitPrice: number;
  quantity?: number;
  maxQuantity?: number;
}

/**
 * Single cart seam for the whole app. Guests use the persisted Zustand cart
 * (instant, offline); authenticated users use the server cart via TanStack
 * (every mutation returns the full cart → cache is replaced authoritatively,
 * with optimistic quantity/remove for snappiness). Components never branch on
 * auth — they call these actions.
 */
export function useCart() {
  const { isLoaded, isSignedIn } = useAuthSession();
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const authed = CLERK_ENABLED && isSignedIn;

  // Guest store — always subscribed (cheap); used only when not authed.
  const lines = useCartStore((s) => s.lines);
  const addLine = useCartStore((s) => s.addLine);
  const updateGuestQty = useCartStore((s) => s.updateQuantity);
  const removeGuestLine = useCartStore((s) => s.removeLine);
  const clearGuest = useCartStore((s) => s.clear);

  const serverCart = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartApi.fetchCart(authedFetch),
    enabled: authed && isLoaded,
    staleTime: 30_000,
  });

  const guestCart = useMemo(() => guestCartOf(lines), [lines]);
  const cart: Cart = authed ? serverCart.data ?? EMPTY_CART : guestCart;
  const isLoading = authed ? serverCart.isLoading : false;

  const setServerCart = useCallback(
    (next: Cart) => qc.setQueryData(CART_QUERY_KEY, next),
    [qc],
  );

  // --- server mutations ---------------------------------------------------
  const addMut = useMutation({
    mutationFn: (v: { variantId: string; quantity: number }) =>
      cartApi.addCartItem(authedFetch, v.variantId, v.quantity),
    onSuccess: setServerCart,
    onError: (e) => toastApiError(e),
  });

  // Optimistic quantity change — feels instant, reconciles from the response.
  const updateMut = useMutation({
    mutationFn: (v: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(authedFetch, v.itemId, v.quantity),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: CART_QUERY_KEY });
      const prev = qc.getQueryData<Cart>(CART_QUERY_KEY);
      if (prev) setServerCart(applyQty(prev, v.itemId, v.quantity));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) setServerCart(ctx.prev);
      toastApiError(e);
    },
    onSuccess: setServerCart,
  });

  const removeMut = useMutation({
    mutationFn: (v: { itemId: string }) =>
      cartApi.removeCartItem(authedFetch, v.itemId),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: CART_QUERY_KEY });
      const prev = qc.getQueryData<Cart>(CART_QUERY_KEY);
      if (prev) setServerCart(removeLine(prev, v.itemId));
      return { prev };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.prev) setServerCart(ctx.prev);
      toastApiError(e);
    },
    onSuccess: setServerCart,
  });

  const clearMut = useMutation({
    mutationFn: () => cartApi.clearServerCart(authedFetch),
    onSuccess: setServerCart,
    onError: (e) => toastApiError(e),
  });

  // --- unified actions ----------------------------------------------------
  const addItem = useCallback(
    async (input: AddToCartInput) => {
      const quantity = input.quantity ?? 1;
      try {
        if (authed) {
          await addMut.mutateAsync({ variantId: input.variantId, quantity });
        } else {
          addLine({
            productId: input.productId,
            variantId: input.variantId,
            slug: input.slug,
            title: input.title,
            variantTitle: input.variantLabel,
            image: input.image,
            unitPrice: input.unitPrice,
            quantity,
            maxQuantity: input.maxQuantity,
          });
        }
        toast.success("Added to bag");
      } catch {
        /* toastApiError already fired in onError */
      }
    },
    [authed, addMut, addLine],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      if (authed) removeMut.mutate({ itemId });
      else removeGuestLine(itemId);
    },
    [authed, removeMut, removeGuestLine],
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) {
        removeItem(itemId);
        return;
      }
      if (authed) updateMut.mutate({ itemId, quantity });
      else updateGuestQty(itemId, quantity);
    },
    [authed, updateMut, updateGuestQty, removeItem],
  );

  const clear = useCallback(() => {
    if (authed) clearMut.mutate();
    else clearGuest();
  }, [authed, clearMut, clearGuest]);

  return {
    cart,
    isLoading,
    isError: authed ? serverCart.isError : false,
    refetch: serverCart.refetch,
    isMutating:
      addMut.isPending ||
      updateMut.isPending ||
      removeMut.isPending ||
      clearMut.isPending,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  };
}

// --- pure cache transforms (optimistic) -----------------------------------
function applyQty(cart: Cart, itemId: string, quantity: number): Cart {
  const items = cart.items.map((i) =>
    i.id === itemId ? { ...i, quantity, lineTotal: i.unitPrice * quantity } : i,
  );
  return recount({ ...cart, items });
}

function removeLine(cart: Cart, itemId: string): Cart {
  return recount({ ...cart, items: cart.items.filter((i) => i.id !== itemId) });
}

function recount(cart: Cart): Cart {
  return {
    ...cart,
    itemCount: cart.items.reduce((s, i) => s + i.quantity, 0),
    distinctCount: cart.items.length,
    subtotal: cart.items.reduce((s, i) => s + i.lineTotal, 0),
  };
}
