"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { SHOWCASE_SAREES } from "../data/showcase-sarees";
import { DrapedSareePlaceholder } from "./saree-placeholders";

interface BottomSareeLoopProps {
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
  className?: string;
}

export function BottomSareeLoop({
  hoveredId,
  onHoverChange,
  className,
}: BottomSareeLoopProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hoveredIndex = hoveredId
    ? SHOWCASE_SAREES.findIndex((s) => s.id === hoveredId)
    : -1;
  const displayedIndex = hoveredIndex >= 0 ? hoveredIndex : selectedIndex;
  const displayed = SHOWCASE_SAREES[displayedIndex] ?? SHOWCASE_SAREES[0];

  const cycle = (delta: 1 | -1) =>
    setSelectedIndex(
      (i) => (i + delta + SHOWCASE_SAREES.length) % SHOWCASE_SAREES.length,
    );

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center",
        // mobile: comfortable tap gap
        "gap-2",
        // sm+: tighter so arrows hug the saree
        "sm:gap-1",
        className,
      )}
    >
      <ArrowButton direction="prev" onClick={() => cycle(-1)} label="Previous saree" />

      {/* Saree — fluid width: fills the column between the two arrows.
          On mobile the clamp floor (180 px) keeps it big enough to read;
          on desktop flex-1 fills the column and max-w caps the height. */}
      <div
        className={cn(
          "relative",
          "w-[clamp(200px,44vw,460px)]",
          "sm:flex-1 sm:min-w-0 sm:w-auto sm:max-w-[390px]",
          "md:max-w-[430px]",
          "lg:max-w-[460px]",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.button
            type="button"
            key={displayed.id}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`View ${displayed.name}`}
            onMouseEnter={() => onHoverChange(displayed.id)}
            onMouseLeave={() => onHoverChange(null)}
            onFocus={() => onHoverChange(displayed.id)}
            onBlur={() => onHoverChange(null)}
            className={cn(
              "block w-full rounded-[8px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70",
              "transition-[filter] duration-500 ease-out",
            )}
            style={{
              filter:
                hoveredId === displayed.id
                  ? "drop-shadow(0 24px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 26px rgba(196,152,42,0.6))"
                  : "drop-shadow(0 18px 22px rgba(0,0,0,0.5))",
            }}
          >
            <DrapedSareePlaceholder saree={displayed} />
          </motion.button>
        </AnimatePresence>
      </div>

      <ArrowButton direction="next" onClick={() => cycle(1)} label="Next saree" />
    </div>
  );
}

function ArrowButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group flex shrink-0 items-center justify-center",
        "h-9 w-9 sm:h-8 sm:w-8",
        "rounded-full border border-gold/70 bg-bg-primary/85 text-cta-fill backdrop-blur-md",
        "shadow-[0_4px_12px_rgba(0,0,0,0.5)]",
        "transition-all duration-300 ease-out",
        "hover:scale-110 hover:bg-gold hover:text-bg-dark hover:border-gold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70",
      )}
    >
      <Icon
        className="h-4 w-4 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:scale-110"
        strokeWidth={2}
      />
    </button>
  );
}
