"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { SectionLabel } from "@/components/shared/section-label";
import { fadeUp, stagger } from "@/animations/fade";

const priceRanges = [
  {
    label: "Under ₹1,000",
    href: "/shop?price=under-1000",
    image: "/images/prize/under-1000/Untitled - May 25, 2026 at 13.07.12.png",
  },
  {
    label: "Under ₹2,000",
    href: "/shop?price=under-2000",
    image: "/images/prize/under-2000/Untitled - May 25, 2026 at 13.08.43.png",
  },
  {
    label: "Under ₹5,000",
    href: "/shop?price=under-5000",
    image: "/images/prize/under-5000/Untitled - May 25, 2026 at 13.10.44.png",
  },
  {
    label: "Under ₹10,000",
    href: "/shop?price=under-10000",
    image: "/images/prize/under-10,000/Untitled - May 25, 2026 at 13.11.45.png",
  },
];

export function SareesForYou() {
  return (
    <section
      aria-labelledby="sarees-for-you-heading"
      className="relative isolate overflow-hidden py-6 md:py-8 lg:py-10"
    >
      {/* Section background */}
      <Image
        src="/images/prize/backgroudn/image.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />

      <div className="relative z-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger(0.06, 0.1)}
          className="mb-4 flex flex-col items-center px-5 text-center md:mb-6"
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>Handpicked</SectionLabel>
          </motion.div>

          <motion.h2
            id="sarees-for-you-heading"
            variants={fadeUp}
            className="mt-2 font-display font-normal leading-none text-text-primary text-[clamp(1.5rem,3.5vw,3rem)]"
          >
            Sarees For You
          </motion.h2>

          <motion.div variants={fadeUp} className="mt-3 w-28 sm:w-36 md:w-44">
            <OrnamentalDivider align="center" />
          </motion.div>
        </motion.div>

        {/* Price-range cards — 2 cols on mobile, 4 cols on lg+ */}
        <div className="grid grid-cols-2 gap-2 px-4 md:gap-3 md:px-6 lg:grid-cols-4 lg:px-8">
          {priceRanges.map((range, i) => (
            <motion.div
              key={range.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ delay: i * 0.09, duration: 0.5, ease: "easeOut" }}
            >
              <Link
                href={range.href}
                aria-label={range.label}
                className="group relative block h-[200px] sm:h-[260px] md:h-[300px] lg:h-[320px] xl:h-[360px]"
              >
                <Image
                  src={range.image}
                  alt={range.label}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
