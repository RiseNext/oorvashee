/**
 * Cart + wishlist mappers — the ONLY place backend cart/wishlist field names
 * appear in domain code. Backend wire DTO → frontend domain type.
 */
import type {
  BackendCart,
  BackendCartItem,
  BackendWishlist,
  BackendWishlistItem,
} from "@/types/api";
import type { Cart, CartItem } from "@/types/cart";
import type { Wishlist, WishlistItem } from "@/types/wishlist";

import { PLACEHOLDER_IMAGE, toNumber } from "./product";

export function mapCartItem(dto: BackendCartItem): CartItem {
  return {
    id: dto.id,
    variantId: dto.variant_id,
    productId: dto.product_id,
    slug: dto.product_slug,
    title: dto.product_name,
    variantLabel: dto.variant_label ?? undefined,
    image: {
      url: dto.image_url ?? PLACEHOLDER_IMAGE,
      alt: dto.product_name,
    },
    unitPrice: toNumber(dto.unit_price),
    quantity: dto.quantity,
    lineTotal: toNumber(dto.line_total),
    available: dto.available,
    maxQuantity: dto.max_quantity,
  };
}

export function mapCart(dto: BackendCart): Cart {
  return {
    id: dto.id,
    items: dto.items.map(mapCartItem),
    itemCount: dto.item_count,
    distinctCount: dto.distinct_count,
    subtotal: toNumber(dto.subtotal),
    currency: dto.currency,
    hasUnavailableItems: dto.has_unavailable_items,
  };
}

export function mapWishlistItem(dto: BackendWishlistItem): WishlistItem {
  const price = toNumber(dto.base_price);
  const compareAtPrice = dto.mrp != null ? toNumber(dto.mrp) : undefined;
  return {
    id: dto.id,
    productId: dto.product_id,
    slug: dto.product_slug,
    title: dto.product_name,
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
    image: {
      url: dto.primary_image_url ?? PLACEHOLDER_IMAGE,
      alt: dto.product_name,
    },
    available: dto.available,
  };
}

export function mapWishlist(dto: BackendWishlist): Wishlist {
  return {
    items: dto.items.map(mapWishlistItem),
    count: dto.count,
  };
}
