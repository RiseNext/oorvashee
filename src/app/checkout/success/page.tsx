import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderSuccessView } from "@/features/checkout/order-success-view";

export const metadata: Metadata = { title: "Order Confirmed" };

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessView />
    </Suspense>
  );
}
