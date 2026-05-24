import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  /** Small mark flanking the text. Default ✦. Pass null for no flanks. */
  flank?: string | null;
  className?: string;
  tone?: "gold" | "cta";
  as?: "p" | "span" | "h2" | "h3";
}

/**
 * Eyebrow / kicker label — `✦ OUR PROMISE ✦`.
 * Per docs/UI.md §3.14.
 */
export function SectionLabel({
  children,
  flank = "✦",
  className,
  tone = "gold",
  as: Tag = "p",
}: SectionLabelProps) {
  const colorClass = tone === "gold" ? "text-gold" : "text-cta-fill";
  return (
    <Tag
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em]",
        colorClass,
        className,
      )}
    >
      {flank ? <span aria-hidden>{flank}</span> : null}
      <span>{children}</span>
      {flank ? <span aria-hidden>{flank}</span> : null}
    </Tag>
  );
}
