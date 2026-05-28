"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { StatusBadge, fmtINR } from "@/features/admin/ui";
import type { AdminVariant } from "@/types/admin";

const input =
  "w-full rounded-lg border border-border-default bg-white px-3 py-2 font-body text-sm text-text-primary outline-none transition-colors focus:border-border-focus";
const labelClass = "font-body text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary";

const EMPTY = { sku: "", price: "", stock: "0", size: "", color: "", isActive: true };

/**
 * Variant management for a product. Lists existing variants (SKU / attributes /
 * stock / price / status) with an active toggle, and an "Add variant" form
 * (SKU, price, stock, size, color, active). Saves via the admin variant API;
 * `onChanged` refetches the product so publish-readiness (≥1 active variant)
 * stays accurate. Stock edits beyond the initial seed live in the Inventory UI.
 */
export function ProductVariants({
  productId,
  variants,
  basePrice,
  onChanged,
}: {
  productId: string;
  variants: AdminVariant[];
  basePrice: number;
  onChanged: () => void;
}) {
  const { authedFetch } = useApiClient();
  const [f, setF] = useState({ ...EMPTY });

  const create = useMutation({
    mutationFn: () =>
      admin.createVariant(authedFetch, productId, {
        sku: f.sku.trim(),
        color: f.color.trim() || null,
        size: f.size.trim() || null,
        priceOverride: f.price.trim() ? Number(f.price) : null,
        initialStock: f.stock.trim() ? Number(f.stock) : 0,
        isActive: f.isActive,
        // Guarantee exactly one default exists (storefront variant resolution).
        isDefault: !variants.some((v) => v.isDefault),
      }),
    onSuccess: () => {
      setF({ ...EMPTY });
      toast.success("Variant added");
      onChanged();
    },
    onError: (e) => toastApiError(e),
  });

  const toggleActive = useMutation({
    mutationFn: (v: AdminVariant) =>
      admin.updateVariant(authedFetch, productId, v.id, { isActive: !v.isActive }),
    onSuccess: () => {
      toast.success("Variant updated");
      onChanged();
    },
    onError: (e) => toastApiError(e),
  });

  const canAdd = f.sku.trim().length > 0 && !create.isPending;

  return (
    <div className="space-y-5">
      {variants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead className="text-text-muted">
              <tr className="border-b border-border-light">
                <th className="py-2 pr-3 font-medium">SKU</th>
                <th className="py-2 pr-3 font-medium">Variant</th>
                <th className="py-2 pr-3 font-medium">Stock</th>
                <th className="py-2 pr-3 font-medium">Price</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-border-light last:border-0">
                  <td className="py-2.5 pr-3 text-text-primary">
                    {v.sku}
                    {v.isDefault && (
                      <span className="ml-1.5 font-body text-[10px] uppercase tracking-[0.1em] text-text-muted">
                        · default
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 text-text-secondary">
                    {[v.color, v.fabric, v.size].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-text-secondary">
                    {v.stock}
                    {v.reserved > 0 ? ` (${v.reserved} reserved)` : ""}
                  </td>
                  <td className="py-2.5 pr-3 text-text-primary">{fmtINR(v.priceOverride ?? basePrice)}</td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge label={v.isActive ? "active" : "inactive"} tone={v.isActive ? "green" : "amber"} />
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      disabled={toggleActive.isPending}
                      onClick={() => toggleActive.mutate(v)}
                      className="rounded-full border border-border-default px-3 py-1 font-body text-xs font-medium text-text-secondary transition-colors hover:border-cta-fill hover:text-cta-fill disabled:opacity-50"
                    >
                      {v.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canAdd) create.mutate();
        }}
        className="rounded-lg border border-dashed border-border-default p-4"
      >
        <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Add variant
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="SKU *">
            <input className={input} value={f.sku} onChange={(e) => setF((p) => ({ ...p, sku: e.target.value }))} placeholder="e.g. SAR-RED-M" />
          </Field>
          <Field label="Price (₹, optional)">
            <input className={input} inputMode="decimal" value={f.price} onChange={(e) => setF((p) => ({ ...p, price: e.target.value }))} placeholder={`Base ${fmtINR(basePrice)}`} />
          </Field>
          <Field label="Stock">
            <input className={input} inputMode="numeric" value={f.stock} onChange={(e) => setF((p) => ({ ...p, stock: e.target.value }))} />
          </Field>
          <Field label="Size (optional)">
            <input className={input} value={f.size} onChange={(e) => setF((p) => ({ ...p, size: e.target.value }))} />
          </Field>
          <Field label="Color (optional)">
            <input className={input} value={f.color} onChange={(e) => setF((p) => ({ ...p, color: e.target.value }))} />
          </Field>
          <label className="flex items-end gap-2 pb-2 font-body text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={f.isActive}
              onChange={(e) => setF((p) => ({ ...p, isActive: e.target.checked }))}
              className="h-4 w-4 accent-[var(--cta-fill)]"
            />
            Active
          </label>
        </div>
        <button
          type="submit"
          disabled={!canAdd}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-bg-dark disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {create.isPending ? "Adding…" : "Add variant"}
        </button>
      </form>

      {variants.length === 0 && (
        <p className="font-body text-xs text-text-muted">
          A product needs at least one active variant before it can be published.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  );
}
