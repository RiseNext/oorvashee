"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import type { ProductDetailData } from "./data";

interface StickyHeaderProps {
  product: ProductDetailData;
  visible: boolean;
  selectedSize: string | null;
  selectedColor: number | null;
  selectedFabric: string | null;
  onSizeChange: (s: string) => void;
  onColorChange: (i: number) => void;
  onFabricChange: (f: string) => void;
  onAddToCart?: () => void;
  adding?: boolean;
  canBuy?: boolean;
}

export function StickyHeader({
  product,
  visible,
  selectedSize,
  selectedColor,
  selectedFabric,
  onSizeChange,
  onColorChange,
  onFabricChange,
  onAddToCart,
  adding = false,
  canBuy = true,
}: StickyHeaderProps) {
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b border-border-light bg-white shadow-md",
        "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* Thumbnail + info */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative h-12 w-9 overflow-hidden rounded-lg bg-bg-secondary">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <p className="max-w-[160px] truncate font-body text-xs font-semibold text-text-primary">
              {product.name}
            </p>
            <p className="font-body text-xs font-bold text-cta-fill">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        {/* Selectors */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
          <StickySelect
            label="Size"
            value={selectedSize ?? ""}
            options={product.sizes}
            onChange={onSizeChange}
          />
          <StickySelect
            label="Color"
            value={selectedColor !== null ? product.colors[selectedColor].label : ""}
            options={product.colors.map((c) => c.label)}
            onChange={(label) => {
              const i = product.colors.findIndex((c) => c.label === label);
              if (i !== -1) onColorChange(i);
            }}
          />
          <StickySelect
            label="Fabric"
            value={selectedFabric ?? ""}
            options={product.fabrics}
            onChange={onFabricChange}
          />
        </div>

        {/* Add to cart */}
        <button
          type="button"
          onClick={onAddToCart}
          disabled={adding || !canBuy}
          className="shrink-0 rounded-full bg-text-primary px-5 py-2 font-body text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-bg-dark focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          {adding ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

function StickySelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 cursor-pointer appearance-none rounded-full border border-border-default bg-bg-secondary pl-3 pr-7 font-body text-xs font-medium text-text-primary focus:border-border-focus focus:outline-none"
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
        <svg
          className="h-2.5 w-2.5 text-text-muted"
          viewBox="0 0 10 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
