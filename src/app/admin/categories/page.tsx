"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CornerDownRight } from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminEmpty, AdminError, StatusBadge, TableSkeleton } from "@/features/admin/ui";
import { cn } from "@/lib/utils";
import type { AdminCategoryItem } from "@/types/admin";

interface TreeNode extends AdminCategoryItem {
  children: TreeNode[];
}

function buildTree(items: AdminCategoryItem[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  items.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
    nodes.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

export default function AdminCategoriesPage() {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["admin-categories"], queryFn: () => admin.listCategories(authedFetch) });

  const tree = useMemo(() => buildTree(query.data ?? []), [query.data]);

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => admin.setCategoryActive(authedFetch, id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated");
    },
    onError: (e) => toastApiError(e),
  });

  return (
    <>
      <AdminHeading title="Categories" />

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <AdminError onRetry={() => query.refetch()} />
      ) : tree.length === 0 ? (
        <AdminEmpty title="No categories yet" body="Categories define the storefront taxonomy." />
      ) : (
        <AdminCard className="p-0">
          <ul role="list" className="divide-y divide-border-light">
            {tree.map((node) => (
              <CategoryRow
                key={node.id}
                node={node}
                depth={0}
                pendingId={toggle.isPending ? toggle.variables?.id : undefined}
                onToggle={(id, active) => toggle.mutate({ id, active })}
              />
            ))}
          </ul>
        </AdminCard>
      )}
    </>
  );
}

function CategoryRow({
  node,
  depth,
  pendingId,
  onToggle,
}: {
  node: TreeNode;
  depth: number;
  pendingId?: string;
  onToggle: (id: string, active: boolean) => void;
}) {
  return (
    <>
      <li className="flex items-center gap-3 p-4" style={{ paddingLeft: 16 + depth * 24 }}>
        {depth > 0 && <CornerDownRight className="h-4 w-4 shrink-0 text-text-muted" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-body text-sm font-medium text-text-primary">{node.name}</p>
            {!node.isActive && <StatusBadge label="Archived" tone="amber" />}
          </div>
          <p className="font-body text-xs text-text-muted">
            /{node.slug} · {node.kind}
          </p>
        </div>
        <button
          type="button"
          disabled={pendingId === node.id}
          onClick={() => onToggle(node.id, !node.isActive)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-xs font-medium transition-colors disabled:opacity-50",
            node.isActive
              ? "border-border-default text-text-secondary hover:border-cta-fill hover:text-cta-fill"
              : "border-cta-fill text-cta-fill hover:bg-cta-fill hover:text-white",
          )}
        >
          {node.isActive ? "Archive" : "Activate"}
        </button>
      </li>
      {node.children.map((child) => (
        <CategoryRow key={child.id} node={child} depth={depth + 1} pendingId={pendingId} onToggle={onToggle} />
      ))}
    </>
  );
}
