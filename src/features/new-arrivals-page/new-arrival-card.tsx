"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/components/shared/product-card";

interface NewArrivalCardProps {
  product: Product;
  className?: string;
}

export function NewArrivalCard({ product, className }: NewArrivalCardProps) {
  const { code, name, price, mrp, image, href, category } = product;
  const hasDiscount = typeof mrp === "number" && mrp > price;

  return (
    <Link
      href={href}
      aria-label={`${code} ${name}${category ? ` — ${category}` : ""}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl",
        /* gold ring glow on hover */
        "ring-1 ring-border-light transition-all duration-500",
        "hover:ring-[var(--gold)] hover:shadow-[0_0_32px_rgba(196,152,42,0.20)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
        className,
      )}
    >
      {/* ── Full-bleed image ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-secondary">
        <Image
          src={image}
          alt={`${code} ${name}`}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 36vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        {/* Shimmer sweep on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"
        />

        {/* Bottom gradient for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* ── NEW badge ── */}
        <div
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 shadow-md"
          style={{ backgroundColor: "var(--gold)" }}
        >
          <GoldStar />
          <span className="text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: "var(--bg-dark)" }}>
            New
          </span>
        </div>

        {/* Sale badge */}
        {hasDiscount && (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-cta-fill backdrop-blur-sm">
            Sale
          </div>
        )}

        {/* ── Product info overlay (bottom) ── */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          {/* Code + name */}
          <p className="font-body text-[10px] font-normal uppercase tracking-[0.2em] text-white/60">
            {code}
          </p>
          <p className="mt-0.5 font-display text-[clamp(0.875rem,1.6vw,1.05rem)] font-medium leading-snug text-white">
            {name}
          </p>

          {/* Price row + action buttons */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span
                className="font-body text-sm font-semibold"
                style={{ color: "var(--gold-light)" }}
              >
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="font-body text-xs font-light text-white/45 line-through">
                  {formatPrice(mrp!)}
                </span>
              )}
            </div>

            {/* Bag + wishlist — slide in on hover */}
            <div className="flex items-center gap-1.5 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              <OverlayActionBtn
                label={`Add ${name} to bag`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} />
              </OverlayActionBtn>
              <OverlayActionBtn
                label={`Save ${name} to wishlist`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <Heart className="h-3.5 w-3.5" strokeWidth={1.75} />
              </OverlayActionBtn>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Small icon buttons inside the overlay ── */
interface OverlayActionBtnProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function OverlayActionBtn({ label, onClick, children }: OverlayActionBtnProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full",
        "bg-white/20 text-white backdrop-blur-sm",
        "border border-white/30",
        "transition-all duration-200 hover:scale-105 hover:bg-white hover:text-cta-fill",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        "sm:h-9 sm:w-9",
      )}
    >
      {children}
    </button>
  );
}

/* ── Tiny 4-pointed star for the NEW badge ── */
function GoldStar() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden fill="var(--bg-dark)">
      <path d="M4.5 0L5.2 3.8L9 4.5L5.2 5.2L4.5 9L3.8 5.2L0 4.5L3.8 3.8Z" />
    </svg>
  );
}
