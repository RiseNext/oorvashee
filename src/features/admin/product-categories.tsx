"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminError } from "@/features/admin/ui";
import { cn } from "@/lib/utils";
import type { AdminCategoryItem } from "@/types/admin";

// Friendly headers for the canonical taxonomy kinds; unknown kinds fall back
// to the raw value so new axes appear without a code change.
const KIND_LABEL: Record<string, string> = {
  collection: "Collections",
  fabric: "Fabric",
  occasion: "Occasion",
  region: "Region",
  color: "Colour",
  price_bracket: "Price",
};

/**
 * Multi-select category assignment for a product. Fetches active categories
 * (grouped by taxonomy kind), tracks a local selection seeded from the
 * product's current `categoryIds`, and persists the whole set via the
 * replace-semantics PUT. `onChanged` refetches the product afterwards.
 */
export function ProductCategories({
  productId,
  categoryIds,
  onChanged,
}: {
  productId: string;
  categoryIds: string[];
  onChanged: () => void;
}) {
  const { authedFetch } = useApiClient();
  // Shares the cache with the Categories admin page (same query key).
  const query = useQuery({ queryKey: ["admin-categories"], queryFn: () => admin.listCategories(authedFetch) });
  const [selected, setSelected] = useState<Set<string>>(() => new Set(categoryIds));

  const active = useMemo(() => (query.data ?? []).filter((c) => c.isActive), [query.data]);

  const groups = useMemo(() => {
    const m = new Map<string, AdminCategoryItem[]>();
    for (const c of active) {
      const arr = m.get(c.kind) ?? [];
      arr.push(c);
      m.set(c.kind, arr);
    }
    return [...m.entries()];
  }, [active]);

  const dirty = useMemo(() => {
    const current = new Set(categoryIds);
    if (current.size !== selected.size) return true;
    for (const id of selected) if (!current.has(id)) return true;
    return false;
  }, [categoryIds, selected]);

  const save = useMutation({
    mutationFn: () => admin.setProductCategories(authedFetch, productId, [...selected]),
    onSuccess: () => {
      toast.success("Categories updated");
      onChanged();
    },
    onError: (e) => toastApiError(e),
  });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded-lg bg-bg-secondary" />
        ))}
      </div>
    );
  }
  if (query.isError) return <AdminError onRetry={() => query.refetch()} />;
  if (active.length === 0) {
    return (
      <p className="font-body text-sm text-text-muted">
        No active categories yet — create one under Categories first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {groups.map(([kind, items]) => (
          <div key={kind}>
            <p className="mb-2 font-body text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted">
              {KIND_LABEL[kind] ?? kind}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((c) => {
                const on = selected.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c.id)}
                    aria-pressed={on}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 font-body text-xs font-medium transition-colors",
                      on
                        ? "border-cta-fill bg-cta-fill text-white"
                        : "border-border-default text-text-secondary hover:border-border-focus",
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!dirty || save.isPending}
        onClick={() => save.mutate()}
        className="rounded-full bg-text-primary px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-bg-dark disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save categories"}
      </button>
    </div>
  );
}
