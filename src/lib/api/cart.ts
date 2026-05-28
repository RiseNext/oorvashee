/**
 * Authenticated cart API — mounted at `/account/cart`. Every mutation returns
 * the full `CartRead`, so callers just replace their cached cart with the
 * mapped result. All calls go through `authedFetch` (token + 401 retry).
 */
import type { BackendCart } from "@/types/api";
import type { Cart } from "@/types/cart";
import type { AuthedFetch } from "./client";
import { mapCart } from "./mappers/cart";

const BASE = "/account/cart";

export interface MergeLine {
  variant_id: string;
  quantity: number;
}

export function fetchCart(af: AuthedFetch): Promise<Cart> {
  return af<BackendCart>(BASE).then(mapCart);
}

export function addCartItem(
  af: AuthedFetch,
  variantId: string,
  quantity: number,
): Promise<Cart> {
  return af<BackendCart>(`${BASE}/items`, {
    method: "POST",
    body: { variant_id: variantId, quantity },
  }).then(mapCart);
}

export function updateCartItem(
  af: AuthedFetch,
  itemId: string,
  quantity: number,
): Promise<Cart> {
  return af<BackendCart>(`${BASE}/items/${itemId}`, {
    method: "PATCH",
    body: { quantity },
  }).then(mapCart);
}

export function removeCartItem(af: AuthedFetch, itemId: string): Promise<Cart> {
  return af<BackendCart>(`${BASE}/items/${itemId}`, { method: "DELETE" }).then(
    mapCart,
  );
}

export function clearServerCart(af: AuthedFetch): Promise<Cart> {
  return af<BackendCart>(BASE, { method: "DELETE" }).then(mapCart);
}

export function mergeServerCart(
  af: AuthedFetch,
  items: MergeLine[],
): Promise<Cart> {
  return af<BackendCart>(`${BASE}/merge`, {
    method: "POST",
    body: { items },
  }).then(mapCart);
}
