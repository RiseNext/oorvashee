"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminEmpty, AdminError, Pagination, StatusBadge, TableSkeleton } from "@/features/admin/ui";
import { cn } from "@/lib/utils";
import type { InventoryItem, ReservationBucket } from "@/types/admin";

const input = "w-full rounded-lg border border-border-default bg-white px-3.5 py-2.5 font-body text-sm text-text-primary outline-none transition-colors focus:border-border-focus";

type View = "stock" | "reservations";

const VIEWS: { label: string; value: View }[] = [
  { label: "Stock", value: "stock" },
  { label: "Reservations", value: "reservations" },
];

export default function AdminInventoryPage() {
  const [view, setView] = useState<View>("stock");

  return (
    <>
      <AdminHeading title="Inventory" />

      <div className="mb-5 flex gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => setView(v.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 font-body text-xs font-medium transition-colors",
              view === v.value ? "border-text-primary bg-text-primary text-white" : "border-border-default text-text-secondary hover:border-border-focus",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "stock" ? <StockPanel /> : <ReservationsPanel />}
    </>
  );
}

// ============================ Stock ============================

function StockPanel() {
  const { authedFetch } = useApiClient();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

  const query = useQuery({
    queryKey: ["admin-inventory", search, lowOnly, page],
    queryFn: () => admin.listInventory(authedFetch, { q: search || undefined, lowStockOnly: lowOnly || undefined, page }),
    placeholderData: keepPreviousData,
  });
  const data = query.data;

  return (
    <>
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
            placeholder="Search by product or SKU…"
            className="w-full rounded-full border border-border-default bg-white py-2.5 pl-9 pr-4 font-body text-sm text-text-primary outline-none focus:border-border-focus"
          />
        </form>
        <button
          type="button"
          onClick={() => {
            setLowOnly((v) => !v);
            setPage(1);
          }}
          className={cn(
            "rounded-full border px-3.5 py-1.5 font-body text-xs font-medium transition-colors",
            lowOnly ? "border-cta-fill bg-cta-fill text-white" : "border-border-default text-text-secondary hover:border-border-focus",
          )}
        >
          Low stock only
        </button>
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : !data || data.items.length === 0 ? (
        <AdminEmpty title="No inventory found" body="Try a different search or filter." />
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="border-b border-border-light text-[11px] uppercase tracking-[0.1em] text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium text-right">Physical</th>
                  <th className="px-4 py-3 font-medium text-right">Reserved</th>
                  <th className="px-4 py-3 font-medium text-right">Available</th>
                  <th className="px-4 py-3 font-medium text-right">Sold</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.items.map((it) => (
                  <tr key={it.variantId} className="transition-colors hover:bg-bg-secondary/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{it.productName}</p>
                      <p className="text-xs text-text-muted">{it.variantLabel || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{it.sku}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary">{it.stock}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-muted">{it.reserved}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-text-primary">{it.available}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-muted">{it.sold}</td>
                    <td className="px-4 py-3">
                      {it.isOutOfStock ? (
                        <StatusBadge label="Out of stock" tone="amber" />
                      ) : it.isLowStock ? (
                        <StatusBadge label="Low" tone="amber" />
                      ) : (
                        <StatusBadge label="In stock" tone="green" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setAdjusting(it)}
                        className="rounded-full border border-border-default px-3.5 py-1.5 font-body text-xs font-medium text-text-secondary transition-colors hover:border-cta-fill hover:text-cta-fill"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />

      {adjusting && (
        <AdjustDialog
          item={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={() => {
            setAdjusting(null);
            query.refetch();
          }}
        />
      )}
    </>
  );
}

// ============================ Reservations ============================

const BUCKETS: { label: string; value: ReservationBucket; tone: "blue" | "green" | "amber" | "neutral" }[] = [
  { label: "Active", value: "active", tone: "blue" },
  { label: "Expired", value: "expired", tone: "amber" },
  { label: "Completed", value: "completed", tone: "green" },
  { label: "Cancelled", value: "cancelled", tone: "neutral" },
];

function ReservationsPanel() {
  const { authedFetch } = useApiClient();
  const [bucket, setBucket] = useState<ReservationBucket>("active");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin-reservations", bucket, page],
    queryFn: () => admin.listReservations(authedFetch, { bucket, page }),
    placeholderData: keepPreviousData,
  });
  const data = query.data;
  const tone = BUCKETS.find((b) => b.value === bucket)?.tone ?? "neutral";

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {BUCKETS.map((b) => (
          <button
            key={b.value}
            type="button"
            onClick={() => {
              setBucket(b.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 font-body text-xs font-medium transition-colors",
              bucket === b.value ? "border-cta-fill bg-cta-fill text-white" : "border-border-default text-text-secondary hover:border-border-focus",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : !data || data.items.length === 0 ? (
        <AdminEmpty title="No reservations" body={`No ${bucket} reservations right now.`} />
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="border-b border-border-light text-[11px] uppercase tracking-[0.1em] text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {data.items.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-bg-secondary/40">
                    <td className="px-4 py-3 font-medium text-text-primary">{r.productName || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{r.sku || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-text-primary">{r.quantity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge label={r.status.replace(/_/g, " ")} tone={tone} />
                        {r.isExpired && <StatusBadge label="expiring" tone="amber" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted tabular-nums">
                      {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "—"}
                    </td>
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

// ============================ Adjust dialog ============================

function AdjustDialog({ item, onClose, onSaved }: { item: InventoryItem; onClose: () => void; onSaved: () => void }) {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const [mode, setMode] = useState<"set" | "increment" | "decrement">("set");
  const [value, setValue] = useState(String(item.stock));
  const [note, setNote] = useState("");

  const save = useMutation({
    mutationFn: () => admin.adjustStock(authedFetch, item.variantId, mode, Number(value), note || undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
      toast.success("Stock updated");
      onSaved();
    },
    onError: (e) => toastApiError(e),
  });

  const modes: { label: string; value: typeof mode }[] = [
    { label: "Set to", value: "set" },
    { label: "Add", value: "increment" },
    { label: "Remove", value: "decrement" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-text-primary/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border-light bg-bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted transition-colors hover:text-text-primary"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="font-display text-xl font-semibold text-text-primary">Adjust stock</h2>
        <p className="mt-1 font-body text-sm text-text-muted">
          {item.productName} · {item.sku}
        </p>
        <p className="mt-1 font-body text-xs text-text-muted">
          Current: <span className="text-text-secondary">{item.stock} on hand</span> · {item.reserved} reserved · {item.available} available · {item.sold} sold
        </p>

        <div className="mt-5 space-y-4">
          <div className="flex gap-2">
            {modes.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 font-body text-xs font-medium transition-colors",
                  mode === m.value ? "border-cta-fill bg-cta-fill text-white" : "border-border-default text-text-secondary hover:border-border-focus",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">
              {mode === "set" ? "New quantity" : "Quantity"}
            </label>
            <input className={input} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">Note (optional)</label>
            <input className={input} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for this adjustment" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border-default py-2.5 font-body text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending || value.trim() === ""}
            className="flex-1 rounded-full bg-text-primary py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-bg-dark disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
