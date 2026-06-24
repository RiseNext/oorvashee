"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Truck } from "lucide-react";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { toast } from "sonner";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminEmpty, AdminError, TableSkeleton } from "@/features/admin/ui";

const QK = ["admin-couriers"] as const;

export default function AdminCouriersPage() {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");

  const query = useQuery({
    queryKey: QK,
    queryFn: () => admin.listCouriers(authedFetch),
  });

  const grant = useMutation({
    mutationFn: () => admin.grantCourier(authedFetch, email.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      setEmail("");
      toast.success("Courier access granted");
    },
    onError: (e) => toastApiError(e),
  });

  const revoke = useMutation({
    mutationFn: (em: string) => admin.revokeCourier(authedFetch, em),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
      toast.success("Courier access revoked");
    },
    onError: (e) => toastApiError(e),
  });

  const couriers = query.data ?? [];

  return (
    <>
      <AdminHeading title="Couriers" />

      <AdminCard className="mb-6">
        <p className="mb-3 max-w-2xl font-body text-sm text-text-secondary">
          Grant dispatch access to a delivery partner. They must have signed up first.
          Granting writes their role in Clerk and takes effect on their next sign-in;
          revoking reverts them to a normal customer.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim() && !grant.isPending) grant.mutate();
          }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="courier@example.com"
            className="w-full rounded-full border border-border-default bg-white px-4 py-2.5 font-body text-sm text-text-primary outline-none focus:border-border-focus sm:max-w-xs"
          />
          <button
            type="submit"
            disabled={grant.isPending || !email.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-text-primary px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-bg-dark disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {grant.isPending ? "Granting…" : "Grant courier access"}
          </button>
        </form>
      </AdminCard>

      {query.isLoading ? (
        <TableSkeleton rows={3} />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : couriers.length === 0 ? (
        <AdminEmpty title="No couriers yet" body="Grant access above to add your first delivery partner." />
      ) : (
        <AdminCard className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead className="border-b border-border-light text-[11px] uppercase tracking-[0.1em] text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Courier</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {couriers.map((c) => {
                  const revoking = revoke.isPending && revoke.variables === c.email;
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-bg-secondary/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cta-fill/10 text-cta-fill">
                            <Truck className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-medium text-text-primary">{c.fullName || "—"}</p>
                            <p className="text-xs text-text-muted">{c.email || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={!c.email || revoking}
                          onClick={() => c.email && revoke.mutate(c.email)}
                          className="rounded-full border border-border-default px-4 py-1.5 font-body text-xs uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-badge-text hover:text-badge-text disabled:opacity-50"
                        >
                          {revoking ? "Revoking…" : "Revoke"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </>
  );
}
