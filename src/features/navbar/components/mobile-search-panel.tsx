"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, type Transition } from "motion/react";
import { Search, X } from "lucide-react";

interface MobileSearchPanelProps {
  onClose: () => void;
}

const ease: Transition["ease"] = [0.22, 1, 0.36, 1];

export function MobileSearchPanel({ onClose }: MobileSearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

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
      {/* Backdrop — fade only (no blur) for cheap compositing. */}
      <motion.button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease }}
        className="fixed inset-0 -z-[1] cursor-default bg-text-primary/25 md:hidden"
      />

      {/* Search panel — transform + opacity only (GPU-composited, smooth). */}
      <motion.div
        key="mobile-search-panel"
        id="mobile-search-panel"
        role="search"
        aria-label="Site search"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease }}
        style={{ willChange: "transform, opacity" }}
        className="absolute inset-x-0 top-full z-10 px-3 md:hidden"
      >
        <div className="mx-auto mt-2 max-w-7xl rounded-[24px] border border-border-default/40 bg-bg-card shadow-[0_24px_60px_-16px_rgba(122,75,21,0.28),0_4px_16px_-4px_rgba(122,75,21,0.12)]">
          <form role="search" onSubmit={submitSearch} className="flex items-center gap-3 px-4 py-3.5">
            <button type="submit" aria-label="Search" className="shrink-0 outline-none">
              <Search className="h-[18px] w-[18px] text-text-muted" strokeWidth={1.7} />
            </button>
            <input
              ref={inputRef}
              type="search"
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sarees…"
              aria-label="Search sarees"
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
          </form>
        </div>
      </motion.div>
    </>
  );
}
