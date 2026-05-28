"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/features/navbar";
import { ProductCard, type Product } from "@/components/shared/product-card";
import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "relevant", label: "Most relevant" },
  { value: "best-selling", label: "Best selling" },
  { value: "alpha-asc", label: "Alphabetically, A-Z" },
  { value: "alpha-desc", label: "Alphabetically, Z-A" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "date-asc", label: "Date, old to new" },
  { value: "date-desc", label: "Date, new to old" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const PER_PAGE = 20;

export interface SareeListingPageProps {
  title: string;
  subtitle?: string;
  products: Product[];
  /** Empty-state copy override (e.g. for search "no results"). */
  emptyTitle?: string;
  emptyBody?: string;
}

export function SareeListingPage({
  title,
  subtitle,
  products,
  emptyTitle = "This collection is being curated.",
  emptyBody = "New handwoven pieces are arriving soon. Explore the rest of our sarees in the meantime.",
}: SareeListingPageProps) {
  const [sort, setSort] = useState<SortValue>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const sortRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function onOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [sortOpen]);

  const sorted = useMemo(() => {
    const arr = [...products];
    switch (sort) {
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "alpha-asc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "alpha-desc":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return arr;
    }
  }, [products, sort]);

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const pageProducts = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const goToPage = useCallback(
    (n: number) => {
      setPage(n);
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );


  const pageNumbers = useMemo((): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [totalPages, page]);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        {/* ── Grand heading ── */}
        <div className="bg-bg-secondary py-10 sm:py-14 lg:py-16 text-center px-4">
          <OrnamentalDivider align="center" className="mx-auto max-w-[180px] mb-5" />
          <h1
            className="font-display font-semibold uppercase"
            style={{
              color: "var(--gold)",
              fontSize: "clamp(2.25rem, 6vw, 5rem)",
              letterSpacing: "0.14em",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 font-display italic text-sm sm:text-base text-text-muted">
              {subtitle}
            </p>
          )}
          <OrnamentalDivider align="center" className="mx-auto max-w-[180px] mt-5" />
        </div>

        {/* ── Products area ── */}
        <div
          ref={gridRef}
          className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pb-16 pt-6 scroll-mt-4"
        >
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center sm:py-28">
              <p className="font-display italic text-lg text-text-muted sm:text-xl">
                {emptyTitle}
              </p>
              <p className="mt-2 max-w-md font-body text-sm text-text-secondary">
                {emptyBody}
              </p>
              <Link
                href="/saris"
                className={cn(
                  "mt-7 inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
                  "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
                  "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
                )}
              >
                Browse All Sarees
              </Link>
            </div>
          ) : (
            <>
          {/* Sort bar */}
          <div className="mb-6 sm:mb-8 flex items-center justify-between">
            <div className="relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => setSortOpen((v) => !v)}
                aria-expanded={sortOpen}
                aria-haspopup="listbox"
                className={cn(
                  "flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors",
                  "border-border-default text-text-primary hover:border-border-focus hover:bg-bg-secondary",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
                )}
              >
                <span className="font-semibold">Sort By</span>
                {sortOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-text-muted" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                )}
              </button>

              {sortOpen && (
                <div
                  role="listbox"
                  aria-label="Sort options"
                  className="absolute left-0 top-full z-30 mt-1.5 min-w-[220px] rounded-lg border border-border-light bg-white py-2 shadow-[0_8px_24px_-4px_rgba(61,26,8,0.18)]"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      role="option"
                      aria-selected={sort === option.value}
                      type="button"
                      onClick={() => {
                        setSort(option.value);
                        setSortOpen(false);
                        setPage(1);
                      }}
                      className={cn(
                        "w-full px-5 py-2.5 text-left text-sm transition-colors hover:bg-bg-secondary",
                        sort === option.value
                          ? "font-semibold text-text-primary"
                          : "font-normal text-text-secondary",
                      )}
                    >
                      {sort === option.value ? (
                        <span>{option.label}</span>
                      ) : (
                        option.label
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs text-text-muted">{sorted.length} products</span>
          </div>

          {/* ── Product grid ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
            {pageProducts.map((product) => (
              <ProductCard key={product.id} product={product} animated={false} />
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5 sm:mt-12 sm:gap-2">
              <PageBtn
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </PageBtn>

              {pageNumbers.map((n, i) =>
                n === "…" ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="select-none px-2 text-sm text-text-muted"
                  >
                    …
                  </span>
                ) : (
                  <PageBtn
                    key={n}
                    onClick={() => goToPage(n as number)}
                    active={n === page}
                    aria-label={`Page ${n}`}
                    aria-current={n === page ? "page" : undefined}
                  >
                    {n}
                  </PageBtn>
                ),
              )}

              <PageBtn
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </PageBtn>
            </div>
          )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

interface PageBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
}

function PageBtn({ active, children, disabled, className, ...props }: PageBtnProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
        active
          ? "border-transparent text-white shadow-sm"
          : "border-border-default bg-white text-text-secondary hover:border-border-focus hover:text-text-primary",
        disabled && "pointer-events-none opacity-40",
        className,
      )}
      style={active ? { backgroundColor: "var(--gold)", borderColor: "var(--gold)" } : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
