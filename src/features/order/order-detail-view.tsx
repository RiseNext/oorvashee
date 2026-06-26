"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Package, Truck, Home, XCircle } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/order";
import { LiveTracking } from "./live-tracking";

const STEPS: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: "placed", label: "Placed", icon: Check },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const ORDER_INDEX: Record<OrderStatus, number> = {
  placed: 0,
  packed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

const PAYMENT_COPY: Record<string, string> = {
  paid: "Paid",
  pending: "Payment pending",
  cod_pending: "Cash on Delivery",
  failed: "Payment failed",
  refunded: "Refunded",
};

export function OrderDetailView({
  order,
  trackingEmail,
}: {
  order: Order;
  /** Present on the guest tracking page → live tracking uses the email-gated endpoint. */
  trackingEmail?: string;
}) {
  const current = ORDER_INDEX[order.status];
  const cancelled = order.status === "cancelled";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
      {/* Left: status + items */}
      <div className="space-y-8">
        {/* Status track */}
        {cancelled ? (
          <div className="flex items-center gap-2.5 rounded-lg border border-badge-bg bg-badge-bg/30 px-4 py-3">
            <XCircle className="h-4 w-4 shrink-0 text-badge-text" />
            <p className="font-body text-sm text-badge-text">This order was cancelled.</p>
          </div>
        ) : (
          <ol className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const done = i <= current;
              const Icon = step.icon;
              return (
                <li key={step.key} className="flex flex-1 flex-col items-center text-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <span className={cn("h-0.5 flex-1", i <= current ? "bg-cta-fill" : "bg-border-light")} />
                    )}
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        done
                          ? "border-cta-fill bg-cta-fill text-white"
                          : "border-border-light bg-white text-text-muted",
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className={cn("h-0.5 flex-1", i < current ? "bg-cta-fill" : "bg-border-light")} />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 font-body text-[11px] uppercase tracking-[0.1em]",
                      done ? "text-text-primary" : "text-text-muted",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {/* Items */}
        <ul role="list" className="divide-y divide-border-light border-y border-border-light">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4 py-4">
              <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg bg-bg-secondary">
                <Image src={item.image.url} alt={item.image.alt} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex flex-1 items-start justify-between gap-3">
                <div>
                  <p className="font-body text-sm font-medium text-text-primary">{item.productName}</p>
                  {item.variantLabel && (
                    <p className="mt-0.5 font-body text-xs text-text-muted">{item.variantLabel}</p>
                  )}
                  <p className="mt-0.5 font-body text-xs text-text-muted">Qty {item.quantity}</p>
                </div>
                <span className="font-body text-sm font-semibold text-text-primary">
                  {formatPrice(item.lineTotal)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Shipment (renders instantly from stored data) + live tracking (async) */}
        {order.shipment?.trackingId && (
          <div className="space-y-3">
            <div className="rounded-xl border border-border-light bg-bg-card p-5">
              <h3 className="font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
                Shipment
              </h3>
              <p className="mt-2 font-body text-sm text-text-secondary">
                {order.shipment.courierName ?? "Courier"} · {order.shipment.trackingId}
              </p>
              {order.shipment.trackingUrl && (
                <a
                  href={order.shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block font-body text-sm text-cta-fill underline underline-offset-2"
                >
                  Track shipment
                </a>
              )}
            </div>
            <LiveTracking
              orderNumber={order.orderNumber}
              email={trackingEmail}
              trackingUrl={order.shipment.trackingUrl}
            />
          </div>
        )}
      </div>

      {/* Right: summary + address */}
      <aside className="space-y-5">
        <div className="rounded-xl border border-border-light bg-bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
              Summary
            </h3>
            <span className="rounded-full bg-bg-secondary px-2.5 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.12em] text-text-secondary">
              {PAYMENT_COPY[order.paymentStatus] ?? order.paymentStatus}
            </span>
          </div>
          <dl className="mt-4 space-y-2 font-body text-sm">
            <Row label="Subtotal" value={formatPrice(order.subtotal)} />
            {order.discountAmount > 0 && (
              <Row label="Discount" value={`− ${formatPrice(order.discountAmount)}`} />
            )}
            <Row label="Shipping" value={order.shippingAmount > 0 ? formatPrice(order.shippingAmount) : "Free"} />
            {order.taxAmount > 0 && <Row label="Tax" value={formatPrice(order.taxAmount)} />}
            <div className="flex items-center justify-between border-t border-border-light pt-2.5">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="font-semibold text-text-primary">{formatPrice(order.total)}</span>
            </div>
          </dl>
          {formatDate(order.placedAt ?? order.createdAt) && (
            <p className="mt-4 font-body text-xs text-text-muted">
              Placed on {formatDate(order.placedAt ?? order.createdAt)}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border-light bg-bg-card p-6">
          <h3 className="font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
            Delivery
          </h3>
          <div className="mt-3 font-body text-sm text-text-secondary">
            <p className="text-text-primary">{order.shippingAddress.recipientName ?? order.customerName}</p>
            {order.shippingAddress.line1 && <p>{order.shippingAddress.line1}</p>}
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
            {order.phone && <p className="mt-1">{order.phone}</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}

export function OrderDetailLink({ orderNumber }: { orderNumber: string }) {
  return (
    <Link
      href={`/account/orders/${orderNumber}`}
      className="font-body text-xs uppercase tracking-[0.14em] text-cta-fill transition-colors hover:text-cta-fill-hover"
    >
      View details
    </Link>
  );
}
