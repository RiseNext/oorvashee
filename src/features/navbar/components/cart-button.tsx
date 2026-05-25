"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore, selectCartCount } from "@/store/cart-store";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
  variant?: "default" | "light";
}

export function CartButton({ className, variant = "default" }: CartButtonProps) {
  // Avoid SSR hydration mismatch: render 0 on the server, real count after mount.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const count = useCartStore(selectCartCount);
  const display = hydrated ? count : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${display} item${display === 1 ? "" : "s"}`}
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none",
        variant === "light"
          ? "text-white hover:bg-white hover:text-black hover:scale-110 focus-visible:ring-2 focus-visible:ring-white/40"
          : "text-text-primary hover:bg-bg-primary/60 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/30",
        className,
      )}
    >
      <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.6} />
      <span
        className={cn(
          "absolute top-1 right-1 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-gradient-to-br from-gold-light to-gold px-1 text-[10px] font-semibold leading-none text-bg-dark shadow-sm ring-2",
          variant === "light" ? "ring-[#54100D]" : "ring-bg-secondary/70",
        )}
      >
        {display > 99 ? "99+" : display}
      </span>
    </Link>
  );
}
