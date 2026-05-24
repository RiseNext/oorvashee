"use client";

import Link from "next/link";
import { Heart, Search, User } from "lucide-react";
import { CartButton } from "./cart-button";
import { cn } from "@/lib/utils";

interface NavbarActionsProps {
  className?: string;
  /** Tighter gap on mobile sheet layouts. */
  compact?: boolean;
  /** Close handler when used inside the mobile sheet. */
  onNavigate?: () => void;
}

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full text-text-primary transition-colors duration-300 hover:bg-bg-primary/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30";

export function NavbarActions({
  className,
  compact,
  onNavigate,
}: NavbarActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "gap-1" : "gap-0.5 lg:gap-1",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Search"
        className={iconButton}
        onClick={onNavigate}
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
      </button>

      <Link
        href="/account"
        aria-label="Account"
        onClick={onNavigate}
        className={iconButton}
      >
        <User className="h-[18px] w-[18px]" strokeWidth={1.6} />
      </Link>

      <Link
        href="/wishlist"
        aria-label="Wishlist"
        onClick={onNavigate}
        className={iconButton}
      >
        <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} />
      </Link>

      <CartButton />
    </div>
  );
}
