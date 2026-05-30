import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { cn } from "@/lib/utils";

/**
 * Compact themed page header used across storefront pages (Contact, Cart,
 * Checkout, Policies, listings, etc.).
 *
 * Deliberately low-profile: a single ornamental divider above a moderate gold
 * title, tight padding, optional eyebrow + subtitle. Header height is owned
 * here so it stays consistent and doesn't eat the fold on every page.
 */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  className,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={cn("bg-bg-secondary px-4 py-6 text-center sm:py-8", className)}>
      {eyebrow && (
        <p
          className="mb-2 font-body text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: "var(--gold)" }}
        >
          {eyebrow}
        </p>
      )}
      <OrnamentalDivider align="center" className="mx-auto mb-2.5 max-w-[130px]" />
      <h1
        className="font-display font-semibold uppercase"
        style={{
          color: "var(--gold)",
          fontSize: "clamp(1.6rem, 4vw, 2.75rem)",
          letterSpacing: "0.12em",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 font-display italic text-sm text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
