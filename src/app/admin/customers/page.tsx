"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminEmpty, AdminError, Pagination, TableSkeleton, fmtINR, fmtDate } from "@/features/admin/ui";

export default function AdminCustomersPage() {
  const { authedFetch } = useApiClient();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin-customers", search, page],
    queryFn: () => admin.listCustomers(authedFetch, { q: search || undefined, page }),
    placeholderData: keepPreviousData,
  });
  const data = query.data;

  return (
    <>
      <AdminHeading title="Customers" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
          setPage(1);
        }}
        className="relative mb-5 w-full sm:max-w-xs"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-full border border-border-default bg-white py-2.5 pl-9 pr-4 font-body text-sm text-text-primary outline-none focus:border-border-focus"
        />
      </form>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : !data || data.items.length === 0 ? (
        <AdminEmpty title="No customers found" body="Customers appear here after their first order." />
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="border-b border-border-light text-[11px] uppercase tracking-[0.1em] text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium text-right">Orders</th>
                  <th className="px-4 py-3 font-medium text-right">Lifetime value</th>
                  <th className="px-4 py-3 font-medium">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.items.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-bg-secondary/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{c.fullName || "—"}</p>
                      <p className="text-xs text-text-muted">{c.email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-secondary">
                      {c.ordersCount}
                      {c.paidOrdersCount > 0 && c.paidOrdersCount !== c.ordersCount ? (
                        <span className="text-text-muted"> ({c.paidOrdersCount} paid)</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-text-primary">{fmtINR(c.lifetimeValue)}</td>
                    <td className="px-4 py-3 text-text-secondary">{fmtDate(c.lastOrderAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
    </>
  );
}
