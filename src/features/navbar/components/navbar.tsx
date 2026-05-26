"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Heart, Menu, Search, User, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CartButton } from "./cart-button";
import { MobileMenuPanel } from "./mobile-menu-panel";
import { NavDropdown } from "./nav-dropdown";
import { NavLink } from "./nav-link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const desktopIconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-white hover:text-black hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 8) {
        setVisible(true);
      } else if (delta > 6) {
        setVisible(false);
      } else if (delta < -4) {
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="relative">
        {/* ── Desktop Layer 1: Search | Logo | Actions ── */}
        <div className="hidden md:flex items-center bg-[#54100D] px-8 lg:px-12 xl:px-16 py-3">
          {/* Left: search bar */}
          <div className="flex-1">
            <label className="flex w-72 lg:w-96 items-center gap-3 rounded-full border-2 border-white/70 bg-white/10 px-5 py-2.5 cursor-text">
              <Search className="h-[17px] w-[17px] shrink-0 text-white" strokeWidth={1.8} />
              <input
                type="search"
                placeholder="Search sarees…"
                className="w-full bg-transparent text-[15px] text-white placeholder:text-white/60 outline-none font-display italic"
              />
            </label>
          </div>

          {/* Center: logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" aria-label={siteConfig.fullName} className="inline-block">
              <Image
                src="/images/hero/hero-logo/oorvashee-logo2.jpg"
                alt={siteConfig.fullName}
                width={240}
                height={80}
                priority
                className="h-20 w-auto object-contain select-none"
              />
            </Link>
          </div>

          {/* Right: account, wishlist, cart */}
          <div className="flex-1 flex justify-end items-center gap-1">
            <TooltipProvider delay={300}>
              <Tooltip>
                <TooltipTrigger render={<Link href="/account" aria-label="Account" className={desktopIconBtn} />}>
                  <User className="h-[24px] w-[24px]" strokeWidth={1.5} />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Account</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={<Link href="/wishlist" aria-label="Wishlist" className={desktopIconBtn} />}>
                  <Heart className="h-[24px] w-[24px]" strokeWidth={1.5} />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Wishlist</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={<div className="inline-flex" />}>
                  <CartButton variant="light" />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>Cart</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* ── Desktop Layer 2: Nav links ── */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center justify-center gap-8 lg:gap-10 xl:gap-14 px-8 py-2.5"
        >
          {siteConfig.nav.map((item) =>
            item.children?.length ? (
              <NavDropdown
                key={item.href}
                item={item}
                triggerClassName="text-[12px] uppercase tracking-[0.1em]"
              />
            ) : (
              <NavLink
                key={item.href}
                href={item.href}
                className="text-[12px] uppercase tracking-[0.1em]"
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        {/* ── Mobile header ── */}
        <div className="md:hidden flex items-center justify-between bg-[#54100D] px-4 py-2">
          <Link href="/" aria-label={siteConfig.fullName} className="inline-block">
            <Image
              src="/images/hero/hero-logo/oorvashee-logo2.jpg"
              alt={siteConfig.fullName}
              width={160}
              height={44}
              priority
              className="h-11 w-auto object-contain select-none"
            />
          </Link>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-white hover:text-black hover:scale-110 focus-visible:outline-none"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
            <CartButton variant="light" />
            <button
              type="button"
              aria-controls="mobile-menu-panel"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-white hover:text-black hover:scale-110 focus-visible:outline-none",
                mobileOpen && "bg-white text-black",
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

        {/* Mobile dropdown panel */}
        <AnimatePresence initial={false}>
          {mobileOpen ? (
            <MobileMenuPanel onClose={() => setMobileOpen(false)} />
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
