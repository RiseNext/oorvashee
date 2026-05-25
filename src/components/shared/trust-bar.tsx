import { cn } from "@/lib/utils";

export interface TrustBarItem {
  icon: React.ReactNode;
  label: string;
  caption: string;
}

interface TrustBarProps {
  items: TrustBarItem[];
  className?: string;
  /** Visual context — adjusts text color tokens on dark backgrounds. */
  tone?: "light" | "dark";
}

/**
 * 3–4 column icon + label + caption strip.
 * Per docs/UI.md §3.13.
 */
export function TrustBar({ items, className, tone = "light" }: TrustBarProps) {
  const label = tone === "dark" ? "text-text-on-dark" : "text-text-primary";
  const caption = tone === "dark" ? "text-text-on-dark-muted" : "text-text-muted";

  return (
    <ul
      className={cn(
        "grid w-full grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10",
        items.length === 4 && "grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.label}
          className="flex flex-col items-center gap-1.5 text-center sm:gap-2 sm:items-start sm:text-left md:gap-2.5 lg:gap-3"
        >
          <span className="text-gold">{item.icon}</span>
          <span
            className={cn(
              "text-[10px] font-medium uppercase leading-tight tracking-[0.14em] sm:text-[11px] sm:tracking-[0.18em] md:text-xs lg:text-[13px] lg:tracking-[0.2em]",
              label,
            )}
          >
            {item.label}
          </span>
          <span
            className={cn(
              "text-[10px] font-light leading-tight sm:text-xs md:text-[13px] lg:text-sm",
              caption,
            )}
          >
            {item.caption}
          </span>
        </li>
      ))}
    </ul>
  );
}
