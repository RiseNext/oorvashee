import { Suspense } from "react";
import type { Metadata } from "next";
import { OrderTrackingView } from "@/features/order/order-tracking-view";

export const metadata: Metadata = { title: "Track Order" };

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  return (
    <Suspense fallback={null}>
      <OrderTrackingView orderNumber={number} />
    </Suspense>
  );
}
