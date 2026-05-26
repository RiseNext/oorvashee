import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, type Product } from "@/components/shared/product-card";
import { cn } from "@/lib/utils";

interface ProductsSectionProps {
  heading: string;
  products: Product[];
  viewAllHref?: string;
  /** "dark-bar" = filled dark heading bar; "serif" = large display font */
  headingStyle?: "dark-bar" | "serif" | "normal";
  /** "scroll" = mobile-friendly horizontal scroll; "grid" = 4-col fixed grid */
  layout?: "scroll" | "grid";
}

export function ProductsSection({
  heading,
  products,
  viewAllHref,
  headingStyle = "normal",
  layout = "grid",
}: ProductsSectionProps) {
  return (
    <section className="py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        {headingStyle === "dark-bar" ? (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-text-primary px-5 py-3">
            <h2 className="font-body text-sm font-bold uppercase tracking-[0.18em] text-white">
              {heading}
            </h2>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="flex items-center gap-1 font-body text-xs font-medium text-white/70 transition-colors hover:text-white"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ) : headingStyle === "serif" ? (
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-medium text-text-primary sm:text-4xl">
              {heading}
            </h2>
            <div className="mx-auto mt-3 h-px max-w-[120px] bg-gradient-to-r from-transparent via-border-default to-transparent" />
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-body text-sm font-bold uppercase tracking-[0.18em] text-text-primary">
              {heading}
            </h2>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="flex items-center gap-1 font-body text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
              >
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        )}

        {/* Products */}
        {layout === "scroll" ? (
          <div
            className={cn(
              "scrollbar-hide flex gap-3 overflow-x-auto pb-2 sm:gap-4",
              "lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 xl:grid-cols-5",
            )}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="shrink-0 basis-[65%] sm:basis-[40%] md:basis-[28%] lg:basis-auto"
              >
                <ProductCard product={product} animated={false} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} animated={false} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
