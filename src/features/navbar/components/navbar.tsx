"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Menu, Search, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { OorvasheeLogo } from "@/components/shared/oorvashee-logo";
import { cn } from "@/lib/utils";
import { CartButton } from "./cart-button";
import { MobileMenuPanel } from "./mobile-menu-panel";
import { NavbarActions } from "./navbar-actions";
import { NavDropdown } from "./nav-dropdown";
import { NavLink } from "./nav-link";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close the panel whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="relative px-3 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pt-5 lg:px-8 xl:px-10 2xl:px-14">
        <div className="relative mx-auto flex max-w-7xl xl:max-w-screen-2xl items-center justify-between gap-3 rounded-full border border-border-default/40 bg-bg-secondary/70 px-2 py-2 shadow-[0_10px_40px_-12px_rgba(122,75,21,0.18),0_2px_6px_-2px_rgba(122,75,21,0.08)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-bg-secondary/55 md:gap-6 md:px-5 md:py-2.5 lg:px-7 xl:px-9 2xl:px-12">
          {/* Left: logo (always visible) */}
          <div className="flex shrink-0 items-center pl-1 md:pl-0">
            <OorvasheeLogo size={56} className="md:hidden" href="/" />
            <OorvasheeLogo
              size={88}
              className="hidden md:inline-flex"
              href="/"
            />
          </div>

          {/* Center: desktop nav */}
          <nav
            aria-label="Primary"
            className="hidden flex-1 items-center justify-center md:flex md:gap-8 lg:gap-12"
          >
            {siteConfig.nav.map((item) =>
              item.children?.length ? (
                <NavDropdown key={item.href} item={item} />
              ) : (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ),
            )}
          </nav>

          {/* Right: desktop actions */}
          <div className="hidden shrink-0 pr-1 md:flex">
            <NavbarActions />
          </div>

          {/* Right: mobile compact (search + cart + hamburger) */}
          <div className="flex shrink-0 items-center gap-0.5 pr-0.5 md:hidden">
            <button
              type="button"
              aria-label="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-primary transition-colors duration-300 hover:bg-bg-primary/60 hover:text-gold"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
            <CartButton />
            <button
              type="button"
              aria-controls="mobile-menu-panel"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full text-text-primary transition-colors duration-300 hover:bg-bg-primary/60 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30",
                mobileOpen && "bg-bg-primary/60 text-gold",
              )}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.7} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.7} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown panel — slides open below the pill */}
        <AnimatePresence initial={false}>
          {mobileOpen ? (
            <MobileMenuPanel onClose={() => setMobileOpen(false)} />
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
