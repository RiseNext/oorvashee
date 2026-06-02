"use client";

import { AnimatePresence } from "motion/react";
import { MobileMenuPanel } from "./mobile-menu-panel";
import { MobileSearchPanel } from "./mobile-search-panel";

interface MobileOverlaysProps {
  mobileOpen: boolean;
  searchOpen: boolean;
  onCloseMenu: () => void;
  onCloseSearch: () => void;
}

/**
 * Mobile menu + search overlays, split out of the Navbar so all of the navbar's
 * Framer Motion (AnimatePresence + the panels' slide/fade) is code-split into a
 * chunk that loads on first open — instead of shipping in the navbar's initial
 * bundle on every route. The Navbar dynamic-imports this (ssr:false) and keeps
 * it mounted once opened, so AnimatePresence can still play exit animations on
 * close. Behavior and design are unchanged.
 */
export function MobileOverlays({
  mobileOpen,
  searchOpen,
  onCloseMenu,
  onCloseSearch,
}: MobileOverlaysProps) {
  return (
    <>
      <AnimatePresence initial={false}>
        {mobileOpen ? <MobileMenuPanel onClose={onCloseMenu} /> : null}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {searchOpen ? <MobileSearchPanel onClose={onCloseSearch} /> : null}
      </AnimatePresence>
    </>
  );
}
