"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { SectionLabel } from "@/components/shared/section-label";
import { ProductCard } from "@/components/shared/product-card";
import { fadeUp, stagger } from "@/animations/fade";
import { cn } from "@/lib/utils";

import { NEW_ARRIVALS } from "../data/new-arrivals";

export function NewArrivals() {
  return (
    <section
      aria-labelledby="new-arrivals-heading"
      className="relative isolate overflow-hidden bg-bg-secondary py-14 sm:py-16 md:py-20 lg:py-24"
    >
      <NewArrivalsBackdrop />

      <div className="relative z-[1] mx-auto max-w-7xl px-5 sm:px-8 md:px-10 lg:px-16">
        {/* Heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger(0.05, 0.1)}
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel as="p">Just In</SectionLabel>
          </motion.div>

          <motion.h2
            id="new-arrivals-heading"
            variants={fadeUp}
            className="mt-3 font-display font-normal text-text-primary leading-[1.05] text-[clamp(2rem,5vw,3.25rem)]"
          >
            New Arrivals
          </motion.h2>

          <motion.div
            variants={fadeUp}
            className="mt-4 w-28 sm:w-32 lg:w-36"
          >
            <OrnamentalDivider align="center" />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-5">
            <Link
              href="/new-arrivals"
              className={cn(
                "group/link inline-flex items-center gap-2",
                "font-body text-[11px] font-medium uppercase tracking-[0.22em] text-cta-fill",
                "transition-colors duration-300 hover:text-cta-fill-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40 focus-visible:rounded-sm",
                "sm:text-xs",
              )}
            >
              View all
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1"
                strokeWidth={2}
              />
            </Link>
          </motion.div>
        </motion.div>

        {/* Product strip */}
        <motion.ul
          role="list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger(0.05, 0.1)}
          className={cn(
            "scrollbar-hide mt-8 flex gap-4 overflow-x-auto pb-2",
            "snap-x snap-mandatory",
            "sm:mt-10 lg:mt-12",
            "lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:pb-0",
          )}
        >
          {NEW_ARRIVALS.map((product) => (
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
      </div>
    </section>
  );
}

/**
 * Sister backdrop to the Collection section.
 * Same vocabulary (paisley + bloom + hairlines) but mirrored placement
 * so the two sections feel distinct, not duplicated.
 */
function NewArrivalsBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1]">
      {/* Warm cream wash with subtle vertical falloff */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--bg-primary)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,var(--bg-primary)_0%,transparent_60%)]" />

      {/* Golden bloom blurs — mirrored from Collection so the rhythm alternates */}
      <div className="absolute -top-20 right-[10%] h-72 w-72 rounded-full bg-gold/[0.09] blur-[120px] sm:h-96 sm:w-96" />
      <div className="absolute top-2/3 -left-20 h-64 w-64 rounded-full bg-cta-fill/[0.06] blur-[110px] sm:h-80 sm:w-80" />

      {/* Corner accents — different from Collection, vertical bars + lotus */}
      <LotusBloom className="absolute right-6 top-12 h-28 w-28 text-gold/[0.08] sm:h-36 sm:w-36" />
      <LotusBloom className="absolute left-6 bottom-12 h-28 w-28 -scale-x-100 text-gold/[0.08] sm:h-36 sm:w-36" />

      {/* Side accent ribbons — vertical hairlines on the edges */}
      <div className="absolute inset-y-12 left-0 w-px bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
      <div className="absolute inset-y-12 right-0 w-px bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
    </div>
  );
}

function LotusBloom({ className }: { className?: string }) {
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
      <path d="M60 100c-20 0-36-12-36-30 8 4 16 4 20 0-4-12 4-22 16-22s20 10 16 22c4 4 12 4 20 0 0 18-16 30-36 30Z" />
      <path d="M60 80V40" />
      <path d="M60 40c-6 0-11 5-11 11" />
      <path d="M60 40c6 0 11 5 11 11" />
      <path d="M60 36c-3-6-3-12 0-18" />
      <path d="M60 36c3-6 3-12 0-18" />
      <circle cx="60" cy="20" r="2" />
    </svg>
  );
}
