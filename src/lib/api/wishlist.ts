/**
 * Authenticated wishlist API — mounted at `/account/wishlist`. Add/remove are
 * idempotent and return the full `WishlistRead`; move-to-cart returns `CartRead`.
 */
import type { BackendCart, BackendWishlist } from "@/types/api";
import type { Cart } from "@/types/cart";
import type { Wishlist } from "@/types/wishlist";
import type { AuthedFetch } from "./client";
import { mapCart, mapWishlist } from "./mappers/cart";

const BASE = "/account/wishlist";

export function fetchWishlist(af: AuthedFetch): Promise<Wishlist> {
  return af<BackendWishlist>(BASE).then(mapWishlist);
}

export function addToWishlist(af: AuthedFetch, productId: string): Promise<Wishlist> {
  return af<BackendWishlist>(`${BASE}/${productId}`, { method: "PUT" }).then(
    mapWishlist,
  );
}

export function removeFromWishlist(
  af: AuthedFetch,
  productId: string,
): Promise<Wishlist> {
  return af<BackendWishlist>(`${BASE}/${productId}`, { method: "DELETE" }).then(
    mapWishlist,
  );
}

export function moveWishlistToCart(
  af: AuthedFetch,
  productId: string,
  variantId: string,
  quantity = 1,
  removeFromWishlist = true,
): Promise<Cart> {
  return af<BackendCart>(`${BASE}/${productId}/move-to-cart`, {
    method: "POST",
    body: {
      variant_id: variantId,
      quantity,
      remove_from_wishlist: removeFromWishlist,
    },
  }).then(mapCart);
}
