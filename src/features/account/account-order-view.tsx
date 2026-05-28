"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OrderDetailView } from "@/features/order/order-detail-view";
import { useAccountOrder } from "@/hooks/use-orders";

/** Content-only — rendered inside `AccountShell`. */
export function AccountOrderView({ orderNumber }: { orderNumber: string }) {
  const { data: order, isLoading } = useAccountOrder(orderNumber);

  return (
    <div>
      <Link
        href="/account/orders"
        className="mb-6 inline-flex items-center gap-1.5 font-body text-sm text-text-muted transition-colors hover:text-cta-fill"
      >
        <ArrowLeft className="h-4 w-4" />
        All orders
      </Link>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" />
        </div>
      ) : order ? (
        <OrderDetailView order={order} />
      ) : (
        <p className="font-body text-sm text-text-secondary">We couldn&apos;t find this order.</p>
      )}
    </div>
  );
}
