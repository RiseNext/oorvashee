"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

import {
  SHOWCASE_SAREES,
  type ShowcaseSaree,
} from "../data/showcase-sarees";
import { FoldedSareePlaceholder } from "./saree-placeholders";

interface FoldedTopSareesProps {
  /** Currently hovered saree id — used to lock the auto-shift in place. */
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
  /** How many slots are visible at once. Defaults to 3. */
  visibleCount?: number;
  /** Interval between auto-shifts, in ms. */
  intervalMs?: number;
  className?: string;
}

/**
 * Top row of folded sarees resting on the wooden table.
 * Auto-rotates the order every `intervalMs` so sarees slide horizontally
 * in and out of view. Pauses while the user is hovering, so hover feels
 * deliberate instead of slipping away mid-interaction.
 */
export function FoldedTopSarees({
  hoveredId,
  onHoverChange,
  visibleCount = 3,
  intervalMs = 4500,
  className,
}: FoldedTopSareesProps) {
  const [order, setOrder] = useState<ShowcaseSaree[]>(SHOWCASE_SAREES);

  useEffect(() => {
    if (hoveredId !== null) return;
    const id = window.setInterval(() => {
      setOrder((prev) => [...prev.slice(1), prev[0]]);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [hoveredId, intervalMs]);

  const visible = order.slice(0, visibleCount);

  return (
    <ul
      role="list"
      className={cn(
        "flex items-end justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-5",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.map((saree) => {
          const isActive = hoveredId === saree.id;
          return (
            <motion.li
              key={saree.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.94 }}
              transition={{
                layout: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="shrink-0"
            >
              <motion.button
                type="button"
                aria-label={`Preview ${saree.name}`}
                onHoverStart={() => onHoverChange(saree.id)}
                onHoverEnd={() => onHoverChange(null)}
                onFocus={() => onHoverChange(saree.id)}
                onBlur={() => onHoverChange(null)}
                whileHover={{ y: -8, scale: 1.06, rotate: -1.5 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className={cn(
                  "relative block w-[clamp(72px,14vw,185px)]",
                  "rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70",
                )}
                style={{
                  filter: isActive
                    ? "drop-shadow(0 18px 22px rgba(0,0,0,0.55)) drop-shadow(0 0 14px rgba(196,152,42,0.45))"
                    : "drop-shadow(0 10px 14px rgba(0,0,0,0.45))",
                  transition: "filter 0.4s ease",
                }}
              >
                <FoldedSareePlaceholder saree={saree} />
              </motion.button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
