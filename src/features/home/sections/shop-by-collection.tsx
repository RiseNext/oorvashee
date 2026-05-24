"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { ProductCard } from "@/components/shared/product-card";
import { fadeUp, stagger } from "@/animations/fade";
import { cn } from "@/lib/utils";

import { SAREE_COLLECTIONS } from "../data/collections";

export function ShopByCollection() {
  const [activeId, setActiveId] = useState<string>(SAREE_COLLECTIONS[0].id);
  const active =
    SAREE_COLLECTIONS.find((c) => c.id === activeId) ?? SAREE_COLLECTIONS[0];

  return (
    <section
      aria-labelledby="collection-heading"
      className="relative isolate overflow-hidden bg-bg-primary py-14 sm:py-16 md:py-20 lg:py-24"
    >
      <CollectionBackdrop />

      <div className="relative z-[1] mx-auto max-w-7xl px-5 sm:px-8 md:px-10 lg:px-16">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger(0.05, 0.1)}
          className="flex flex-col items-center text-center"
        >
          <motion.h2
            id="collection-heading"
            variants={fadeUp}
            className="font-display font-normal text-text-primary leading-none text-[clamp(2.5rem,7vw,4.75rem)]"
          >
            Collection
          </motion.h2>

          <motion.div variants={fadeUp} className="mt-4 w-32 sm:w-40 lg:w-48">
            <OrnamentalDivider align="center" />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-md font-body text-sm font-light text-text-secondary sm:text-base"
          >
            Choose a weave — every category, handpicked for you.
          </motion.p>
        </motion.div>

        {/* Category tabs */}
        <div className="relative mt-8 sm:mt-10 lg:mt-12">
          <div
            role="tablist"
            aria-label="Saree collections"
            className={cn(
              "scrollbar-hide flex gap-2 overflow-x-auto",
              "snap-x snap-mandatory",
              "border-b border-border-light",
              "sm:justify-center sm:gap-1 sm:snap-none",
            )}
          >
            {SAREE_COLLECTIONS.map((category) => {
              const isActive = category.id === activeId;
              return (
                <button
                  key={category.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  aria-controls={`panel-${category.id}`}
                  id={`tab-${category.id}`}
                  onClick={() => setActiveId(category.id)}
                  className={cn(
                    "relative shrink-0 snap-start whitespace-nowrap px-4 py-3 sm:px-5 sm:py-3.5",
                    "font-body text-sm font-medium tracking-wide transition-colors duration-300 sm:text-[15px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40 focus-visible:rounded-sm",
                    isActive
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-primary",
                  )}
                >
                  {category.label}
                  {isActive ? (
                    <motion.span
                      layoutId="collection-tab-underline"
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-0.5 bg-cta-fill sm:inset-x-4"
                      transition={{
                        type: "spring",
                        stiffness: 360,
                        damping: 32,
                      }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product showcase */}
        <div className="mt-8 sm:mt-10 lg:mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              role="tabpanel"
              id={`panel-${active.id}`}
              aria-labelledby={`tab-${active.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.ul
                role="list"
                initial="hidden"
                animate="visible"
                variants={stagger(0.05, 0.08)}
                className={cn(
                  "scrollbar-hide flex gap-4 overflow-x-auto pb-2",
                  "snap-x snap-mandatory",
                  "lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:pb-0",
                )}
              >
                {active.products.map((product) => (
                  <li
                    key={product.id}
                    className={cn(
                      "snap-start shrink-0",
                      "basis-[72%] sm:basis-[44%] md:basis-[32%]",
                      "lg:basis-auto lg:shrink",
                    )}
                  >
                    <ProductCard product={product} />
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Shop more CTA */}
        <div className="mt-10 flex justify-center sm:mt-12 lg:mt-14">
          <Link
            href={active.href}
            className={cn(
              "group/cta inline-flex items-center gap-2 rounded-md px-7 py-3",
              "bg-cta-fill text-white shadow-[0_8px_22px_-12px_rgba(122,75,21,0.55)]",
              "font-body text-xs font-medium uppercase tracking-[0.22em]",
              "transition-all duration-300 ease-out",
              "hover:bg-cta-fill-hover hover:shadow-[0_12px_26px_-12px_rgba(122,75,21,0.65)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40",
              "sm:gap-3 sm:px-8 sm:py-3.5 sm:text-[13px]",
            )}
          >
            Shop more
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1 sm:h-4 sm:w-4"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Layered, decorative background for the Collection section.
 * - Soft warm radial gradient + golden bloom blurs
 * - Faint paisley motifs anchored in the corners
 * - Hairline dividers at top and bottom for editorial framing
 */
function CollectionBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1]">
      {/* Soft cream-to-warm wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--bg-secondary)_0%,transparent_55%),radial-gradient(ellipse_at_bottom,var(--bg-secondary)_0%,transparent_55%)]" />

      {/* Golden bloom blurs — three subtle glows, asymmetrical */}
      <div className="absolute -top-24 left-[8%] h-72 w-72 rounded-full bg-gold/10 blur-[120px] sm:h-96 sm:w-96" />
      <div className="absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-cta-fill/[0.06] blur-[110px] sm:h-80 sm:w-80" />
      <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-gold-light/[0.08] blur-[100px] sm:h-72 sm:w-72" />

      {/* Corner paisley motifs */}
      <PaisleyMotif className="absolute -left-4 top-10 h-32 w-32 text-gold/[0.07] sm:h-40 sm:w-40 sm:left-4" />
      <PaisleyMotif className="absolute -right-4 bottom-12 h-32 w-32 rotate-180 text-gold/[0.07] sm:h-40 sm:w-40 sm:right-4" />

      {/* Hairline gold dividers, top and bottom */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}

function PaisleyMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M30 95c-15-8-18-30-6-46s32-22 48-12 18 28 6 44-32 22-48 14Z" />
      <path d="M44 84c-8-4-10-16-4-26s18-12 26-6 10 16 4 26-18 12-26 6Z" />
      <circle cx="60" cy="60" r="4" />
      <path d="M60 28c2-4 4-7 7-10" />
      <path d="M60 28c-2-4-4-7-7-10" />
      <circle cx="67" cy="18" r="1.5" />
      <circle cx="53" cy="18" r="1.5" />
    </svg>
  );
}
