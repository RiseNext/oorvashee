"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import type { AdminPolicy, PolicyUpdateBody } from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminError, StatusBadge, TableSkeleton } from "@/features/admin/ui";
import { cn } from "@/lib/utils";

export default function AdminPoliciesPage() {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-policies"],
    queryFn: () => admin.listPolicies(authedFetch),
  });

  const save = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: PolicyUpdateBody }) =>
      admin.updatePolicy(authedFetch, id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-policies"] });
      // Storefront reads the public copy under this key — bust it too.
      qc.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Policy saved");
    },
    onError: (e) => toastApiError(e),
  });

  return (
    <>
      <AdminHeading title="Policies & Information" />
      <p className="-mt-3 mb-6 max-w-2xl font-body text-sm text-text-muted">
        These documents appear under every product, in the cart, at checkout, and on the
        storefront policy pages. Edits go live everywhere as soon as you save.
      </p>

      {query.isLoading ? (
        <TableSkeleton rows={4} />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : (
        <div className="space-y-5">
          {(query.data ?? []).map((policy) => (
            <PolicyEditor
              // Remount with fresh local state whenever the server copy changes
              // (after a save/refetch), avoiding state-sync inside an effect.
              key={`${policy.id}-${policy.updatedAt}`}
              policy={policy}
              saving={save.isPending && save.variables?.id === policy.id}
              onSave={(patch) => save.mutate({ id: policy.id, patch })}
            />
          ))}
        </div>
      )}
    </>
  );
}

const inputClass = cn(
  "w-full rounded-lg border border-border-default bg-white px-3.5 py-2.5 font-body text-sm text-text-primary",
  "placeholder:text-text-muted/60 outline-none transition-colors focus:border-border-focus",
);
const labelClass =
  "mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary";

function PolicyEditor({
  policy,
  saving,
  onSave,
}: {
  policy: AdminPolicy;
  saving: boolean;
  onSave: (patch: PolicyUpdateBody) => void;
}) {
  const [title, setTitle] = useState(policy.title);
  const [summary, setSummary] = useState(policy.summary ?? "");
  const [body, setBody] = useState(policy.body);
  const [displayOrder, setDisplayOrder] = useState(policy.displayOrder);
  const [isActive, setIsActive] = useState(policy.isActive);

  const dirty =
    title !== policy.title ||
    summary !== (policy.summary ?? "") ||
    body !== policy.body ||
    displayOrder !== policy.displayOrder ||
    isActive !== policy.isActive;

  function handleSave() {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    onSave({
      title: title.trim(),
      summary: summary.trim() || undefined,
      body: body.trim(),
      displayOrder,
      isActive,
    });
  }

  return (
    <AdminCard>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="font-display text-lg font-semibold text-text-primary">{policy.title}</h2>
          <StatusBadge label={`/${policy.key}`} tone="neutral" />
          <StatusBadge
            label={policy.isActive ? "Visible" : "Hidden"}
            tone={policy.isActive ? "green" : "amber"}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <label className={labelClass}>Title</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Display order</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Summary (one line)</label>
        <input
          className={inputClass}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Short gist shown on the overview page"
        />
      </div>

      <div className="mt-4">
        <label className={labelClass}>Body</label>
        <textarea
          className={cn(inputClass, "min-h-[180px] resize-y leading-relaxed")}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <p className="mt-1.5 font-body text-xs text-text-muted">
          Separate paragraphs with a blank line.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-[var(--cta-fill)]"
          />
          Visible on the storefront
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className={cn(
            "rounded-full bg-text-primary px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white",
            "transition-colors hover:bg-bg-dark disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </AdminCard>
  );
}
