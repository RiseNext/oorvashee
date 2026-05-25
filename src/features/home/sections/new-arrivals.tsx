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
      className="relative isolate overflow-hidden bg-bg-secondary py-14 sm:py-16 md:py-20 lg:py-24 xl:py-28 2xl:py-32"
    >
      <NewArrivalsBackdrop />

      <div className="relative z-[1] mx-auto max-w-7xl xl:max-w-screen-2xl px-5 sm:px-8 md:px-10 lg:px-12 xl:px-16 2xl:px-24">
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
            className="mt-3 font-display font-normal text-text-primary leading-[1.05] text-[clamp(2rem,5vw,4rem)]"
          >
            New Arrivals
          </motion.h2>

          <motion.div
            variants={fadeUp}
            className="mt-4 w-28 sm:w-32 lg:w-36 xl:w-44"
          >
            <OrnamentalDivider align="center" />
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
            "sm:mt-10 lg:mt-12 xl:mt-14",
            "lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:pb-0 xl:gap-7 2xl:gap-8",
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

        {/* View all CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
          className="mt-10 flex justify-center sm:mt-12 lg:mt-14 xl:mt-16"
        >
          <Link
            href="/new-arrivals"
            className={cn(
              "group inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill bg-bg-primary/30 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-cta-fill backdrop-blur-sm transition-colors duration-300",
              "hover:bg-cta-fill hover:text-white focus-visible:bg-cta-fill focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
              "sm:gap-3 sm:px-5 sm:py-3 sm:text-[11px] sm:tracking-[0.2em]",
              "lg:px-7 lg:py-3.5 lg:text-[12px] lg:tracking-[0.22em]",
            )}
          >
            View All New Arrivals
            <ArrowRight
              className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 sm:h-3.5 sm:w-3.5"
              strokeWidth={2}
            />
          </Link>
        </motion.div>
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
