"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, StatCard, fmtINR, TableSkeleton } from "@/features/admin/ui";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { authedFetch } = useApiClient();
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => admin.getOverview(authedFetch) });
  const fkpi = useQuery({ queryKey: ["admin-fulfillment"], queryFn: () => admin.getFulfillmentKPIs(authedFetch) });
  const top = useQuery({ queryKey: ["admin-top-products"], queryFn: () => admin.getTopProducts(authedFetch, 6) });

  const o = overview.data;
  const f = fkpi.data;
  const topRows = top.data ?? [];
  const maxRevenue = Math.max(1, ...topRows.map((r) => r.revenue));

  return (
    <>
      <AdminHeading title="Dashboard" />

      {/* Top-line KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue (30d)" value={o ? fmtINR(o.totalRevenue) : "—"} hint="Paid orders only" />
        <StatCard label="Orders (30d)" value={o ? o.totalOrders : "—"} hint={o ? `${o.paidOrders} paid` : undefined} />
        <StatCard label="Avg order value" value={o ? fmtINR(o.averageOrderValue) : "—"} />
        <StatCard label="Units sold" value={o ? o.unitsSold : "—"} hint={o ? `${o.newCustomers} new customers` : undefined} />
      </div>

      {/* Fulfillment queue */}
      <h2 className="mb-3 mt-10 font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
        Fulfillment
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <QueueTile href="/admin/orders?status=placed" label="Awaiting packing" value={f?.awaitingPacking} highlight />
        <QueueTile href="/admin/orders?status=packed" label="Awaiting shipment" value={f?.awaitingShipment} />
        <QueueTile href="/admin/orders?status=shipped" label="In transit" value={f?.inTransit} />
        <QueueTile href="/admin/orders" label="Delivered today" value={f?.deliveredToday} />
        <QueueTile href="/admin/orders" label="Missing tracking" value={f?.shippedMissingTracking} warn />
        <QueueTile href="/admin/orders" label="COD outstanding" value={f?.codOutstanding} />
      </div>

      {/* Top products */}
      <h2 className="mb-3 mt-10 font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
        Top products (30d)
      </h2>
      <AdminCard>
        {top.isLoading ? (
          <TableSkeleton rows={5} />
        ) : topRows.length === 0 ? (
          <p className="py-6 text-center font-body text-sm text-text-muted">No sales in this window yet.</p>
        ) : (
          <ul className="space-y-3">
            {topRows.map((r) => (
              <li key={r.productId}>
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/product/${r.productSlug}`}
                    className="truncate font-body text-sm text-text-primary hover:text-cta-fill"
                  >
                    {r.productName}
                  </Link>
                  <span className="shrink-0 font-body text-sm font-semibold text-text-primary">
                    {fmtINR(r.revenue)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-secondary">
                    <div
                      className="h-full rounded-full bg-cta-fill"
                      style={{ width: `${Math.round((r.revenue / maxRevenue) * 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 font-body text-xs text-text-muted">{r.unitsSold} units</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </>
  );
}

function QueueTile({
  href,
  label,
  value,
  highlight,
  warn,
}: {
  href: string;
  label: string;
  value?: number;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-xl border bg-bg-card p-4 transition-colors hover:border-border-focus",
        warn && (value ?? 0) > 0 ? "border-badge-bg" : "border-border-light",
      )}
    >
      <p className="font-display text-2xl font-semibold text-text-primary">{value ?? "—"}</p>
      <p
        className={cn(
          "mt-1 font-body text-[11px] uppercase tracking-[0.1em]",
          highlight ? "text-cta-fill" : "text-text-muted",
        )}
      >
        {label}
      </p>
    </Link>
  );
}
