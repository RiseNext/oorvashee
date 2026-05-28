"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

export const fmtINR = formatPrice;

export function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-card p-5 shadow-[0_1px_2px_rgba(61,26,8,0.04)]">
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-text-primary">{value}</p>
      {hint && <p className="mt-1 font-body text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

const TONE: Record<string, string> = {
  green: "bg-cta-fill/10 text-cta-fill",
  amber: "bg-badge-bg text-badge-text",
  neutral: "bg-bg-secondary text-text-secondary",
  blue: "bg-[#1e40af]/10 text-[#1e40af]",
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: keyof typeof TONE | string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.1em]",
        TONE[tone] ?? TONE.neutral,
      )}
    >
      {label}
    </span>
  );
}

/** Map order/payment/product status → a tone. */
export function statusTone(status: string): keyof typeof TONE {
  if (["delivered", "paid", "published", "active"].includes(status)) return "green";
  if (["cancelled", "failed", "archived", "out_of_stock"].includes(status)) return "amber";
  if (["shipped", "packed"].includes(status)) return "blue";
  return "neutral";
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border-light bg-bg-card p-5 shadow-[0_1px_2px_rgba(61,26,8,0.04)]", className)}>
      {children}
    </div>
  );
}

export function AdminEmpty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-card py-16 text-center">
      <p className="font-display italic text-lg text-text-muted">{title}</p>
      {body && <p className="mt-1 font-body text-sm text-text-secondary">{body}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-bg-secondary" />
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-full border border-border-default px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40"
      >
        Previous
      </button>
      <span className="font-body text-xs text-text-muted">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-full border border-border-default px-4 py-2 font-body text-xs uppercase tracking-[0.1em] text-text-secondary transition-colors hover:text-text-primary disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

/** Thin error state with retry. */
export function AdminError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-border-light bg-bg-card py-12 text-center">
      <p className="font-body text-sm text-text-secondary">Couldn&apos;t load this data.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full border border-border-default px-5 py-2 font-body text-xs uppercase tracking-[0.12em] text-text-secondary transition-colors hover:text-text-primary"
        >
          Retry
        </button>
      )}
    </div>
  );
}
