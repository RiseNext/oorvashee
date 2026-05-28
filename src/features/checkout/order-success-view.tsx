"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Navbar } from "@/features/navbar";
import { OrderDetailView } from "@/features/order/order-detail-view";
import { useOrderTracking } from "@/hooks/use-orders";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { cn } from "@/lib/utils";

const ctaPrimary = cn(
  "inline-flex items-center justify-center gap-2 rounded-full bg-text-primary px-7 py-3",
  "font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors",
  "hover:bg-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/40",
);
const ctaGhost = cn(
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-cta-fill px-7 py-3",
  "font-body text-[11px] font-medium uppercase tracking-[0.18em] text-cta-fill transition-colors duration-300",
  "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
);

export function OrderSuccessView() {
  const params = useSearchParams();
  const orderNumber = params.get("order") ?? "";
  const email = params.get("email");
  const { isSignedIn } = useAuthSession();
  const { data: order, isLoading, isError } = useOrderTracking(orderNumber, email);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        <div className="bg-bg-secondary py-12 text-center px-4 sm:py-16">
          <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cta-fill/10 text-cta-fill">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
          </span>
          <h1
            className="font-display font-semibold uppercase"
            style={{ color: "var(--gold)", fontSize: "clamp(1.8rem,4.5vw,3rem)", letterSpacing: "0.1em" }}
          >
            Thank You
          </h1>
          <p className="mt-3 font-display italic text-sm sm:text-base text-text-muted">
            Your order has been placed
          </p>
          {orderNumber && (
            <p className="mt-1 font-body text-xs uppercase tracking-[0.18em] text-text-secondary">
              Order #{orderNumber}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" />
            </div>
          ) : order ? (
            <OrderDetailView order={order} />
          ) : (
            <p className="text-center font-body text-sm text-text-secondary">
              {isError
                ? "We couldn't load the order details right now, but your order was placed. Check your email for confirmation."
                : "Your order was placed. Check your email for confirmation."}
            </p>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <Link href="/saris" className={ctaGhost}>
              Continue shopping
            </Link>
            {isSignedIn ? (
              <Link href="/account/orders" className={ctaPrimary}>
                View my orders
              </Link>
            ) : (
              orderNumber &&
              email && (
                <Link href={`/orders/${orderNumber}?email=${encodeURIComponent(email)}`} className={ctaPrimary}>
                  Track this order
                </Link>
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}
