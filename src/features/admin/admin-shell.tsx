"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Boxes,
  FolderTree,
  Users,
  Store,
  LogOut,
} from "lucide-react";

import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, exact: false },
  { href: "/admin/categories", label: "Categories", icon: FolderTree, exact: false },
  { href: "/admin/customers", label: "Customers", icon: Users, exact: false },
] as const;

function active(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { isLoaded, role, signOut } = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();
  const [out, setOut] = useState(false);
  const isAdmin = CLERK_ENABLED && role === "admin";

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg-primary px-4 text-center">
        <p className="font-display text-2xl text-text-primary">Admin access required</p>
        <p className="max-w-md font-body text-sm text-text-secondary">
          This area is restricted to store administrators.
        </p>
        <Link
          href="/"
          className="rounded-full bg-text-primary px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
        >
          Back to store
        </Link>
      </div>
    );
  }

  async function handleSignOut() {
    setOut(true);
    try {
      await signOut();
      router.push("/");
    } finally {
      setOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary/20">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border-light bg-white/90 backdrop-blur">
        {/* Gold hairline — luxury frame */}
        <span aria-hidden className="block h-[2px] w-full bg-gradient-to-r from-gold/30 via-gold to-gold/30" />
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-baseline gap-2.5">
            <span className="font-display text-xl font-semibold tracking-wide" style={{ color: "var(--gold)" }}>
              Oorvashee
            </span>
            <span aria-hidden className="h-3.5 w-px bg-border-default" />
            <span className="font-body text-[10px] font-medium uppercase tracking-[0.28em] text-text-muted">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-body text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
            >
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">View store</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={out}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-body text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-cta-fill disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{out ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-border-light px-3 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 font-body text-xs font-medium transition-colors duration-200",
                active(pathname, item.href, item.exact)
                  ? "bg-[#54100D] text-white shadow-sm"
                  : "text-text-secondary hover:bg-bg-secondary",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-screen-2xl">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-border-light bg-white/70 lg:block">
          <nav className="sticky top-16 space-y-1.5 p-4">
            <p className="px-3 pb-2 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
              Manage
            </p>
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = active(pathname, item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm transition-all duration-200",
                    isActive
                      ? "bg-[#54100D]/[0.06] font-semibold text-[#54100D] ring-1 ring-inset ring-[#54100D]/10"
                      : "text-text-secondary hover:bg-bg-secondary/60 hover:text-text-primary",
                  )}
                >
                  {isActive && (
                    <span aria-hidden className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gold" />
                  )}
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] transition-colors",
                      isActive ? "text-[#54100D]" : "text-text-muted group-hover:text-text-primary",
                    )}
                    strokeWidth={1.75}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

/** Page heading used across admin screens. */
export function AdminHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-7 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-gold to-cta-fill" />
        <h1 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
