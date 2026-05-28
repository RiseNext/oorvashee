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
    <div className="group relative overflow-hidden rounded-2xl border border-border-light bg-bg-card p-5 shadow-[0_1px_2px_rgba(61,26,8,0.04),0_12px_32px_-20px_rgba(61,26,8,0.20)] transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(61,26,8,0.06),0_18px_44px_-22px_rgba(61,26,8,0.26)]">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-gold/40 via-gold to-gold/30" />
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p className="mt-2.5 font-display text-[1.9rem] font-semibold leading-none text-text-primary">{value}</p>
      {hint && <p className="mt-2 font-body text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

const TONE: Record<string, string> = {
  green: "bg-cta-fill/10 text-cta-fill ring-1 ring-inset ring-cta-fill/20",
  amber: "bg-badge-bg text-badge-text ring-1 ring-inset ring-badge-text/20",
  neutral: "bg-bg-secondary text-text-secondary ring-1 ring-inset ring-border-default/60",
  blue: "bg-[#3a3a5c]/10 text-[#3a3a5c] ring-1 ring-inset ring-[#3a3a5c]/15",
};

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: keyof typeof TONE | string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.12em]",
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
    <div className={cn("rounded-2xl border border-border-light bg-bg-card p-5 shadow-[0_1px_2px_rgba(61,26,8,0.04),0_10px_28px_-18px_rgba(61,26,8,0.16)]", className)}>
      {children}
    </div>
  );
}

export function AdminEmpty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-default/70 bg-bg-card py-16 text-center">
      <span aria-hidden className="mx-auto mb-4 block h-px w-14 bg-gradient-to-r from-transparent via-gold to-transparent" />
      <p className="font-display text-xl italic text-text-secondary">{title}</p>
      {body && <p className="mx-auto mt-1.5 max-w-sm font-body text-sm text-text-muted">{body}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl bg-gradient-to-r from-bg-secondary via-bg-secondary/55 to-bg-secondary"
        />
      ))}
    </div>
  );
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-full border border-border-default bg-bg-card px-5 py-2 font-body text-xs uppercase tracking-[0.12em] text-text-secondary shadow-sm transition-all duration-200 hover:border-cta-fill hover:text-cta-fill disabled:cursor-not-allowed disabled:border-border-light disabled:opacity-40 disabled:shadow-none"
      >
        Previous
      </button>
      <span className="font-body text-xs tracking-[0.06em] text-text-muted">
        Page <span className="text-text-primary">{page}</span> of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-full border border-border-default bg-bg-card px-5 py-2 font-body text-xs uppercase tracking-[0.12em] text-text-secondary shadow-sm transition-all duration-200 hover:border-cta-fill hover:text-cta-fill disabled:cursor-not-allowed disabled:border-border-light disabled:opacity-40 disabled:shadow-none"
      >
        Next
      </button>
    </div>
  );
}

/** Thin error state with retry. */
export function AdminError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-default/70 bg-bg-card py-14 text-center">
      <span aria-hidden className="mx-auto mb-4 block h-px w-14 bg-gradient-to-r from-transparent via-cta-fill/50 to-transparent" />
      <p className="font-display text-lg italic text-text-secondary">Couldn&apos;t load this data</p>
      <p className="mt-1 font-body text-sm text-text-muted">This is usually temporary.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-full border border-border-default bg-bg-card px-6 py-2 font-body text-xs uppercase tracking-[0.14em] text-text-secondary shadow-sm transition-colors duration-200 hover:border-cta-fill hover:text-cta-fill"
        >
          Retry
        </button>
      )}
    </div>
  );
}
