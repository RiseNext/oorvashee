"use client";

import { type ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Package,
  MapPin,
  UserRound,
  LogOut,
  LifeBuoy,
} from "lucide-react";

import { Navbar } from "@/features/navbar";
import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { useAuthModalStore } from "@/features/auth/auth-modal-store";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package, exact: false },
  { href: "/account/addresses", label: "Addresses", icon: MapPin, exact: false },
  { href: "/account/profile", label: "Profile", icon: UserRound, exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Shared shell for every /account/* page — Navbar + auth guard + account nav. */
export function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  const { isLoaded, isSignedIn, signOut } = useAuthSession();
  const authed = CLERK_ENABLED && isSignedIn;
  const pathname = usePathname();
  const router = useRouter();
  const openAuth = useAuthModalStore((s) => s.openAuth);
  const [signingOut, setSigningOut] = useState(false);

  // Guest landing on /account directly → open the custom auth modal (return
  // here after sign-in). The profile icon already routes guests through the
  // modal, so this only covers deep links / post-sign-out.
  const needsAuth = CLERK_ENABLED && isLoaded && !isSignedIn;
  useEffect(() => {
    if (needsAuth) openAuth("/account");
  }, [needsAuth, openAuth]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        {!isLoaded ? (
          <Centered>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" />
          </Centered>
        ) : !authed ? (
          <Centered>
            <div className="text-center">
              <p className="font-display italic text-lg text-text-muted sm:text-xl">
                Sign in to view your account
              </p>
              {CLERK_ENABLED ? (
                <button
                  type="button"
                  onClick={() => openAuth("/account")}
                  className={cn(
                    "mt-6 inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
                    "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
                    "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
                  )}
                >
                  Sign in
                </button>
              ) : (
                <Link
                  href="/saris"
                  className={cn(
                    "mt-6 inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
                    "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
                    "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
                  )}
                >
                  Browse the collection
                </Link>
              )}
            </div>
          </Centered>
        ) : (
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <h1 className="mb-6 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
              {title}
            </h1>

            {/* Mobile: scroll tabs */}
            <nav className="scrollbar-hide -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 lg:hidden">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-2 font-body text-xs font-medium uppercase tracking-[0.1em] transition-colors",
                      active
                        ? "border-cta-fill bg-cta-fill text-white"
                        : "border-border-default text-text-secondary hover:border-border-focus hover:text-text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
              {/* Desktop: sidebar */}
              <aside className="hidden lg:block">
                <nav className="sticky top-28 space-y-1">
                  {NAV.map((item) => {
                    const active = isActive(pathname, item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm transition-colors",
                          active
                            ? "bg-bg-secondary font-semibold text-text-primary"
                            : "text-text-secondary hover:bg-bg-secondary/60 hover:text-text-primary",
                        )}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    );
                  })}
                  <Link
                    href="/support"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-text-secondary transition-colors hover:bg-bg-secondary/60 hover:text-text-primary"
                  >
                    <LifeBuoy className="h-4 w-4" strokeWidth={1.75} />
                    Help &amp; Support
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-text-secondary transition-colors hover:bg-bg-secondary/60 hover:text-cta-fill disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </nav>
              </aside>

              {/* Content */}
              <div className="min-w-0">{children}</div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-center py-32">{children}</div>;
}
