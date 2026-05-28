"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Navbar } from "@/features/navbar";
import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { ProductCard, type Product as CardProduct } from "@/components/shared/product-card";
import { useWishlist } from "@/hooks/use-wishlist";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED, SIGN_IN_URL } from "@/lib/auth/config";
import { cn } from "@/lib/utils";
import type { WishlistItem } from "@/types/wishlist";

function toCard(item: WishlistItem): CardProduct {
  return {
    id: item.productId,
    code: "",
    name: item.title,
    price: item.price,
    mrp: item.compareAtPrice,
    image: item.image.url,
    href: `/product/${item.slug}`,
  };
}

const ctaClass = cn(
  "mt-7 inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
  "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
  "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
);

export function WishlistView() {
  const { isLoaded, isSignedIn } = useAuthSession();
  const { wishlist, isLoading } = useWishlist();
  const authed = CLERK_ENABLED && isSignedIn;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        <div className="bg-bg-secondary py-10 text-center px-4 sm:py-14">
          <OrnamentalDivider align="center" className="mx-auto max-w-[180px] mb-5" />
          <h1
            className="font-display font-semibold uppercase"
            style={{ color: "var(--gold)", fontSize: "clamp(2rem,5vw,3.5rem)", letterSpacing: "0.12em" }}
          >
            Wishlist
          </h1>
          {authed && wishlist.count > 0 && (
            <p className="mt-3 font-display italic text-sm sm:text-base text-text-muted">
              {wishlist.count} saved {wishlist.count === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {!isLoaded ? (
            <WishlistSkeleton />
          ) : !authed ? (
            <Prompt
              title="Sign in to view your wishlist"
              body="Save pieces you love and find them here across every device."
              cta={CLERK_ENABLED ? { href: SIGN_IN_URL, label: "Sign in" } : { href: "/saris", label: "Browse the collection" }}
            />
          ) : isLoading ? (
            <WishlistSkeleton />
          ) : wishlist.items.length === 0 ? (
            <Prompt
              title="Your wishlist is empty"
              body="Tap the heart on any saree to save it here for later."
              cta={{ href: "/saris", label: "Browse the collection" }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
              {wishlist.items.map((item) => (
                <ProductCard key={item.id} product={toCard(item)} animated={false} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Prompt({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center sm:py-24">
      <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
        <Heart className="h-7 w-7" strokeWidth={1.5} />
      </span>
      <p className="font-display italic text-lg text-text-muted sm:text-xl">{title}</p>
      <p className="mt-2 max-w-md font-body text-sm text-text-secondary">{body}</p>
      <Link href={cta.href} className={ctaClass}>
        {cta.label}
      </Link>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border-light bg-bg-card">
          <div className="aspect-[4/5] w-full animate-pulse bg-bg-secondary" />
          <div className="flex flex-col gap-2 px-4 py-3.5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-black/5" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-black/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
