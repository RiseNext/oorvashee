"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  Package,
  Loader2,
} from "lucide-react";

import { useApiClient } from "@/hooks/use-api-client";
import * as courier from "@/lib/courier/api";
import { toastApiError } from "@/lib/api/toast";
import { cn } from "@/lib/utils";
import type { CourierOrder, CourierVendor } from "@/types/courier";

const QK = ["courier-orders"] as const;

export default function CourierPage() {
  const { authedFetch } = useApiClient();
  const query = useQuery({
    queryKey: QK,
    queryFn: () => courier.listDispatchOrders(authedFetch),
  });
  // Carriers for the AWB dropdown — fetched once (backend calls Daakia + caches).
  const vendorsQuery = useQuery({
    queryKey: ["courier-vendors"],
    queryFn: () => courier.listVendors(authedFetch),
    staleTime: 10 * 60 * 1000,
  });

  const counts = useMemo(() => {
    const list = query.data ?? [];
    return {
      ready: list.filter((o) => o.isReady).length,
      awaiting: list.filter((o) => o.status === "placed").length,
      dispatched: list.filter((o) => o.status === "shipped").length,
    };
  }, [query.data]);

  if (query.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-bg-secondary" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-2xl border border-dashed border-border-default/70 bg-bg-card py-14 text-center">
        <p className="font-display text-lg italic text-text-secondary">Couldn&apos;t load orders</p>
        <p className="mt-1 font-body text-sm text-text-muted">This is usually temporary.</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="mt-5 rounded-full border border-border-default bg-bg-card px-6 py-2 font-body text-xs uppercase tracking-[0.14em] text-text-secondary transition-colors hover:border-cta-fill hover:text-cta-fill"
        >
          Retry
        </button>
      </div>
    );
  }

  const orders = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 font-body text-xs">
        <Tag tone="green">{counts.ready} ready</Tag>
        <Tag tone="amber">{counts.awaiting} awaiting</Tag>
        <Tag tone="blue">{counts.dispatched} dispatched</Tag>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-default/70 bg-bg-card py-16 text-center">
          <span aria-hidden className="mx-auto mb-4 block h-px w-14 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="font-display text-xl italic text-text-secondary">Nothing to dispatch</p>
          <p className="mx-auto mt-1.5 max-w-sm font-body text-sm text-text-muted">
            Paid orders appear here. Ready ones can have an AWB added.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <OrderCard
              key={o.orderNumber}
              order={o}
              vendors={vendorsQuery.data ?? []}
              vendorsError={vendorsQuery.isError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({
  order,
  vendors,
  vendorsError,
}: {
  order: CourierOrder;
  vendors: CourierVendor[];
  vendorsError: boolean;
}) {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const [awb, setAwb] = useState("");
  const [vendorId, setVendorId] = useState<number | "">("");

  const save = useMutation({
    mutationFn: () => {
      const vendor = vendors.find((v) => v.vendorId === vendorId);
      return courier.setAwb(
        authedFetch,
        order.orderNumber,
        awb.trim(),
        vendorId as number,
        vendor?.vendorName ?? null,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("AWB saved — order dispatched");
    },
    onError: (e) => toastApiError(e),
  });

  const a = order.deliveryAddress;
  const addressLine = [a.line1, a.line2, a.city, a.state, a.postalCode]
    .filter(Boolean)
    .join(", ");
  const dispatched = order.status === "shipped";

  return (
    <li className="rounded-2xl border border-border-light bg-bg-card p-5 shadow-[0_1px_2px_rgba(61,26,8,0.04),0_10px_28px_-18px_rgba(61,26,8,0.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold leading-none text-text-primary">
            #{order.orderNumber}
          </p>
          <p className="mt-1.5 font-body text-sm font-medium text-text-primary">{order.customerName}</p>
        </div>
        <StatusPill order={order} />
      </div>

      <div className="mt-4 space-y-2 font-body text-sm text-text-secondary">
        <p className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
          <span>{addressLine || "—"}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-text-muted" />
          <a href={`tel:${order.phone}`} className="text-cta-fill underline-offset-2 hover:underline">
            {order.phone || "—"}
          </a>
        </p>
      </div>

      <div className="mt-4 border-t border-border-light pt-4">
        {dispatched ? (
          <p className="flex items-center gap-2 font-body text-sm text-text-secondary">
            <Package className="h-4 w-4 text-[#3a3a5c]" />
            AWB <span className="font-medium text-text-primary">{order.awb}</span>
            {order.courierName ? <span className="text-text-muted">· {order.courierName}</span> : null}
          </p>
        ) : order.isReady ? (
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-lg border border-border-default bg-white px-3 py-2 font-body text-sm text-text-primary outline-none focus:border-cta-fill sm:max-w-[44%]"
              >
                <option value="">Select carrier…</option>
                {vendors.map((v) => (
                  <option key={v.vendorId} value={v.vendorId}>
                    {v.vendorName ?? `Vendor ${v.vendorId}`}
                  </option>
                ))}
              </select>
              <input
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Enter AWB / tracking number"
                inputMode="text"
                autoCapitalize="characters"
                className="w-full rounded-lg border border-border-default bg-white px-3 py-2 font-body text-sm text-text-primary outline-none focus:border-cta-fill"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              {vendorsError ? (
                <span className="font-body text-xs text-badge-text">Couldn&apos;t load carriers — refresh.</span>
              ) : vendors.length === 0 ? (
                <span className="font-body text-xs text-text-muted">Loading carriers…</span>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={save.isPending || awb.trim().length === 0 || vendorId === ""}
                onClick={() => save.mutate()}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-text-primary px-5 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-bg-dark disabled:opacity-50"
              >
                {save.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {save.isPending ? "Saving…" : "Save AWB"}
              </button>
            </div>
          </div>
        ) : (
          <p className="font-body text-xs text-text-muted">
            Waiting for the store to mark this order ready for dispatch.
          </p>
        )}
      </div>
    </li>
  );
}

function StatusPill({ order }: { order: CourierOrder }) {
  if (order.status === "shipped") {
    return (
      <Pill tone="blue">
        <Truck className="h-3.5 w-3.5" /> Dispatched
      </Pill>
    );
  }
  if (order.isReady) {
    return (
      <Pill tone="green">
        <CheckCircle2 className="h-3.5 w-3.5" /> Ready
      </Pill>
    );
  }
  return (
    <Pill tone="amber">
      <Clock className="h-3.5 w-3.5" /> Awaiting
    </Pill>
  );
}

const TONE: Record<string, string> = {
  green: "bg-cta-fill/10 text-cta-fill ring-1 ring-inset ring-cta-fill/20",
  amber: "bg-badge-bg text-badge-text ring-1 ring-inset ring-badge-text/20",
  blue: "bg-[#3a3a5c]/10 text-[#3a3a5c] ring-1 ring-inset ring-[#3a3a5c]/15",
};

function Pill({ tone, children }: { tone: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em]",
        TONE[tone],
      )}
    >
      {children}
    </span>
  );
}

function Tag({ tone, children }: { tone: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 font-medium", TONE[tone])}>
      {children}
    </span>
  );
}
