"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { fadeUp, stagger } from "@/animations/fade";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const BACKGROUND_SRC = "/images/hero/background-img/image1.png";

export function Hero() {
  return (
    <section
      aria-label="Oorvashee — Timeless Sarees"
      className="relative isolate flex flex-col overflow-hidden bg-black sm:bg-bg-primary"
    >
      {/* Hero banner = image with text overlaid inside it.
          Aspect widens at each breakpoint so the wide source
          (1795×876) crops cleanly and the text always has room. */}
      <div className="relative w-full">
        <div className="relative aspect-[5/4] w-full sm:aspect-[3/2] md:aspect-[16/9] lg:aspect-[21/9]">
          <Image
            src={BACKGROUND_SRC}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover object-[65%_center] sm:object-[60%_center] md:object-center"
          />
          {/* Overlay: dark on mobile (no cream), cream wash from sm+ for text readability */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent sm:from-bg-primary/85 sm:via-bg-primary/40 md:from-bg-primary/65 md:via-bg-primary/15 lg:from-bg-primary/55 lg:via-transparent"
          />

          {/* Text overlay — vertically centered, anchored left inside the image */}
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto flex w-full max-w-7xl px-5 sm:px-8 md:px-10 lg:px-12 xl:max-w-screen-2xl xl:px-20 2xl:px-28">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger(0.05, 0.12)}
                className="flex flex-col items-start gap-3 max-w-[62%] sm:max-w-[58%] sm:gap-4 md:max-w-md md:gap-5 lg:max-w-2xl lg:gap-6 xl:max-w-3xl xl:gap-7"
              >
                <motion.h1
                  variants={fadeUp}
                  className="font-display font-medium tracking-tight text-white sm:text-text-primary leading-[1.05] text-[clamp(1.25rem,5.5vw,4.75rem)]"
                >
                  Timeless Sarees.
                  <br />
                  Traditional Elegance.
                </motion.h1>

                <motion.div
                  variants={fadeUp}
                  className="w-full max-w-[7rem] sm:max-w-xs md:max-w-md lg:max-w-lg"
                >
                  <OrnamentalDivider />
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  className="font-display italic text-white/80 sm:text-text-secondary text-[clamp(0.7rem,2vw,1.125rem)] leading-snug"
                >
                  <span aria-hidden className="mr-1 text-gold sm:mr-2">
                    ✦
                  </span>
                  {siteConfig.storyTagline}
                  <span aria-hidden className="ml-1 text-gold sm:ml-2">
                    ✦
                  </span>
                </motion.p>

                <motion.div variants={fadeUp} className="pt-0.5 sm:pt-1">
                  <Link
                    href="/collections"
                    className={cn(
                      "group inline-flex items-center gap-2 rounded-md border-[1.5px] border-white/70 bg-black/20 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors duration-300",
                      "hover:bg-white hover:text-[#54100D] focus-visible:bg-white focus-visible:text-[#54100D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                      "sm:border-cta-fill sm:bg-bg-primary/30 sm:text-cta-fill sm:gap-3 sm:px-5 sm:py-3 sm:text-[11px] sm:tracking-[0.2em]",
                      "sm:hover:bg-cta-fill sm:hover:text-white",
                      "lg:px-7 lg:py-3.5 lg:text-[12px] lg:tracking-[0.22em]",
                    )}
                  >
                    Explore Collection
                    <ArrowRight
                      className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 sm:h-3.5 sm:w-3.5"
                      strokeWidth={2}
                    />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
