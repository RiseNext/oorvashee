import type { Money, ProductImage } from "./product";

export interface WishlistItem {
  /** Server wishlist-line id. */
  id: string;
  productId: string;
  slug: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  image: ProductImage;
  available: boolean;
}

export interface Wishlist {
  items: WishlistItem[];
  count: number;
}
