"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Clock, Lock, ShoppingBag } from "lucide-react";

import { Navbar } from "@/features/navbar";
import { PageHeader } from "@/components/shared/page-header";
import { PolicyAccordion } from "@/components/shared/policy-accordion";
import { useCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-checkout";
import { useAddressStore } from "@/store/address-store";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { useAuthModalStore } from "@/features/auth/auth-modal-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().min(1, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone number"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(4, "Enter a valid PIN code"),
  country: z.string().min(2),
  paymentMethod: z.enum(["razorpay", "cod"]),
  notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

const inputClass = cn(
  "w-full rounded-lg border border-border-default bg-white px-4 py-2.5 font-body text-sm text-text-primary",
  "placeholder:text-text-muted/60 outline-none transition-colors focus:border-border-focus",
);

export function CheckoutView() {
  const { cart } = useCart();
  const { isLoaded, isSignedIn } = useAuthSession();
  const openAuth = useAuthModalStore((s) => s.openAuth);

  const authPending = CLERK_ENABLED && !isLoaded;
  const needsAuth = CLERK_ENABLED && isLoaded && !isSignedIn;

  // A guest reaching /checkout directly (deep link / "Buy Now") still must sign
  // in. Pop the auth modal and keep them here so they continue after verifying
  // — the cart is preserved and merged server-side by CartSync.
  useEffect(() => {
    if (needsAuth) openAuth("/checkout");
  }, [needsAuth, openAuth]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        <PageHeader title="Checkout" />
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {authPending ? (
            <CheckoutLoading />
          ) : needsAuth ? (
            <CheckoutAuthGate onSignIn={() => openAuth("/checkout")} />
          ) : cart.items.length === 0 ? (
            <EmptyCheckout />
          ) : (
            <CheckoutBody />
          )}
        </div>
      </main>
    </>
  );
}

function CheckoutBody() {
  const { cart } = useCart();
  const { email, fullName } = useAuthSession();
  const {
    quote,
    quoteLoading,
    coupon,
    setCoupon,
    placing,
    submit,
    reservation,
    reservationLoading,
    blocked,
    unavailableLines,
    secondsLeft,
    expired,
    refreshReservation,
  } = useCheckout();

  const savedAddresses = useAddressStore((s) => s.addresses);
  const addAddress = useAddressStore((s) => s.add);
  const [saveAddress, setSaveAddress] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: fullName ?? "",
      email: email ?? "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "IN",
      paymentMethod: "razorpay",
      notes: "",
    },
  });

  // Prefill identity once auth resolves (won't clobber user edits).
  useEffect(() => {
    if (email && !form.getValues("email")) form.setValue("email", email);
    if (fullName && !form.getValues("fullName")) form.setValue("fullName", fullName);
  }, [email, fullName, form]);

  // Prefill the default saved address once (only into empty fields).
  useEffect(() => {
    const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    if (def && !form.getValues("line1")) applyAddress(def);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses.length]);

  function applyAddress(a: {
    recipientName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  }) {
    form.setValue("fullName", a.recipientName || form.getValues("fullName"));
    form.setValue("phone", a.phone);
    form.setValue("line1", a.line1);
    form.setValue("line2", a.line2 ?? "");
    form.setValue("city", a.city);
    form.setValue("state", a.state);
    form.setValue("postalCode", a.postalCode);
    setSaveAddress(false); // reused → no need to re-save
  }

  const { register, handleSubmit, watch, formState } = form;
  const errors = formState.errors;
  // react-hook-form's watch() can't be memoized by the React Compiler (benign —
  // it just skips compiler memoization for this form component).
  // eslint-disable-next-line react-hooks/incompatible-library
  const paymentMethod = watch("paymentMethod");

  function onSubmit(v: FormValues) {
    if (saveAddress) {
      addAddress({
        recipientName: v.fullName,
        phone: v.phone,
        line1: v.line1,
        line2: v.line2,
        city: v.city,
        state: v.state,
        postalCode: v.postalCode,
        country: v.country || "IN",
      });
    }
    submit(v);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12"
    >
      {/* Left: contact + address + payment */}
      <div className="space-y-8">
        {savedAddresses.length > 0 && (
          <Section title="Deliver to">
            <div className="flex flex-wrap gap-2">
              {savedAddresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => applyAddress(a)}
                  className={cn(
                    "rounded-lg border border-border-default px-3 py-2 text-left font-body text-xs text-text-secondary",
                    "transition-colors hover:border-cta-fill hover:text-text-primary",
                  )}
                >
                  <span className="block font-semibold text-text-primary">
                    {a.label || a.recipientName}
                  </span>
                  <span className="block">
                    {a.line1}, {a.city} {a.postalCode}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section title="Contact">
          <Grid>
            <Field label="Full name" error={errors.fullName?.message}>
              <input className={inputClass} placeholder="Your name" {...register("fullName")} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <input className={inputClass} placeholder="+91 …" inputMode="tel" {...register("phone")} />
            </Field>
            <Field label="Email" error={errors.email?.message} full>
              <input className={inputClass} placeholder="you@example.com" inputMode="email" {...register("email")} />
            </Field>
          </Grid>
        </Section>

        <Section title="Delivery address">
          <Grid>
            <Field label="Address line 1" error={errors.line1?.message} full>
              <input className={inputClass} placeholder="House no., street, area" {...register("line1")} />
            </Field>
            <Field label="Address line 2 (optional)" full>
              <input className={inputClass} placeholder="Landmark, apartment" {...register("line2")} />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <input className={inputClass} {...register("city")} />
            </Field>
            <Field label="State" error={errors.state?.message}>
              <input className={inputClass} {...register("state")} />
            </Field>
            <Field label="PIN code" error={errors.postalCode?.message}>
              <input className={inputClass} inputMode="numeric" {...register("postalCode")} />
            </Field>
            <Field label="Country">
              <input className={cn(inputClass, "bg-bg-secondary")} value="India" readOnly />
            </Field>
          </Grid>
          <input type="hidden" {...register("country")} />
          <label className="mt-3 flex cursor-pointer items-center gap-2 font-body text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e.target.checked)}
              className="h-4 w-4 accent-[var(--cta-fill)]"
            />
            Save this address for next time
          </label>
        </Section>

        <Section title="Payment method">
          <div className="space-y-3">
            <PaymentOption
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              label="Pay online"
              hint="Card, UPI, NetBanking — secured by Razorpay"
              register={register("paymentMethod")}
            />
            <p className="font-body text-xs text-text-muted">
              Cash on Delivery is not available — we accept online prepaid payments only.
            </p>
          </div>
        </Section>

        <Section title="Order notes (optional)">
          <textarea
            className={cn(inputClass, "min-h-[88px] resize-y")}
            placeholder="Any delivery instructions?"
            {...register("notes")}
          />
        </Section>
      </div>

      {/* Right: summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-xl border border-border-light bg-bg-card p-6 shadow-[0_1px_2px_rgba(61,26,8,0.04)]">
          <h2 className="font-body text-sm font-bold uppercase tracking-[0.18em] text-text-primary">
            Order Summary
          </h2>

          <ReservationTimer
            loading={reservationLoading}
            reserved={Boolean(reservation)}
            secondsLeft={secondsLeft}
            expired={expired}
            onRefresh={refreshReservation}
          />

          <ul role="list" className="mt-4 max-h-72 space-y-3 overflow-y-auto">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <div className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-md bg-bg-secondary">
                  <Image src={item.image.url} alt={item.image.alt} fill sizes="48px" className="object-cover" />
                </div>
                <div className="flex flex-1 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-body text-xs font-medium text-text-primary">{item.title}</p>
                    <p className="font-body text-[11px] text-text-muted">Qty {item.quantity}</p>
                  </div>
                  <span className="font-body text-xs font-semibold text-text-primary">
                    {formatPrice(item.lineTotal)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <div className="mt-5 flex gap-2">
            <input
              className={cn(inputClass, "py-2")}
              placeholder="Coupon code"
              defaultValue={coupon ?? ""}
              onBlur={(e) => setCoupon(e.target.value.trim() || undefined)}
            />
          </div>

          <dl className="mt-5 space-y-2 border-t border-border-light pt-4 font-body text-sm">
            <SummaryRow label="Subtotal" value={quote ? formatPrice(quote.subtotal) : "—"} loading={quoteLoading} />
            {quote && quote.discountAmount > 0 && (
              <SummaryRow label="Discount" value={`− ${formatPrice(quote.discountAmount)}`} />
            )}
            <SummaryRow
              label="Shipping"
              value={quote ? (quote.shippingAmount > 0 ? formatPrice(quote.shippingAmount) : "Free") : "—"}
              loading={quoteLoading}
            />
            {quote && quote.taxAmount > 0 && <SummaryRow label="Tax" value={formatPrice(quote.taxAmount)} />}
            <div className="flex items-center justify-between border-t border-border-light pt-2.5">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="font-semibold text-text-primary">
                {quote ? formatPrice(quote.total) : "—"}
              </span>
            </div>
          </dl>

          {unavailableLines.length > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-badge-bg bg-badge-bg/30 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-badge-text" />
              <div className="font-body text-xs text-badge-text">
                <p className="font-semibold">Some items are no longer available:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {unavailableLines.map((l) => (
                    <li key={l.variantId}>
                      {l.productName}
                      {l.variantLabel ? ` (${l.variantLabel})` : ""} —{" "}
                      {l.reason === "unavailable"
                        ? "no longer sold"
                        : l.available > 0
                          ? `only ${l.available} available`
                          : "out of stock"}
                    </li>
                  ))}
                </ul>
                <p className="mt-1.5">
                  Update your <Link href="/cart" className="underline">bag</Link> to continue.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={placing || blocked || expired || quoteLoading || reservationLoading || !reservation}
            className={cn(
              "mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-text-primary py-3.5",
              "font-body text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors",
              "hover:bg-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/40",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <Lock className="h-4 w-4" />
            {placing ? "Placing…" : expired ? "Reservation expired" : "Pay & Place Order"}
          </button>
          <p className="mt-3 text-center font-body text-[11px] text-text-muted">
            Secure checkout. Your details are encrypted.
          </p>
        </div>

        {/* Policies & Information — directly under the order summary */}
        <PolicyAccordion className="mt-6" />
      </aside>
    </form>
  );
}

function ReservationTimer({
  loading,
  reserved,
  secondsLeft,
  expired,
  onRefresh,
}: {
  loading: boolean;
  reserved: boolean;
  secondsLeft: number;
  expired: boolean;
  onRefresh: () => void;
}) {
  if (loading && !reserved) {
    return <p className="mt-3 font-body text-xs text-text-muted">Reserving your items…</p>;
  }
  if (!reserved) return null;
  if (expired) {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-badge-bg bg-badge-bg/30 px-3 py-2">
        <span className="font-body text-xs text-badge-text">Your 3-minute hold expired.</span>
        <button
          type="button"
          onClick={onRefresh}
          className="font-body text-xs font-semibold text-cta-fill underline"
        >
          Refresh
        </button>
      </div>
    );
  }
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  return (
    <div className="mt-3 flex items-center gap-2 rounded-lg bg-bg-secondary px-3 py-2">
      <Clock className="h-3.5 w-3.5 text-cta-fill" />
      <span className="font-body text-xs text-text-secondary">
        Items reserved for{" "}
        <span className="font-semibold tabular-nums text-text-primary">
          {mm}:{String(ss).padStart(2, "0")}
        </span>
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", full && "sm:col-span-2")}>
      <label className="font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">
        {label}
      </label>
      {children}
      {error && <span className="font-body text-xs text-badge-text">{error}</span>}
    </div>
  );
}

