"use client";

import Image from "next/image";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import type { ProductDetailData } from "./data";

/* ── Star rating ── */
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg key={s} className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={s <= rating ? "var(--gold)" : "none"}
              stroke={s <= rating ? "var(--gold)" : "var(--star-empty)"}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </div>
      <span className="text-sm text-text-muted">{count} reviews</span>
    </div>
  );
}

/* ── WhatsApp SVG ── */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/* ── Pill button ── */
function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
        active
          ? "border-text-primary bg-text-primary text-white"
          : "border-border-default text-text-secondary hover:border-text-primary hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

/* ── Availability messaging (DB-driven, Phase 6) ── */
const AVAILABILITY_TONE: Record<string, string> = {
  low: "text-badge-text",
  selling_fast: "text-cta-fill",
  last_one: "text-cta-fill",
  reserved: "text-text-muted",
  out_of_stock: "text-text-muted",
};

function availabilityMessage(state?: string, qty?: number): string | null {
  switch (state) {
    case "low":
      return "Only a few pieces left";
    case "selling_fast":
      return `Selling fast — only ${qty ?? 0} left`;
    case "last_one":
      return "Last piece available";
    case "reserved":
      return "Reserved by another customer. May become available shortly.";
    case "out_of_stock":
      return "Out of Stock";
    default:
      return null; // in_stock / undefined → no message
  }
}

function AvailabilityNote({ variant }: { variant?: { availabilityState?: string; availableQuantity?: number } }) {
  if (!variant) return null;
  const note = availabilityMessage(variant.availabilityState, variant.availableQuantity);
  if (!note) return null;
  return (
    <p className={cn("font-body text-sm font-medium", AVAILABILITY_TONE[variant.availabilityState ?? ""] ?? "text-text-muted")}>
      {note}
    </p>
  );
}

/* ── Props ── */
export interface BuyZoneProps {
  product: ProductDetailData;
  selectedSize: string | null;
  selectedColor: number | null;
  selectedFabric: string | null;
  /** Currently resolved variant id (axis-resolved or manually picked). */
  currentVariantId?: string | null;
  /** Called when the user picks a variant from the flat fallback picker. */
  onVariantChange?: (id: string) => void;
  quantity: number;
  /** Max selectable units = backend-derived available_quantity for the
   * resolved variant. Undefined → no client limit (legacy/mock). */
  maxQuantity?: number;
  onSizeChange: (s: string) => void;
  onColorChange: (i: number) => void;
  onFabricChange: (f: string) => void;
  onQuantityChange: (q: number) => void;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  /** A Buy Now reserve→checkout round-trip is in flight. */
  buying?: boolean;
  /** Brief post-add acknowledgment for the optimistic Add to Cart. */
  justAdded?: boolean;
  canBuy?: boolean;
  outOfStock?: boolean;
}

