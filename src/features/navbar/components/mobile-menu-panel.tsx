"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, type Transition } from "motion/react";
import { ChevronDown, ChevronRight, Heart, User } from "lucide-react";
import { siteConfig, type NavItem } from "@/config/site";
import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { cn } from "@/lib/utils";

interface MobileMenuPanelProps {
  onClose: () => void;
}

const ease: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * Mobile/tablet menu that drops down from under the navbar pill.
 * Renders inside an <AnimatePresence> in the navbar so the open/close
 * animation is symmetric and the markup stays out of the DOM when closed.
 */
export function MobileMenuPanel({ onClose }: MobileMenuPanelProps) {
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
      {/* Soft cream wash backdrop — dismisses on tap, fades smoothly */}
      <motion.button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease }}
        className="fixed inset-0 -z-[1] cursor-default bg-text-primary/10 backdrop-blur-[2px] md:hidden"
      />

      {/* Panel — slides down from beneath the pill.
          Absolute-positioned so opening the menu OVERLAYS the page instead of
          pushing content down (which used to make the page appear to scroll
          back to the hero on long pages). */}
      <motion.div
        key="mobile-menu-panel"
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          height: { duration: 0.36, ease },
          opacity: { duration: 0.24, ease },
        }}
        className="absolute inset-x-0 top-full z-10 overflow-hidden px-3 sm:px-4 md:hidden"
      >
        <motion.div
          initial={{ y: -8, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: -8, scale: 0.985 }}
          transition={{ duration: 0.3, ease }}
          style={{ transformOrigin: "top center" }}
          className="mx-auto mt-2 max-w-7xl rounded-[28px] border border-border-default/40 bg-bg-card/92 shadow-[0_24px_60px_-16px_rgba(122,75,21,0.28),0_4px_16px_-4px_rgba(122,75,21,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-bg-card/85"
        >
          <nav aria-label="Mobile primary" className="px-2 pt-3 pb-2">
            <ul className="flex flex-col gap-0.5">
              {siteConfig.nav.map((item) =>
                item.children?.length ? (
                  <ExpandableItem
                    key={item.href}
                    item={item}
                    onNavigate={onClose}
                  />
                ) : (
                  <SimpleItem
                    key={item.href}
                    item={item}
                    onNavigate={onClose}
                  />
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
              <Link
                href="/account"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-border-default/60 bg-bg-secondary/60 px-4 py-2 text-[12.5px] font-medium tracking-wide text-text-primary transition-colors duration-300 hover:border-gold/40 hover:bg-bg-secondary hover:text-gold"
              >
                <User className="h-4 w-4" strokeWidth={1.6} />
                Account
              </Link>
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
        </motion.div>
      </motion.div>
    </>
  );
}

function isActiveItem(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SimpleItem({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const active = isActiveItem(pathname, item);
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-medium tracking-[0.01em] transition-colors duration-300",
          active
            ? "text-gold"
            : "text-text-primary hover:bg-bg-secondary hover:text-gold",
        )}
      >
        <span className="inline-flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-gold transition-opacity duration-300",
              active ? "opacity-100" : "opacity-0",
            )}
          />
          {item.label}
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-colors duration-300",
            active
              ? "text-gold"
              : "text-text-muted/70 group-hover:text-gold",
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

function ExpandableItem({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const selfActive = matchesPath(pathname, item.href);
  const active = selfActive || isBranchActive(pathname, item);
  const [expanded, setExpanded] = useState(active);

  return (
    <li>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium tracking-[0.01em] transition-colors duration-300",
          active
            ? "text-gold"
            : "text-text-primary hover:bg-bg-secondary hover:text-gold",
        )}
      >
        <span className="inline-flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-gold transition-opacity duration-300",
              active ? "opacity-100" : "opacity-0",
            )}
          />
          {item.label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-all duration-300 ease-out",
            expanded && "rotate-180",
            active
              ? "text-gold"
              : "text-text-muted/70 group-hover:text-gold",
          )}
          strokeWidth={1.6}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: expanded ? "auto" : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{
          height: { duration: 0.3, ease },
          opacity: { duration: 0.2, ease },
        }}
        className="overflow-hidden"
      >
        <ul className="pb-1 pl-2 pt-1">
          <li>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center justify-between rounded-2xl py-2.5 pl-7 pr-4 text-[13.5px] tracking-[0.01em] transition-colors duration-300",
                selfActive
                  ? "text-gold"
                  : "text-text-secondary hover:bg-bg-secondary hover:text-gold",
              )}
            >
              <span>All {item.label}</span>
              <ChevronRight
                className="h-3.5 w-3.5 text-text-muted/60 transition-colors group-hover:text-gold"
                strokeWidth={1.6}
              />
            </Link>
          </li>
          {item.children?.map((child) =>
            child.children?.length ? (
              <MobileGroupBlock
                key={child.href}
                group={child}
                onNavigate={onNavigate}
              />
            ) : (
              <MobileLeaf
                key={child.href}
                item={child}
                onNavigate={onNavigate}
              />
            ),
          )}
        </ul>
      </motion.div>
    </li>
  );
}

function MobileLeaf({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const isActive = matchesPath(pathname, item.href);
  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex items-center justify-between rounded-2xl py-2.5 pl-7 pr-4 text-[13.5px] tracking-[0.01em] transition-colors duration-300",
          isActive
            ? "text-gold"
            : "text-text-secondary hover:bg-bg-secondary hover:text-gold",
        )}
      >
        <span className="inline-flex items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              "h-1 w-1 rounded-full bg-gold transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0",
            )}
          />
          {item.label}
        </span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            isActive
              ? "text-gold"
              : "text-text-muted/60 group-hover:text-gold",
          )}
          strokeWidth={1.6}
        />
      </Link>
    </li>
  );
}

function MobileGroupBlock({
  group,
  onNavigate,
}: {
  group: NavItem;
  onNavigate: () => void;
}) {
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
