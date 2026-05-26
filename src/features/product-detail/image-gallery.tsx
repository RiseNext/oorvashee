"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Main image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-bg-secondary">
        <Image
          src={images[activeIdx]}
          alt={`${productName} — view ${activeIdx + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View image ${i + 1}`}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "relative aspect-[4/5] w-[72px] shrink-0 overflow-hidden rounded-xl bg-bg-secondary transition-all duration-200 sm:w-20",
                "ring-2",
                i === activeIdx
                  ? "ring-[var(--gold)]"
                  : "ring-border-light hover:ring-border-focus",
              )}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
