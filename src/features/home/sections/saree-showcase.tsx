"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { SectionLabel } from "@/components/shared/section-label";
import { fadeUp, stagger } from "@/animations/fade";
import { cn } from "@/lib/utils";

import { BottomSareeLoop } from "../components/bottom-saree-loop";
import { FoldedTopSarees } from "../components/folded-top-sarees";

const TABLE_BG_SRC = "/images/saree-table/table/image.png";

/**
 * Single-render responsive layout inside the table stage:
 *
 *  mobile (<sm)
 *  ┌──────────────────────────────────┐  aspect-[3/4]
 *  │  Oorvashee                       │  ← text panel at top
 *  │  The Saree Table                 │
 *  │  Experience the joy…             │
 *  │  [Start Exploring →]             │
 *  │  ─ ─ ─  wood ─ ─ ─              │
 *  │   [fold] [fold] [fold]           │  ← top sarees
 *  │   ‹ ─────[saree]────── ›         │  ← bottom saree
 *  └──────────────────────────────────┘
 *
 *  sm+  (≥ 640 px)
 *  ┌───────────────┬──────────────────┐  aspect-[3/2] md:[16/10] lg:[16/9]
 *  │  Oorvashee    │  [f] [f] [f]     │
 *  │  The Saree    │  ‹ ──[saree]── › │
 *  │  Table        │                  │
 *  │  [Explore →]  │                  │
 *  └───────────────┴──────────────────┘
 */
export function SareeShowcaseSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="saree-showcase-heading"
      className="relative isolate overflow-hidden bg-bg-primary py-14 sm:py-16 md:py-20 lg:py-24"
    >
      <div className="relative z-[1] mx-auto max-w-7xl px-5 sm:px-8 md:px-10 lg:px-16">
        {/* External heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger(0.05, 0.1)}
          className="flex flex-col items-center text-center"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel as="p">On the Table</SectionLabel>
          </motion.div>
          <motion.h2
            id="saree-showcase-heading"
            variants={fadeUp}
            className="mt-3 font-display font-normal text-text-primary leading-[1.05] text-[clamp(2rem,5vw,3.25rem)]"
          >
            A Closer Look
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-4 w-28 sm:w-32 lg:w-36">
            <OrnamentalDivider align="center" />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-md font-body text-sm font-light text-text-secondary sm:text-base"
          >
            Folded, draped and laid out by hand — hover a fold to follow its
            silk down the table.
          </motion.p>
        </motion.div>

        {/* ── Table stage ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative mt-10 w-full overflow-hidden rounded-xl sm:mt-12 lg:mt-14",
            "shadow-[0_30px_60px_-30px_rgba(42,19,8,0.6)] ring-1 ring-black/10",
            // portrait on mobile so text + sarees stack comfortably
            "aspect-[3/4] sm:aspect-[3/2] md:aspect-[16/10] lg:aspect-[16/9]",
          )}
        >
          {/* Wooden table — untouched */}
          <Image
            src={TABLE_BG_SRC}
            alt=""
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            // portrait crop focuses on the upper-centre wood area;
            // landscape crops centre the whole table naturally
            className="object-cover object-[30%_20%] sm:object-[40%_30%] md:object-center"
          />

          {/* ── Single content overlay ──
              mobile  → flex-col, text top / sarees bottom
              sm+     → 2-col grid, text left / sarees right            */}
          <div
            className={cn(
              "absolute inset-0 z-10",
              // mobile
              "flex flex-col justify-between px-[5%] py-[5%]",
              // sm+: two-column grid
              "sm:grid sm:grid-cols-[36%_1fr] sm:items-center sm:py-0 sm:px-[5%]",
              "md:grid-cols-[38%_1fr]",
            )}
          >
            {/* ── Text panel ── */}
            <div
              className={cn(
                "flex flex-col items-start",
                // mobile: tighter gaps so it fits the portrait table
                "gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4",
                // sm+: vertically centre and add a slight top-weight
                "sm:self-center sm:pr-4",
              )}
            >
              {/* Oorvashee — slightly bigger, no flanks */}
              <p className="font-body text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.28em] text-gold">
                Oorvashee
              </p>

              {/* The Saree Table — bigger now that the paragraph is gone */}
              <h3
                className={cn(
                  "font-display font-normal leading-[1.05] text-text-on-dark",
                  "text-[1.9rem] sm:text-[2rem] md:text-[2.25rem] lg:text-[2.75rem]",
                )}
              >
                The<br />Saree Table
              </h3>

              {/* Gold divider */}
              <div className="w-16 sm:w-20 md:w-24 lg:w-28">
                <OrnamentalDivider color="var(--gold)" />
              </div>

              {/* Start Exploring button — hero-style border-to-fill hover */}
              <Link
                href="/collections"
                className={cn(
                  "group mt-1 inline-flex items-center gap-2 rounded-md border-[1.5px]",
                  "border-gold/70 bg-bg-primary/15 backdrop-blur-sm",
                  "px-5 py-3 font-medium uppercase tracking-[0.2em] text-gold",
                  "text-[10px] sm:text-[11px] lg:text-[12px] lg:tracking-[0.22em]",
                  "transition-colors duration-300",
                  "hover:bg-gold hover:text-bg-dark hover:border-gold",
                  "focus-visible:bg-gold focus-visible:text-bg-dark",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30",
                  "lg:px-7 lg:py-3.5",
                )}
              >
                Start Exploring
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </Link>
            </div>

            {/* ── Sarees column ──
                mobile  → stacks at the bottom of the flex-col
                sm+     → occupies the right grid column, pushed slightly
                          downward so the top row doesn't float at dead-centre */}
            <div
              className={cn(
                "flex flex-col items-center",
                // mobile: small gap between rows
                "gap-2.5",
                // sm+: bigger gap + gentle downward nudge
                "sm:gap-4 sm:pt-[8%]",
                "md:gap-5 md:pt-[6%]",
                "lg:gap-6 lg:pt-[4%]",
              )}
            >
              <FoldedTopSarees
                hoveredId={hoveredId}
                onHoverChange={setHoveredId}
              />
              <BottomSareeLoop
                hoveredId={hoveredId}
                onHoverChange={setHoveredId}
              />
            </div>
          </div>

          {/* Radial vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.28)_100%)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
