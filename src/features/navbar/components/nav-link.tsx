"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
  /** Force the active styling regardless of pathname match. */
  forceActive?: boolean;
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({
  href,
  children,
  className,
  onNavigate,
  forceActive,
}: NavLinkProps) {
  const pathname = usePathname();
  const active = forceActive || isActive(pathname, href);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center py-2 text-[13.5px] font-medium tracking-[0.04em] transition-colors duration-300 ease-out",
        active ? "text-gold" : "text-text-primary hover:text-gold",
        // gold underline — grows from center on hover, stays full when active
        "after:absolute after:-bottom-0.5 after:left-1/2 after:h-px after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-transparent after:via-gold after:to-transparent after:transition-[width,opacity] after:duration-400 after:ease-out",
        active
          ? "after:w-8 after:opacity-100"
          : "after:w-0 after:opacity-0 group-hover:after:w-6 group-hover:after:opacity-80",
        className,
      )}
    >
      {children}
    </Link>
  );
}
