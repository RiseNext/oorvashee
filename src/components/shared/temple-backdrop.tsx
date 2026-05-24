import { cn } from "@/lib/utils";
import Image from "next/image";

interface TempleBackdropProps {
  className?: string;
  /** Swap to real PNG when ready: "/images/ui/temple-illustration.png". */
  src?: string;
}

/**
 * Faint pencil-style palace/temple illustration that sits behind the hero text.
 * Per docs/UI.md §3.3 — opacity 8–12%, color `var(--gold)`, do NOT overlay the model.
 *
 * Placeholder: inline SVG silhouette. Swap with the real PNG via `src` when ready.
 */
export function TempleBackdrop({ className, src }: TempleBackdropProps) {
  if (src) {
    return (
      <div
        className={cn("pointer-events-none absolute inset-0 -z-10", className)}
        aria-hidden
      >
        <Image
          src={src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.10]"
          priority={false}
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.10] text-gold"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Central dome */}
          <path d="M600 240c-90 0-150 60-160 140h320c-10-80-70-140-160-140Z" />
          <path d="M600 200v40" />
          <circle cx="600" cy="195" r="4" />
          <path d="M440 380v200" />
          <path d="M760 380v200" />
          {/* Side towers */}
          <path d="M320 320c-50 0-80 50-80 110v150" />
          <path d="M880 320c50 0 80 50 80 110v150" />
          <path d="M240 580h720" />
          {/* Small arches across base */}
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M${280 + i * 80} 580v-50c0-20 16-36 36-36s36 16 36 36v50`}
            />
          ))}
          {/* Finials */}
          <path d="M320 320v-26" />
          <circle cx="320" cy="290" r="3" />
          <path d="M880 320v-26" />
          <circle cx="880" cy="290" r="3" />
          {/* Distant outline */}
          <path d="M100 600c40-30 90-50 140-50s100 20 140 50" opacity="0.6" />
          <path d="M820 600c40-30 90-50 140-50s100 20 140 50" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
