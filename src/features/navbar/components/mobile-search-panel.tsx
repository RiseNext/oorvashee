"use client";

import { useEffect, useRef } from "react";
import { motion, type Transition } from "motion/react";
import { Search, X } from "lucide-react";

interface MobileSearchPanelProps {
  onClose: () => void;
}

const ease: Transition["ease"] = [0.22, 1, 0.36, 1];

export function MobileSearchPanel({ onClose }: MobileSearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <motion.button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease }}
        className="fixed inset-0 -z-[1] cursor-default bg-text-primary/10 backdrop-blur-[2px] md:hidden"
      />

      {/* Search panel */}
      <motion.div
        key="mobile-search-panel"
        id="mobile-search-panel"
        role="search"
        aria-label="Site search"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{
          height: { duration: 0.32, ease },
          opacity: { duration: 0.22, ease },
        }}
        className="absolute inset-x-0 top-full z-10 overflow-hidden px-3 md:hidden"
      >
        <motion.div
          initial={{ y: -6, scale: 0.985 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: -6, scale: 0.985 }}
          transition={{ duration: 0.28, ease }}
          style={{ transformOrigin: "top center" }}
          className="mx-auto mt-2 max-w-7xl rounded-[24px] border border-border-default/40 bg-bg-card/92 shadow-[0_24px_60px_-16px_rgba(122,75,21,0.28),0_4px_16px_-4px_rgba(122,75,21,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-bg-card/85"
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Search className="h-[18px] w-[18px] shrink-0 text-text-muted" strokeWidth={1.7} />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search sarees…"
              className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-muted outline-none font-display italic"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted transition-colors duration-200 hover:bg-bg-secondary hover:text-text-primary"
            >
              <X className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
