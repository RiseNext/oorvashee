import type { Money, ProductImage } from "./product";

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  variantTitle?: string;
  image: ProductImage;
  unitPrice: Money;
  compareAtUnitPrice?: Money;
  quantity: number;
  maxQuantity?: number;
}

export interface CartTotals {
  subtotal: Money;
  discount: Money;
  shipping: Money;
  tax: Money;
  total: Money;
}

export interface AppliedCoupon {
  code: string;
  description?: string;
  amountOff: Money;
}
