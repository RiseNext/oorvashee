"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import { Navbar } from "@/features/navbar";
import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { OrderDetailView } from "./order-detail-view";
import { useOrderTracking } from "@/hooks/use-orders";
import { cn } from "@/lib/utils";

export function OrderTrackingView({ orderNumber }: { orderNumber: string }) {
  const params = useSearchParams();
  const emailParam = params.get("email");
  const [email, setEmail] = useState(emailParam ?? "");
  const [submitted, setSubmitted] = useState<string | null>(emailParam);

  const { data: order, isLoading, isError } = useOrderTracking(orderNumber, submitted);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        <div className="bg-bg-secondary py-6 text-center px-4 sm:py-8">
          <OrnamentalDivider align="center" className="mx-auto max-w-[130px] mb-2.5" />
          <h1
            className="font-display font-semibold uppercase"
            style={{ color: "var(--gold)", fontSize: "clamp(1.5rem,3.5vw,2.25rem)", letterSpacing: "0.12em" }}
          >
            Track Order
          </h1>
          <p className="mt-2 font-body text-xs uppercase tracking-[0.18em] text-text-secondary">
            #{orderNumber}
          </p>
        </div>

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {!submitted || (isError && !order) ? (
            <div className="mx-auto max-w-md text-center">
              <p className="font-body text-sm text-text-secondary">
                {isError
                  ? "We couldn't find that order. Check the email used at checkout."
                  : "Enter the email used at checkout to view this order."}
              </p>
              <form
                className="mt-5 flex flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(email.trim() || null);
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 rounded-lg border border-border-default bg-white px-4 py-2.5 font-body text-sm text-text-primary outline-none transition-colors focus:border-border-focus"
                />
                <button
                  type="submit"
                  className={cn(
                    "rounded-full bg-text-primary px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-white",
                    "transition-colors hover:bg-bg-dark",
                  )}
                >
                  View order
                </button>
              </form>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" />
            </div>
          ) : order ? (
            <OrderDetailView order={order} trackingEmail={submitted ?? undefined} />
          ) : null}
        </div>
      </main>
    </>
  );
}
