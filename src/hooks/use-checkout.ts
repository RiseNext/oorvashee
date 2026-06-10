"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRazorpay, type RazorpayOrderOptions } from "react-razorpay";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import { useCart } from "@/hooks/use-cart";
import { ApiError } from "@/lib/api/errors";
import { toastApiError } from "@/lib/api/toast";
import { requestQuote, startCheckout, startPayment } from "@/lib/api/checkout";
import type {
  CheckoutCustomerInput,
  CheckoutLine,
  PlacedOrder,
} from "@/types/checkout";

const BRAND = "Oorvashee Saree House";
const BRAND_COLOR = "#7B0D0D";

export interface CheckoutSubmitValues {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  paymentMethod: "razorpay" | "cod";
  notes?: string;
}

/** Extract the per-line breakdown a 409 reservation_conflict carries in meta. */
function linesFromError(error: unknown): CheckoutLine[] {
  if (!(error instanceof ApiError)) return [];
  const meta = (error.details as { meta?: { lines?: unknown[] } } | undefined)?.meta;
  if (!Array.isArray(meta?.lines)) return [];
  return (meta!.lines as Record<string, unknown>[]).map((l) => ({
    variantId: String(l.variant_id),
    productName: String(l.product_name ?? "Item"),
    variantLabel: l.variant_label ? String(l.variant_label) : undefined,
    requested: Number(l.requested ?? 0),
    available: Number(l.available ?? 0),
    reserved: Boolean(l.reserved),
    reason: l.reason ? String(l.reason) : undefined,
  }));
}

export function useCheckout() {
  const router = useRouter();
  const { authedFetch } = useApiClient();
  const { cart, clear } = useCart();
  const { Razorpay } = useRazorpay();

  const [coupon, setCoupon] = useState<string | undefined>(undefined);
  const [placing, setPlacing] = useState(false);

  const items = useMemo(
    () => cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    [cart.items],
  );
  const itemsKey = items.map((i) => `${i.variantId}:${i.quantity}`).join(",");

  // Totals (unchanged) — server-authoritative pricing.
  const quoteQuery = useQuery({
    queryKey: ["checkout-quote", itemsKey, coupon ?? ""],
    queryFn: () => requestQuote(authedFetch, { items, couponCode: coupon }),
    enabled: items.length > 0,
    staleTime: 15_000,
  });

  // Reservation — POST /checkout the moment the user reaches checkout. Holds
  // stock for ~3 minutes. A 409 (reservation_conflict) is a real "unavailable",
  // never a transient error, so we don't retry it.
  const reservationQuery = useQuery({
    queryKey: ["checkout-reserve", itemsKey],
    queryFn: () => startCheckout(authedFetch),
    enabled: items.length > 0,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
  const reservation = reservationQuery.data;

  // Which lines could NOT be held — from the 409 breakdown, or (defensively)
  // any success line flagged reserved=false.
  const unavailableLines = useMemo<CheckoutLine[]>(() => {
    if (reservationQuery.isError) return linesFromError(reservationQuery.error);
    return (reservation?.lines ?? []).filter((l) => !l.reserved);
  }, [reservationQuery.isError, reservationQuery.error, reservation]);

  // Visible 3-minute countdown. `secondsLeft` is DERIVED from a once-a-second
  // clock tick, so we never call setState synchronously inside an effect.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const secondsLeft = reservation
    ? Math.max(0, Math.round((new Date(reservation.expiresAt).getTime() - now) / 1000))
    : 0;

  const expired = Boolean(reservation) && secondsLeft <= 0;
  const blocked = reservationQuery.isError || unavailableLines.length > 0;

  function finishSuccess(orderNumber: string, email: string) {
    clear();
    router.push(
      `/checkout/success?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`,
    );
  }

  function openRazorpay(placed: PlacedOrder, customer: CheckoutCustomerInput) {
    if (!Razorpay || !placed.payment) {
      toast.error("Online payment is unavailable right now. Please try again in a moment.");
      setPlacing(false);
      return;
    }
    const options: RazorpayOrderOptions = {
      key: placed.payment.razorpayKeyId,
      amount: placed.payment.amountPaise,
      currency: placed.payment.currency as RazorpayOrderOptions["currency"],
      name: BRAND,
      description: `Order ${placed.orderNumber}`,
      order_id: placed.payment.razorpayOrderId,
      prefill: {
        name: customer.fullName,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: BRAND_COLOR },
      handler: () => {
        // The Razorpay WEBHOOK is the SOLE source of truth — we do NOT verify
        // or finalise on the client. The success page polls the order status
        // until the webhook marks it paid.
        finishSuccess(placed.orderNumber, customer.email);
      },
      modal: {
        ondismiss: () => {
          setPlacing(false);
          toast.message(
            "Payment cancelled — your order is saved as pending. You can retry from My Orders.",
          );
        },
      },
    };
    const rzp = new Razorpay(options);
    rzp.on("payment.failed", (r) => {
      setPlacing(false);
      toast.error(r?.error?.description || "Payment failed. Please try again.");
    });
    rzp.open();
  }

  async function submit(values: CheckoutSubmitValues) {
    if (items.length === 0 || placing) return;
    const sessionId = reservation?.sessionId;
    if (!sessionId || expired) {
      toast.error("Your 3-minute hold expired — refreshing your reservation.");
      reservationQuery.refetch();
      return;
    }
    setPlacing(true);
    const customer: CheckoutCustomerInput = {
      email: values.email,
      phone: values.phone,
      fullName: values.fullName,
    };
    try {
      const placed = await startPayment(authedFetch, sessionId, {
        customer,
        shippingAddress: {
          recipientName: values.fullName,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          country: values.country || "IN",
        },
        notes: values.notes,
      });
      if (!placed.payment) {
        finishSuccess(placed.orderNumber, customer.email);
        return;
      }
      openRazorpay(placed, customer);
    } catch (error) {
      toastApiError(error);
      setPlacing(false);
      // Expired/conflicting hold → refresh the reservation so they can retry.
      if (error instanceof ApiError && error.status === 409) {
        reservationQuery.refetch();
      }
    }
  }

  return {
    quote: quoteQuery.data,
    quoteLoading: quoteQuery.isLoading,
    quoteError: quoteQuery.isError,
    refetchQuote: quoteQuery.refetch,
    // Reservation surface
    reservation,
    reservationLoading: reservationQuery.isLoading,
    blocked,
    unavailableLines,
    secondsLeft,
    expired,
    refreshReservation: () => reservationQuery.refetch(),
    coupon,
    setCoupon,
    placing,
    submit,
  };
}
