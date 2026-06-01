"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, type Transition } from "motion/react";
import { ChevronDown, ChevronRight, Heart, User } from "lucide-react";
import { siteConfig, type NavItem } from "@/config/site";
import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { cn } from "@/lib/utils";

interface MobileMenuPanelProps {
  onClose: () => void;
}

const ease: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * Mobile/tablet menu that drops down from under the navbar pill.
 *
 * Perf: the panel animates ONLY transform + opacity (both GPU-composited) — no
 * `height: auto` animation, no nested transforms, no backdrop-blur on the
 * panel — so open/close stays smooth on mid-range phones. Sub-menus expand via
 * the CSS grid-rows trick (`1fr ↔ 0fr`), which is also cheap and needs no JS
 * measuring.
 */
export function MobileMenuPanel({ onClose }: MobileMenuPanelProps) {
  const { requireAuth } = useAuthActions();

  // Lock background scroll while the panel is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Dismiss on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop — fade only (no blur) so it composites cheaply. Tap to close. */}
      <motion.button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease }}
        className="fixed inset-0 -z-[1] cursor-default bg-text-primary/25 md:hidden"
      />

      {/* Panel — slides/fades in via transform + opacity only. Absolute so it
          overlays the page instead of pushing content down. */}
      <motion.div
        key="mobile-menu-panel"
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease }}
        style={{ willChange: "transform, opacity" }}
        className="absolute inset-x-0 top-full z-10 px-3 sm:px-4 md:hidden"
      >
        <div className="mx-auto mt-2 max-h-[calc(100dvh-5.5rem)] max-w-7xl overflow-y-auto overscroll-contain rounded-[28px] border border-border-default/40 bg-bg-card shadow-[0_24px_60px_-16px_rgba(122,75,21,0.28),0_4px_16px_-4px_rgba(122,75,21,0.12)]">
          <nav aria-label="Mobile primary" className="px-2 pt-3 pb-2">
            <ul className="flex flex-col gap-0.5">
              {siteConfig.nav.map((item) =>
                item.children?.length ? (
                  <ExpandableItem key={item.href} item={item} onNavigate={onClose} />
                ) : (
                  <SimpleItem key={item.href} item={item} onNavigate={onClose} />
                ),
              )}
            </ul>
          </nav>

          {/* Footer — ornament + Account / Wishlist pills */}
          <div className="border-t border-border-light/60 px-4 pb-4 pt-3">
            <div className="mb-3 flex justify-center">
              <OrnamentalDivider align="center" className="w-24" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  requireAuth("/account");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border-default/60 bg-bg-secondary/60 px-4 py-2 text-[12.5px] font-medium tracking-wide text-text-primary transition-colors duration-300 hover:border-gold/40 hover:bg-bg-secondary hover:text-gold"
              >
                <User className="h-4 w-4" strokeWidth={1.6} />
                Account
              </button>
              <Link
                href="/wishlist"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-border-default/60 bg-bg-secondary/60 px-4 py-2 text-[12.5px] font-medium tracking-wide text-text-primary transition-colors duration-300 hover:border-gold/40 hover:bg-bg-secondary hover:text-gold"
              >
                <Heart className="h-4 w-4" strokeWidth={1.6} />
                Wishlist
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function isActiveItem(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SimpleItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = isActiveItem(pathname, item);
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium tracking-[0.01em] transition-colors duration-200",
          active ? "text-gold" : "text-text-primary hover:bg-bg-secondary hover:text-gold",
        )}
      >
        <span className="inline-flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-gold transition-opacity duration-200",
              active ? "opacity-100" : "opacity-0",
            )}
          />
          {item.label}
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-colors duration-200",
            active ? "text-gold" : "text-text-muted/70 group-hover:text-gold",
          )}
          strokeWidth={1.6}
        />
      </Link>
    </li>
  );
}

function matchesPath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isBranchActive(pathname: string | null, item: NavItem): boolean {
  if (matchesPath(pathname, item.href)) return true;
  return Boolean(item.children?.some((c) => isBranchActive(pathname, c)));
}

/**
 * Parent item with children. Tapping the row only TOGGLES the sub-list — it does
 * NOT navigate (so "Collection" reveals its categories instead of opening a
 * collection page). The category links inside do the navigating. No redundant
 * "All …" row. Sub-list reveal uses the CSS grid-rows trick.
 */
function ExpandableItem({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const active = matchesPath(pathname, item.href) || isBranchActive(pathname, item);
  const [expanded, setExpanded] = useState(active);

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium tracking-[0.01em] transition-colors duration-200",
          active ? "text-gold" : "text-text-primary hover:bg-bg-secondary hover:text-gold",
        )}
      >
        <span className="inline-flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-gold transition-opacity duration-200",
              active ? "opacity-100" : "opacity-0",
            )}
          />
          {item.label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-300 ease-out",
            expanded && "rotate-180",
            active ? "text-gold" : "text-text-muted/70 group-hover:text-gold",
          )}
          strokeWidth={1.6}
        />
      </button>

      {/* CSS-only collapse: 1fr ↔ 0fr. Cheap, no JS measuring, no layout thrash. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="pb-1 pl-2 pt-1">
            {item.children?.map((child) =>
              child.children?.length ? (
                <MobileGroupBlock key={child.href} group={child} onNavigate={onNavigate} />
              ) : (
                <MobileLeaf key={child.href} item={child} onNavigate={onNavigate} />
              ),
            )}
          </ul>
        </div>
      </div>
    </li>
  );
}

function MobileLeaf({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const isActive = matchesPath(pathname, item.href);
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex items-center justify-between rounded-2xl py-2.5 pl-7 pr-4 text-[13.5px] tracking-[0.01em] transition-colors duration-200",
          isActive ? "text-gold" : "text-text-secondary hover:bg-bg-secondary hover:text-gold",
        )}
      >
        <span className="inline-flex items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              "h-1 w-1 rounded-full bg-gold transition-opacity duration-200",
              isActive ? "opacity-100" : "opacity-0",
            )}
          />
          {item.label}
        </span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            isActive ? "text-gold" : "text-text-muted/60 group-hover:text-gold",
          )}
          strokeWidth={1.6}
        />
      </Link>
    </li>
  );
}

function MobileGroupBlock({ group, onNavigate }: { group: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const headerActive = matchesPath(pathname, group.href);
  return (
    <li className="mt-1">
      <Link
        href={group.href}
        onClick={onNavigate}
        className={cn(
          "block rounded-lg py-1.5 pl-7 pr-4 font-display text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200",
          headerActive ? "text-gold" : "text-text-muted hover:text-gold",
        )}
      >
        {group.label}
      </Link>
      <ul>
        {group.children?.map((leaf) => (
          <MobileLeaf key={leaf.href} item={leaf} onNavigate={onNavigate} />
        ))}
      </ul>
    </li>
  );
}
