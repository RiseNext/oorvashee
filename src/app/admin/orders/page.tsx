"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminEmpty, AdminError, Pagination, StatusBadge, TableSkeleton, fmtINR, fmtDate, statusTone } from "@/features/admin/ui";
import { cn } from "@/lib/utils";

const STATUSES = ["", "placed", "packed", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OrdersInner />
    </Suspense>
  );
}

function OrdersInner() {
  const { authedFetch } = useApiClient();
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(params.get("status") ?? "");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin-orders", search, status, page],
    queryFn: () => admin.listOrders(authedFetch, { q: search || undefined, status: status ? [status] : undefined, page }),
    placeholderData: keepPreviousData,
  });
  const data = query.data;

  return (
    <>
      <AdminHeading title="Orders" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q);
            setPage(1);
          }}
          className="relative w-full sm:max-w-xs"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Order # or email…"
            className="w-full rounded-full border border-border-default bg-white py-2.5 pl-9 pr-4 font-body text-sm text-text-primary outline-none focus:border-border-focus"
          />
        </form>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {STATUSES.map((sVal) => (
            <button
              key={sVal || "all"}
              type="button"
              onClick={() => {
                setStatus(sVal);
                setPage(1);
              }}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-xs font-medium capitalize transition-colors",
                status === sVal ? "border-cta-fill bg-cta-fill text-white" : "border-border-default text-text-secondary hover:border-border-focus",
              )}
            >
              {sVal || "All"}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : !data || data.items.length === 0 ? (
        <AdminEmpty title="No orders found" />
      ) : (
        <AdminCard className="p-0">
          <ul role="list" className="divide-y divide-border-light">
            {data.items.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-bg-secondary/40">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-semibold text-text-primary">#{o.orderNumber}</p>
                    <p className="truncate font-body text-xs text-text-muted">
                      {o.customerName} · {o.itemCount} items · {fmtDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-body text-sm font-semibold text-text-primary">{fmtINR(o.total)}</span>
                    <div className="hidden gap-1.5 sm:flex">
                      <StatusBadge label={o.paymentStatus} tone={statusTone(o.paymentStatus)} />
                      <StatusBadge label={o.status} tone={statusTone(o.status)} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </>
  );
}
