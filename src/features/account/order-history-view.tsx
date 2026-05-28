"use client";

import Link from "next/link";
import { Package } from "lucide-react";

import { useAccountOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Content-only — rendered inside `AccountShell` (which owns Navbar + guard). */
export function OrderHistoryView() {
  const { data, isLoading } = useAccountOrders(1);
  const orders = data?.items ?? [];

  if (isLoading) return <Skeleton />;
  if (orders.length === 0) {
    return (
      <Empty body="You haven't placed any orders yet." cta={{ href: "/saris", label: "Start shopping" }} />
    );
  }

  return (
    <ul role="list" className="space-y-4">
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} statusLabel={STATUS_LABEL[order.status]} />
      ))}
    </ul>
  );
}

function OrderRow({ order, statusLabel }: { order: Order; statusLabel: string }) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <li>
      <Link
        href={`/account/orders/${order.orderNumber}`}
        className={cn(
          "flex items-center justify-between gap-4 rounded-xl border border-border-light bg-bg-card p-5",
          "shadow-[0_1px_2px_rgba(61,26,8,0.04)] transition-colors hover:border-border-focus",
        )}
      >
        <div className="min-w-0">
          <p className="font-body text-sm font-semibold text-text-primary">#{order.orderNumber}</p>
          <p className="mt-0.5 font-body text-xs text-text-muted">
            {count} {count === 1 ? "item" : "items"} · {formatPrice(order.total)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-bg-secondary px-3 py-1 font-body text-[10px] font-medium uppercase tracking-[0.12em] text-text-secondary">
          {statusLabel}
        </span>
      </Link>
    </li>
  );
}

function Empty({ body, cta }: { body: string; cta: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border-light bg-bg-card py-16 text-center">
      <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
        <Package className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <p className="max-w-md font-body text-sm text-text-secondary">{body}</p>
      <Link
        href={cta.href}
        className={cn(
          "mt-6 inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
          "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
          "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
        )}
      >
        {cta.label}
      </Link>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-bg-secondary" />
      ))}
    </div>
  );
}
