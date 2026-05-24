"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { fadeUp } from "@/animations/fade";

// Hoisted to module scope so the motion-wrapped Link is created once,
// not on every ProductCard render.
const MotionLink = motion.create(Link);

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  /** Optional MRP shown struck-through when greater than price. */
  mrp?: number;
  image: string;
  /** Href to the product detail page. */
  href: string;
  /** Optional category label (e.g. "Kanchipattu Silk") for screen readers. */
  category?: string;
}

interface ProductCardProps {
  product: Product;
  className?: string;
  /** Marks the card so the parent can vary motion (e.g. disable inside Tabs). */
  animated?: boolean;
}

export function ProductCard({
  product,
  className,
  animated = true,
}: ProductCardProps) {
  const { code, name, price, mrp, image, href, category } = product;
  const hasDiscount = typeof mrp === "number" && mrp > price;

  return (
    <MotionLink
      variants={animated ? fadeUp : undefined}
      href={href}
      aria-label={`${code} ${name}${category ? ` — ${category}` : ""}`}
      className={cn(
        "group/product relative flex h-full flex-col overflow-hidden rounded-xl bg-bg-card",
        "border border-border-light shadow-[0_1px_2px_rgba(61,26,8,0.04)]",
        "transition-all duration-500 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-24px_rgba(61,26,8,0.32)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
        className,
      )}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-secondary">
        <Image
          src={image}
          alt={`${code} ${name}`}
          fill
          sizes="(min-width: 1024px) 18vw, (min-width: 640px) 32vw, 65vw"
          className="object-cover transition-transform duration-[900ms] ease-out group-hover/product:scale-[1.045]"
        />

        {hasDiscount ? (
          <span
            className={cn(
              "absolute left-3 top-3 inline-flex items-center rounded-full",
              "bg-badge-bg px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-badge-text",
            )}
          >
            Sale
          </span>
        ) : null}

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <ActionButton
            label={`Add ${name} to bag`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.75} />
          </ActionButton>
          <ActionButton
            label={`Save ${name} to wishlist`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-3.5 w-3.5" strokeWidth={1.75} />
          </ActionButton>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3 sm:px-4 sm:py-3.5">
        <p className="line-clamp-1 font-body text-[13px] font-normal text-text-primary sm:text-sm">
          <span className="text-text-secondary">{code}</span>{" "}
          <span>{name}</span>
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-body text-sm font-medium text-cta-fill sm:text-[15px]">
            {formatPrice(price)}
          </span>
          {hasDiscount ? (
            <span className="font-body text-xs font-light text-text-muted line-through">
              {formatPrice(mrp!)}
            </span>
          ) : null}
        </div>
      </div>
    </MotionLink>
  );
}

interface ActionButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

function ActionButton({ label, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full",
        "bg-white/95 text-text-primary shadow-[0_2px_8px_rgba(61,26,8,0.18)]",
        "backdrop-blur-sm transition-all duration-200 ease-out",
        "hover:scale-105 hover:bg-white hover:text-cta-fill",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/50",
        "sm:h-9 sm:w-9",
      )}
    >
      {children}
    </button>
  );
}
