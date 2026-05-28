"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRazorpay, type RazorpayOrderOptions } from "react-razorpay";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import { useCart } from "@/hooks/use-cart";
import { newIdempotencyKey } from "@/lib/api/idempotency";
import { toastApiError } from "@/lib/api/toast";
import {
  placeOrder,
  requestQuote,
  verifyPayment,
  type PlaceOrderParams,
} from "@/lib/api/checkout";
import type { CheckoutCustomerInput, PlacedOrder } from "@/types/checkout";

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
  paymentMethod: PlaceOrderParams["paymentMethod"];
  notes?: string;
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

  const quoteQuery = useQuery({
    queryKey: ["checkout-quote", itemsKey, coupon ?? ""],
    queryFn: () => requestQuote(authedFetch, { items, couponCode: coupon }),
    enabled: items.length > 0,
    staleTime: 15_000,
  });

  function finishSuccess(orderNumber: string, email: string) {
    clear();
    router.push(
      `/checkout/success?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`,
    );
  }

  function openRazorpay(placed: PlacedOrder, customer: CheckoutCustomerInput) {
    if (!Razorpay || !placed.payment) {
      toast.error("Online payment is unavailable right now. Try Cash on Delivery.");
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
      handler: async (resp) => {
        try {
          await verifyPayment(
            authedFetch,
            {
              orderNumber: placed.orderNumber,
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            },
            newIdempotencyKey(),
          );
        } catch {
          // The Razorpay WEBHOOK is the backend's source of truth — even if
          // this client verify fails, the order finalises server-side. The
          // success page re-fetches the order, so we proceed regardless.
        }
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
    setPlacing(true);
    const customer: CheckoutCustomerInput = {
      email: values.email,
      phone: values.phone,
      fullName: values.fullName,
    };
    try {
      const placed = await placeOrder(
        authedFetch,
        {
          items,
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
          paymentMethod: values.paymentMethod,
          couponCode: coupon,
          notes: values.notes,
        },
        newIdempotencyKey(),
      );

      if (values.paymentMethod === "cod" || !placed.payment) {
        finishSuccess(placed.orderNumber, customer.email);
        return;
      }
      openRazorpay(placed, customer);
    } catch (error) {
      toastApiError(error);
      setPlacing(false);
    }
  }

  return {
    quote: quoteQuery.data,
    quoteLoading: quoteQuery.isLoading,
    quoteError: quoteQuery.isError,
    refetchQuote: quoteQuery.refetch,
    coupon,
    setCoupon,
    placing,
    submit,
  };
}
