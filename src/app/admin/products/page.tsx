"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminEmpty, AdminError, Pagination, StatusBadge, TableSkeleton, fmtINR, statusTone } from "@/features/admin/ui";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/types/admin";

const FILTERS: { label: string; value?: ProductStatus }[] = [
  { label: "All" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
];

export default function AdminProductsPage() {
  const { authedFetch } = useApiClient();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin-products", search, status, page],
    queryFn: () => admin.listProducts(authedFetch, { q: search || undefined, status: status ? [status] : undefined, page }),
    placeholderData: keepPreviousData,
  });
  const data = query.data;

  return (
    <>
      <AdminHeading
        title="Products"
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-bg-dark"
          >
            <Plus className="h-4 w-4" />
            New product
          </Link>
        }
      />

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
            placeholder="Search products…"
            className="w-full rounded-full border border-border-default bg-white py-2.5 pl-9 pr-4 font-body text-sm text-text-primary outline-none focus:border-border-focus"
          />
        </form>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 font-body text-xs font-medium transition-colors",
                status === f.value
                  ? "border-cta-fill bg-cta-fill text-white"
                  : "border-border-default text-text-secondary hover:border-border-focus",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : !data || data.items.length === 0 ? (
        <AdminEmpty title="No products found" body="Try a different search or filter." />
      ) : (
        <AdminCard className="p-0">
          <ul role="list" className="divide-y divide-border-light">
            {data.items.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-bg-secondary/40">
                  <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md bg-bg-secondary">
                    {p.primaryImageUrl && <Image src={p.primaryImageUrl} alt={p.name} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-sm font-medium text-text-primary">{p.name}</p>
                    <p className="font-body text-xs text-text-muted">
                      {fmtINR(p.basePrice)} · {p.totalStock} in stock · {p.variantCount} variants
                    </p>
                  </div>
                  <StatusBadge label={p.status} tone={statusTone(p.status)} />
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
