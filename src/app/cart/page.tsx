import type { Metadata } from "next";
import { CartView } from "@/features/cart/cart-view";

export const metadata: Metadata = { title: "Shopping Bag" };

export default function CartPage() {
  return <CartView />;
}
