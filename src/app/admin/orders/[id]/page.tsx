"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminCard, StatusBadge, fmtINR, fmtDate, statusTone } from "@/features/admin/ui";
import { cn } from "@/lib/utils";
import type { AdminOrderDetail } from "@/types/admin";

const inputC = "w-full rounded-lg border border-border-default bg-white px-3 py-2 font-body text-sm text-text-primary outline-none focus:border-border-focus";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { authedFetch } = useApiClient();
  const query = useQuery({ queryKey: ["admin-order", id], queryFn: () => admin.getOrder(authedFetch, id) });

  return (
    <>
      <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-1.5 font-body text-sm text-text-muted transition-colors hover:text-cta-fill">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>
      {query.isLoading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" /></div>
      ) : query.data ? (
        <OrderDetail order={query.data} />
      ) : (
        <p className="font-body text-sm text-text-secondary">Order not found.</p>
      )}
    </>
  );
}

function OrderDetail({ order }: { order: AdminOrderDetail }) {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const id = order.id;
  const set = (o: AdminOrderDetail) => qc.setQueryData(["admin-order", id], o);

  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [showShip, setShowShip] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const packed = useMutation({
    mutationFn: () => admin.markPacked(authedFetch, id),
    onSuccess: (o) => { set(o); toast.success("Marked ready for dispatch"); },
    onError: (e) => toastApiError(e),
  });
  const shipped = useMutation({
    mutationFn: () => admin.markShipped(authedFetch, id, { courierName: courier, trackingId: tracking, trackingUrl }),
    onSuccess: (o) => { set(o); setShowShip(false); toast.success("Marked shipped"); },
    onError: (e) => toastApiError(e),
  });
  const delivered = useMutation({
    mutationFn: () => admin.markDelivered(authedFetch, id),
    onSuccess: (o) => { set(o); toast.success("Marked delivered"); },
    onError: (e) => toastApiError(e),
  });
  const codPaid = useMutation({
    mutationFn: () => admin.markCodPaid(authedFetch, id),
    onSuccess: (o) => { set(o); toast.success("Marked COD paid"); },
    onError: (e) => toastApiError(e),
  });
  const cancel = useMutation({
    mutationFn: () => admin.cancelOrder(authedFetch, id, reason),
    onSuccess: (o) => { set(o); setShowCancel(false); toast.success("Order cancelled"); },
    onError: (e) => toastApiError(e),
  });
  const addNote = useMutation({
    mutationFn: () => admin.addOrderNote(authedFetch, id, note),
    onSuccess: (o) => { set(o); setNote(""); toast.success("Note added"); },
    onError: (e) => toastApiError(e),
  });

  const terminal = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-text-primary">#{order.orderNumber}</h1>
          <StatusBadge label={order.status} tone={statusTone(order.status)} />
          <StatusBadge label={order.paymentStatus} tone={statusTone(order.paymentStatus)} />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* "Packed" status === Ready for Dispatch — this is what the courier portal reads. */}
          {order.status === "placed" && <Action label="Mark ready for dispatch" onClick={() => packed.mutate()} pending={packed.isPending} />}
          {order.status === "packed" && <Action label="Mark shipped" onClick={() => setShowShip((v) => !v)} />}
          {order.status === "shipped" && <Action label="Mark delivered" onClick={() => delivered.mutate()} pending={delivered.isPending} />}
          {order.paymentMethod === "cod" && order.paymentStatus === "cod_pending" && (
            <Action label="Mark COD paid" onClick={() => codPaid.mutate()} pending={codPaid.isPending} />
          )}
          {!terminal && <Action label="Cancel" onClick={() => setShowCancel((v) => !v)} danger />}
        </div>
      </div>

      {showShip && (
        <AdminCard>
          <p className="mb-3 font-body text-sm font-semibold text-text-primary">Shipment details</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <input className={inputC} placeholder="Courier" value={courier} onChange={(e) => setCourier(e.target.value)} />
            <input className={inputC} placeholder="Tracking ID" value={tracking} onChange={(e) => setTracking(e.target.value)} />
            <input className={inputC} placeholder="Tracking URL (optional)" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
          </div>
          <button type="button" disabled={shipped.isPending || !courier || !tracking} onClick={() => shipped.mutate()} className="mt-3 rounded-full bg-text-primary px-5 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-50">
            {shipped.isPending ? "Shipping…" : "Confirm shipped"}
          </button>
        </AdminCard>
      )}
      {showCancel && (
        <AdminCard>
          <p className="mb-3 font-body text-sm font-semibold text-text-primary">Cancel order</p>
          <input className={inputC} placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button type="button" disabled={cancel.isPending || reason.trim().length < 3} onClick={() => cancel.mutate()} className="mt-3 rounded-full bg-badge-text px-5 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white disabled:opacity-50">
            {cancel.isPending ? "Cancelling…" : "Confirm cancellation"}
          </button>
        </AdminCard>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AdminCard className="p-0">
            <ul role="list" className="divide-y divide-border-light">
              {order.items.map((it) => (
                <li key={it.id} className="flex gap-3 p-4">
                  <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md bg-bg-secondary">
                    {it.primaryImageUrl && <Image src={it.primaryImageUrl} alt={it.productName} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div>
                      <p className="font-body text-sm font-medium text-text-primary">{it.productName}</p>
                      <p className="font-body text-xs text-text-muted">{it.variantLabel ?? it.sku} · Qty {it.quantity}</p>
                    </div>
                    <span className="font-body text-sm font-semibold text-text-primary">{fmtINR(it.lineTotal)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </AdminCard>

          {/* Timeline */}
          <AdminCard>
            <h2 className="mb-4 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Timeline</h2>
            {order.timeline.length === 0 ? (
              <p className="font-body text-sm text-text-muted">No events yet.</p>
            ) : (
              <ol className="space-y-3">
                {order.timeline.map((ev, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cta-fill" />
                    <div>
                      <p className="font-body text-sm text-text-primary">{ev.summary}</p>
                      <p className="font-body text-xs text-text-muted">{fmtDate(ev.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </AdminCard>

          {/* Notes */}
          <AdminCard>
            <h2 className="mb-3 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Add note</h2>
            <div className="flex gap-2">
              <input className={inputC} placeholder="Internal note…" value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="button" disabled={addNote.isPending || !note.trim()} onClick={() => addNote.mutate()} className="shrink-0 rounded-full border border-border-default px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-text-secondary hover:text-text-primary disabled:opacity-50">
                Add
              </button>
            </div>
            {order.notes && <p className="mt-3 whitespace-pre-line font-body text-sm text-text-secondary">{order.notes}</p>}
          </AdminCard>
        </div>

        {/* Sidebar: customer + totals + shipment */}
        <aside className="space-y-4">
          <AdminCard>
            <h2 className="mb-2 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Customer</h2>
            <p className="font-body text-sm text-text-primary">{order.customerName}</p>
            <p className="font-body text-xs text-text-muted">{order.email}</p>
            <p className="font-body text-xs text-text-muted">{order.phone}</p>
            <div className="mt-3 font-body text-sm text-text-secondary">
              {String(order.shippingAddress.line1 ?? "")}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postal_code].filter(Boolean).join(", ")}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Totals</h2>
            <dl className="space-y-1.5 font-body text-sm">
              <Row label="Subtotal" value={fmtINR(order.subtotal)} />
              {order.discountAmount > 0 && <Row label="Discount" value={`− ${fmtINR(order.discountAmount)}`} />}
              <Row label="Shipping" value={order.shippingAmount > 0 ? fmtINR(order.shippingAmount) : "Free"} />
              {order.taxAmount > 0 && <Row label="Tax" value={fmtINR(order.taxAmount)} />}
              <div className="flex justify-between border-t border-border-light pt-1.5 font-semibold text-text-primary">
                <span>Total</span><span>{fmtINR(order.total)}</span>
              </div>
            </dl>
            <p className="mt-3 font-body text-xs text-text-muted capitalize">
              {order.paymentMethod} · {order.paymentStatus.replace("_", " ")}
            </p>
          </AdminCard>

          {order.shipment?.trackingId && (
            <AdminCard>
              <h2 className="mb-2 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Shipment</h2>
              <p className="font-body text-sm text-text-secondary">{order.shipment.courierName} · {order.shipment.trackingId}</p>
              {order.shipment.trackingUrl && (
                <a href={order.shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="font-body text-sm text-cta-fill underline">Track</a>
              )}
            </AdminCard>
          )}
        </aside>
      </div>
    </div>
  );
}

function Action({ label, onClick, pending, danger }: { label: string; onClick: () => void; pending?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "rounded-full px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] transition-colors disabled:opacity-50",
        danger
          ? "border border-border-default text-text-secondary hover:border-badge-text hover:text-badge-text"
          : "bg-text-primary text-white hover:bg-bg-dark",
      )}
    >
      {pending ? "…" : label}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}