export function BuyZone({
  product,
  selectedSize,
  selectedColor,
  selectedFabric,
  currentVariantId,
  onVariantChange,
  quantity,
  maxQuantity,
  onSizeChange,
  onColorChange,
  onFabricChange,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  buying = false,
  justAdded = false,
  canBuy = true,
  outOfStock = false,
}: BuyZoneProps) {
  // Either CTA being in progress disables both, so a click can't double-fire or
  // race a reservation. `justAdded` is the short Add to Cart success flash.
  const busy = buying || justAdded;
  // Clamp the stepper to the backend-derived available_quantity. Undefined ⇒
  // no client limit (legacy/mock). The backend remains the source of truth;
  // these limits are UX only.
  const maxQty = typeof maxQuantity === "number" ? maxQuantity : Infinity;
  const qtyControlsDisabled = outOfStock || maxQty <= 0;
  const atMin = quantity <= 1;
  const atMax = quantity >= maxQty;
  // Resolve the currently active variant from the structured list; falls back
  // to undefined when the product has no variants (legacy products).
  const currentVariant = currentVariantId
    ? product.variants.find((v) => v.id === currentVariantId)
    : undefined;

  // Displayed price prefers the selected variant's price; MRP stays at the
  // product level (variant-level MRP is a future addition — see Phase B).
  const displayedPrice = currentVariant?.price ?? product.price;
  const hasDiscount = typeof product.mrp === "number" && product.mrp > displayedPrice;
  const discount = hasDiscount
    ? Math.round(((product.mrp! - displayedPrice) / product.mrp!) * 100)
    : 0;

  // Show the flat variant picker only when axis pickers cannot disambiguate
  // (no color/size/fabric populated) AND there are multiple variants. For
  // axis-driven products the existing color/size/fabric controls own the UX.
  const showVariantFallback =
    product.variants.length >= 2 &&
    product.colors.length === 0 &&
    product.sizes.length === 0 &&
    product.fabrics.length === 0;

  function handleShare() {
    if (typeof navigator !== "undefined") {
      if (navigator.share) {
        navigator.share({ title: product.name, url: window.location.href });
      } else {
        navigator.clipboard?.writeText(window.location.href);
      }
    }
  }

  function handleWhatsApp() {
    if (typeof window !== "undefined") {
      const msg = encodeURIComponent(
        `Hi, I'm interested in ${product.name} (${product.code}): ${window.location.href}`,
      );
      const waNumber = siteConfig.contact.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${waNumber}?text=${msg}`, "_blank");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb + share icons */}
      <div className="flex items-start justify-between gap-4">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
          <Link href="/" className="transition-colors hover:text-text-primary">Home</Link>
          <span>/</span>
          <Link href={product.categorySlug} className="transition-colors hover:text-text-primary">
            {product.category}
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-text-secondary">{product.name}</span>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-default text-text-muted transition-colors hover:border-border-focus hover:text-text-primary focus-visible:outline-none"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            aria-label="Share on WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-default text-text-muted transition-colors hover:border-[#25D366] hover:text-[#25D366] focus-visible:outline-none"
          >
            <WhatsAppIcon />
          </button>
        </div>
      </div>

      {/* Rating — hidden until a review system exists (no fabricated stars) */}
      {product.reviewCount > 0 && (
        <StarRating rating={product.rating} count={product.reviewCount} />
      )}

      {/* Name + code */}
      <div>
        <h1 className="font-display text-2xl font-semibold leading-tight text-text-primary sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>
        {product.code && (
          <p className="mt-1.5 font-body text-[11px] uppercase tracking-[0.18em] text-text-muted">
            Code: {product.code}
            {currentVariant && product.variants.length >= 2 && (
              <span className="ml-2 text-text-secondary">
                · SKU: {currentVariant.sku}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Price — uses the selected variant's price when available so the
          number updates live as the customer switches variants. */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="font-body text-2xl font-bold text-text-primary">
            {formatPrice(displayedPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="font-body text-base text-text-muted line-through">
                {formatPrice(product.mrp!)}
              </span>
              <span className="rounded-full bg-badge-bg px-2.5 py-0.5 font-body text-[11px] font-semibold text-badge-text">
                {discount}% OFF
              </span>
            </>
          )}
        </div>
        <p className="mt-1 font-body text-xs text-text-muted">
          Inclusive of all taxes. Free shipping over {formatPrice(siteConfig.freeShippingThreshold)}.
        </p>
        <AvailabilityNote variant={currentVariant} />
      </div>

      <div className="h-px bg-border-light" />

      {/* Variant fallback picker — only renders when the product has multiple
          variants and NO color/size/fabric axes (the SKU-only case, e.g.
          dem-av1 / dem-av2). Axis-driven products keep using the existing
          Size/Color/Fabric pickers below; this block is invisible for them. */}
      {showVariantFallback && (
        <div>
          <p className="mb-2.5 font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
            Choose Variant
            {currentVariant && (
              <span className="ml-2 normal-case tracking-normal text-text-muted">
                — {currentVariant.label}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={v.id === currentVariantId}
                disabled={!v.available}
                onClick={() => onVariantChange?.(v.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
                  v.id === currentVariantId
                    ? "border-text-primary bg-text-primary text-white"
                    : "border-border-default text-text-secondary hover:border-text-primary hover:text-text-primary",
                  !v.available && "cursor-not-allowed opacity-50 line-through",
                )}
              >
                <span>{v.label}</span>
                {v.price !== product.price && (
                  <span className="text-xs opacity-80">{formatPrice(v.price)}</span>
                )}
                {!v.available && <span className="text-[10px] uppercase">Sold out</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {product.sizes.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
              Size
            </span>
            <button
              type="button"
              className="font-body text-xs text-cta-fill underline underline-offset-2 transition-colors hover:text-cta-fill-hover"
            >
              Size Chart
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <PillBtn key={size} active={selectedSize === size} onClick={() => onSizeChange(size)}>
                {size}
              </PillBtn>
            ))}
          </div>
        </div>
      )}

      {/* Color — image swatches */}
      {product.colors.length > 0 && (
        <div>
          <p className="mb-2.5 font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
            Color{selectedColor !== null ? ` — ${product.colors[selectedColor].label}` : ""}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((color, i) => (
              <button
                key={color.label}
                type="button"
                aria-label={color.label}
                onClick={() => onColorChange(i)}
                className={cn(
                  "relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60",
                  selectedColor === i
                    ? "border-[var(--gold)] shadow-[0_0_0_2px_var(--gold)]"
                    : "border-border-light hover:border-border-focus",
                )}
              >
                <Image src={color.swatch} alt={color.label} fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fabric */}
      {product.fabrics.length > 0 && (
        <div>
          <p className="mb-2.5 font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
            Fabric
          </p>
          <div className="flex flex-wrap gap-2">
            {product.fabrics.map((fabric) => (
              <PillBtn
                key={fabric}
                active={selectedFabric === fabric}
                onClick={() => onFabricChange(fabric)}
              >
                {fabric}
              </PillBtn>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="mb-2.5 font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
          Quantity
        </p>
        <div className="flex w-fit items-center overflow-hidden rounded-full border border-border-default">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={qtyControlsDisabled || atMin}
            className="flex h-10 w-10 items-center justify-center text-lg text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span className="w-10 text-center font-body text-sm font-semibold tabular-nums text-text-primary">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onQuantityChange(Math.min(maxQty, quantity + 1))}
            disabled={qtyControlsDisabled || atMax}
            className="flex h-10 w-10 items-center justify-center text-lg text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
        {Number.isFinite(maxQty) && maxQty > 0 && atMax && (
          <p className="mt-1.5 font-body text-xs text-text-muted">
            Maximum available quantity selected.
          </p>
        )}
      </div>

      {/* CTA buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={busy || !canBuy}
          aria-live="polite"
          className={cn(
            "h-12 flex-1 rounded-full border-2 border-text-primary font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary",
            "transition-colors duration-200 hover:bg-text-primary hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/40",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text-primary",
          )}
        >
          {outOfStock ? "Sold Out" : justAdded ? "Added ✓" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          disabled={busy || !canBuy}
          aria-live="polite"
          className={cn(
            "h-12 flex-1 rounded-full bg-text-primary font-body text-sm font-semibold uppercase tracking-[0.1em] text-white",
            "transition-colors duration-200 hover:bg-bg-dark",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/40",
            "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-text-primary",
          )}
        >
          {buying ? "Processing…" : "Buy It Now"}
        </button>
      </div>
    </div>
  );
}
