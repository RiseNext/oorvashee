import { cn } from "@/lib/utils";

interface OrnamentalDividerProps {
  /** Total visual width in px. Defaults to fluid (max-w-xs). */
  width?: number;
  className?: string;
  /** Line + motif color. Defaults to `var(--gold)`. */
  color?: string;
  /** Where to align the divider within its parent. */
  align?: "start" | "center";
}

/**
 * `——— ❖ ———` style ornament used under headings, between sections.
 * Per docs/UI.md §3.1.
 */
export function OrnamentalDivider({
  width,
  className,
  color = "var(--gold)",
  align = "start",
}: OrnamentalDividerProps) {
  return (
    <div
      role="presentation"
      aria-hidden
      className={cn(
        "flex items-center gap-3",
        align === "center" ? "mx-auto" : "",
        className,
      )}
      style={width ? { width } : undefined}
    >
      <span
        className="h-px flex-1"
        style={{ backgroundColor: color, opacity: 0.65 }}
      />
      <Motif color={color} />
      <span
        className="h-px flex-1"
        style={{ backgroundColor: color, opacity: 0.65 }}
      />
    </div>
  );
}

function Motif({ color }: { color: string }) {
  return (
    <svg
      width="22"
      height="10"
      viewBox="0 0 22 10"
      className="shrink-0"
      aria-hidden
    >
      <g fill={color}>
        <circle cx="4" cy="5" r="1" />
        <path
          d="M11 0.5 L13.5 5 L11 9.5 L8.5 5 Z"
          opacity="0.95"
        />
        <circle cx="18" cy="5" r="1" />
      </g>
    </svg>
  );
}
