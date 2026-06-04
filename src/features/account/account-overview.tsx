"use client";

import Link from "next/link";
import { Package, Heart, MapPin, UserRound, LifeBuoy, ArrowRight } from "lucide-react";

import { useAuthSession } from "@/lib/auth/use-auth-session";
import { cn } from "@/lib/utils";

const CARDS = [
  { href: "/account/orders", label: "My Orders", desc: "Track and review your purchases", icon: Package },
  { href: "/wishlist", label: "Wishlist", desc: "Pieces you've saved for later", icon: Heart },
  { href: "/account/addresses", label: "Addresses", desc: "Manage your delivery details", icon: MapPin },
  { href: "/account/profile", label: "Profile", desc: "Your account information", icon: UserRound },
  { href: "/support", label: "Help & Support", desc: "Order help, shipping & FAQs", icon: LifeBuoy },
] as const;

export function AccountOverview() {
  const { firstName, fullName, email } = useAuthSession();
  const name = firstName || fullName || email?.split("@")[0] || "there";

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border-light bg-bg-card p-6 shadow-[0_1px_2px_rgba(61,26,8,0.04)]">
        <p className="font-display text-xl text-text-primary sm:text-2xl">
          Welcome back, <span className="text-cta-fill">{name}</span>
        </p>
        {email && <p className="mt-1 font-body text-sm text-text-muted">{email}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className={cn(
                "group flex items-center gap-4 rounded-xl border border-border-light bg-bg-card p-5",
                "shadow-[0_1px_2px_rgba(61,26,8,0.04)] transition-colors hover:border-border-focus",
              )}
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="flex-1">
                <span className="block font-body text-sm font-semibold uppercase tracking-[0.08em] text-text-primary">
                  {c.label}
                </span>
                <span className="block font-body text-sm text-text-secondary">{c.desc}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
