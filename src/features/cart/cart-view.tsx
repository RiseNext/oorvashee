"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";

import { Navbar } from "@/features/navbar";
import { PageHeader } from "@/components/shared/page-header";
import { PolicyAccordion } from "@/components/shared/policy-accordion";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type { CartItem } from "@/types/cart";

const FREE_SHIP_THRESHOLD = siteConfig.freeShippingThreshold;

export function CartView() {
  const { cart, isLoading } = useCart();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        <PageHeader
          title="Shopping Bag"
          subtitle={
            cart.itemCount > 0
              ? `${cart.itemCount} ${cart.itemCount === 1 ? "piece" : "pieces"} in your bag`
              : undefined
          }
        />

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {isLoading ? (
            <CartSkeleton />
          ) : cart.items.length === 0 ? (
            <EmptyCart />
          ) : (
            <CartBody />
          )}
        </div>
      </main>
    </>
  );
}

function CartBody() {
  const { cart, updateQuantity, removeItem, clear, isMutating } = useCart();
  const router = useRouter();

  const canCheckout = cart.items.length > 0 && !cart.hasUnavailableItems;
  const remainingForFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - cart.subtotal);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
      {/* Line items */}
      <div>
        {cart.hasUnavailableItems && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-badge-bg bg-badge-bg/30 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-badge-text" />
            <p className="font-body text-sm text-badge-text">
              Some pieces in your bag are no longer available. Remove them to continue to checkout.
            </p>
          </div>
        )}

        <ul role="list" className="divide-y divide-border-light border-y border-border-light">
          {cart.items.map((item) => (
            <CartRow
              key={item.id}
              item={item}
              onQty={(q) => updateQuantity(item.id, q)}
              onRemove={() => removeItem(item.id)}
              busy={isMutating}
            />
          ))}
        </ul>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={clear}
            disabled={isMutating}
            className="font-body text-xs uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-cta-fill disabled:opacity-50"
          >
            Clear bag
          </button>
        </div>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-xl border border-border-light bg-bg-card p-6 shadow-[0_1px_2px_rgba(61,26,8,0.04)]">
          <h2 className="font-body text-sm font-bold uppercase tracking-[0.18em] text-text-primary">
            Order Summary
          </h2>
          <div className="mt-5 flex items-center justify-between font-body text-sm">
            <span className="text-text-secondary">Subtotal</span>
            <span className="font-semibold text-text-primary">{formatPrice(cart.subtotal)}</span>
          </div>
          <p className="mt-2 font-body text-xs text-text-muted">
            Shipping &amp; taxes calculated at checkout.
          </p>
          {remainingForFreeShip > 0 ? (
            <p className="mt-3 font-body text-xs text-text-secondary">
              Add {formatPrice(remainingForFreeShip)} more for free shipping.
            </p>
          ) : (
            <p className="mt-3 font-body text-xs text-cta-fill">You&apos;ve unlocked free shipping.</p>
          )}

          <button
            type="button"
            disabled={!canCheckout || isMutating}
            onClick={() => router.push("/checkout")}
            className={cn(
              "mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-text-primary py-3.5",
              "font-body text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors",
              "hover:bg-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/40",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href="/saris"
            className="mt-3 block text-center font-body text-xs uppercase tracking-[0.16em] text-text-muted transition-colors hover:text-text-primary"
          >
            Continue shopping
          </Link>
        </div>

        {/* Policies & Information — directly under the order summary */}
        <PolicyAccordion className="mt-6" />
      </aside>
    </div>
  );
}

function CartRow({
  item,
  onQty,
  onRemove,
  busy,
}: {
  item: CartItem;
  onQty: (q: number) => void;
  onRemove: () => void;
  busy: boolean;
}) {
  return (
    <li className="flex gap-4 py-5 sm:gap-5">
      <Link
        href={`/product/${item.slug}`}
        className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-lg bg-bg-secondary sm:w-24"
      >
        <Image src={item.image.url} alt={item.image.alt} fill sizes="96px" className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/product/${item.slug}`}
              className="font-body text-sm font-medium text-text-primary transition-colors hover:text-cta-fill sm:text-[15px]"
            >
              {item.title}
            </Link>
            {item.variantLabel && (
              <p className="mt-0.5 font-body text-xs text-text-muted">{item.variantLabel}</p>
            )}
            {!item.available && (
              <span className="mt-1.5 inline-flex items-center rounded-full bg-badge-bg px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-badge-text">
                Unavailable
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.title}`}
            onClick={onRemove}
            disabled={busy}
            className="shrink-0 text-text-muted transition-colors hover:text-cta-fill disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="inline-flex items-center overflow-hidden rounded-full border border-border-default">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => onQty(item.quantity - 1)}
              disabled={busy}
              className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-9 text-center font-body text-sm font-semibold tabular-nums text-text-primary">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => onQty(item.quantity + 1)}
              disabled={busy || item.quantity >= item.maxQuantity}
              className="flex h-8 w-8 items-center justify-center text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="font-body text-sm font-semibold text-text-primary sm:text-base">
            {formatPrice(item.lineTotal)}
          </span>
        </div>
      </div>
    </li>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
      <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
        <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <p className="font-display italic text-lg text-text-muted sm:text-xl">Your bag is empty</p>
      <p className="mt-2 max-w-md font-body text-sm text-text-secondary">
        Discover handwoven sarees crafted on traditional looms — add your favourites to begin.
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

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border-light pb-5">
            <div className="aspect-[4/5] w-20 animate-pulse rounded-lg bg-bg-secondary sm:w-24" />
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-black/5" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-black/5" />
              <div className="h-8 w-28 animate-pulse rounded-full bg-black/5" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-bg-secondary" />
    </div>
  );
}
