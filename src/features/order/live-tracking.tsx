"use client";

import { Loader2, Truck, ExternalLink } from "lucide-react";

import { useLiveTracking } from "@/hooks/use-live-tracking";
import { cn } from "@/lib/utils";

/**
 * Live courier-tracking panel. Loads AFTER the order page has painted (its own
 * query), so a slow Daakia never delays the page. Shows a loading state, then
 * the live status + scan events, or a graceful fallback (with a carrier link
 * when available) if Daakia is unavailable.
 */
export function LiveTracking({
  orderNumber,
  email,
  trackingUrl,
}: {
  orderNumber: string;
  email?: string;
  /** Stored fallback tracking URL, if any. */
  trackingUrl?: string;
}) {
  const { data, isLoading } = useLiveTracking({ orderNumber, email, enabled: true });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border-light bg-bg-card p-4 font-body text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading live tracking…
      </div>
    );
  }

  const url = data?.trackingUrl ?? trackingUrl ?? null;

  if (!data || !data.available) {
    return (
      <div className="rounded-xl border border-border-light bg-bg-card p-4 font-body text-sm text-text-muted">
        Live tracking isn&apos;t available right now.
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1 text-cta-fill underline underline-offset-2"
          >
            Track on the carrier site <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-light bg-bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
          Live Tracking
        </h3>
        {data.lastStatus && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3a3a5c]/10 px-2.5 py-0.5 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-[#3a3a5c]">
            <Truck className="h-3 w-3" /> {data.lastStatus}
          </span>
        )}
      </div>
      {data.vendorName && (
        <p className="mt-1 font-body text-xs text-text-muted">
          via {data.vendorName}
          {data.awb ? ` · ${data.awb}` : ""}
        </p>
      )}

      {data.events.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {data.events.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  i === 0 ? "bg-cta-fill" : "bg-border-default",
                )}
              />
              <div className="min-w-0">
                <p className="font-body text-sm text-text-primary">
                  {e.message ?? e.status ?? "Update"}
                </p>
                <p className="font-body text-xs text-text-muted">
                  {[e.location, e.eventTime].filter(Boolean).join(" · ")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 font-body text-sm text-text-muted">No movement scans yet.</p>
      )}

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 font-body text-sm text-cta-fill underline underline-offset-2"
        >
          Track on the carrier site <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
