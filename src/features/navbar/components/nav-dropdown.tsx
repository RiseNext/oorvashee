"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

interface NavDropdownProps {
  item: NavItem;
}

function matchesHref(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isBranchActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (matchesHref(pathname, item.href)) return true;
  return Boolean(item.children?.some((c) => isBranchActive(pathname, c)));
}

export function NavDropdown({ item }: NavDropdownProps) {
  const pathname = usePathname();
  const active = isBranchActive(pathname, item);
  const children = item.children ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group/saris relative inline-flex items-center gap-1.5 py-2 text-[13.5px] font-medium tracking-[0.04em] outline-none transition-colors duration-300 ease-out focus-visible:text-gold",
          active ? "text-gold" : "text-text-primary hover:text-gold",
          "after:absolute after:-bottom-0.5 after:left-1/2 after:h-px after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-transparent after:via-gold after:to-transparent after:transition-[width,opacity] after:duration-400 after:ease-out",
          active
            ? "after:w-8 after:opacity-100"
            : "after:w-0 after:opacity-0 hover:after:w-6 hover:after:opacity-80 data-[popup-open]:after:w-6 data-[popup-open]:after:opacity-80",
        )}
      >
        {item.label}
        <ChevronDown
          className="h-3 w-3 transition-transform duration-300 ease-out group-data-[popup-open]/saris:rotate-180"
          strokeWidth={1.8}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={18}
        className="min-w-[260px] rounded-2xl border border-border-default/50 bg-bg-card/95 p-2 text-text-primary shadow-[0_20px_50px_-12px_rgba(122,75,21,0.25),0_4px_12px_-4px_rgba(122,75,21,0.1)] ring-0 backdrop-blur-md"
      >
        {children.map((child, idx) =>
          child.children?.length ? (
            <DropdownGroup
              key={child.href}
              group={child}
              isFirst={idx === 0}
            />
          ) : (
            <DropdownMenuItem
              key={child.href}
              render={
                <Link
                  href={child.href}
                  className="block w-full rounded-xl px-4 py-2.5 text-[13.5px] font-medium tracking-[0.02em] text-text-primary transition-colors duration-200 hover:bg-bg-secondary hover:text-gold focus:bg-bg-secondary focus:text-gold"
                />
              }
            >
              {child.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownGroup({
  group,
  isFirst,
}: {
  group: NavItem;
  isFirst: boolean;
}) {
  const items = group.children ?? [];
  return (
    <div className={cn(!isFirst && "mt-1.5 border-t border-border-light/50 pt-1.5")}>
      <Link
        href={group.href}
        className="block rounded-lg px-4 pb-1 pt-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted transition-colors duration-200 hover:text-gold focus:text-gold focus:outline-none"
      >
        {group.label}
      </Link>
      {items.map((leaf) => (
        <DropdownMenuItem
          key={leaf.href}
          render={
            <Link
              href={leaf.href}
              className="block w-full rounded-xl px-4 py-2.5 text-[13.5px] font-medium tracking-[0.02em] text-text-primary transition-colors duration-200 hover:bg-bg-secondary hover:text-gold focus:bg-bg-secondary focus:text-gold"
            />
          }
        >
          {leaf.label}
        </DropdownMenuItem>
      ))}
    </div>
  );
}