function PaymentOption({
  value,
  checked,
  label,
  hint,
  register,
}: {
  value: string;
  checked: boolean;
  label: string;
  hint: string;
  register: UseFormRegisterReturn;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors",
        checked ? "border-cta-fill bg-cta-fill/[0.03]" : "border-border-light hover:border-border-focus",
      )}
    >
      <input type="radio" value={value} className="mt-0.5 accent-[var(--cta-fill)]" {...register} />
      <span>
        <span className="block font-body text-sm font-semibold text-text-primary">{label}</span>
        <span className="block font-body text-xs text-text-muted">{hint}</span>
      </span>
    </label>
  );
}

function SummaryRow({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-secondary">{label}</span>
      {loading ? (
        <span className="h-3 w-12 animate-pulse rounded bg-black/5" />
      ) : (
        <span className="text-text-primary">{value}</span>
      )}
    </div>
  );
}

function CheckoutLoading() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" />
    </div>
  );
}

function CheckoutAuthGate({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
      <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
        <Lock className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <p className="font-display italic text-lg text-text-muted sm:text-xl">
        Sign in to continue to checkout
      </p>
      <p className="mt-2 max-w-md font-body text-sm text-text-secondary">
        Your bag is saved. Sign in or create an account to place your order.
      </p>
      <button
        type="button"
        onClick={onSignIn}
        className={cn(
          "mt-7 inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
          "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
          "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
        )}
      >
        Sign in to continue
      </button>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
      <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
        <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <p className="font-display italic text-lg text-text-muted sm:text-xl">Your bag is empty</p>
      <p className="mt-2 max-w-md font-body text-sm text-text-secondary">
        Add a few pieces before checking out.
      </p>
      <Link
        href="/saris"
        className={cn(
          "mt-7 inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
          "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
          "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
        )}
      >
        Browse the collection
      </Link>
    </div>
  );
}
