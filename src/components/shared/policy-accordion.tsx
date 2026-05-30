"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePolicies } from "@/hooks/use-policies";

/**
 * Store-wide policies (shipping, refund, terms, privacy) as collapsible rows.
 *
 * Rendered under every product, in the cart, and at checkout. It reads from
 * `PRODUCT_POLICIES`, so it is identical everywhere and any product — including
 * ones an admin adds later — shows the same fixed policies with no extra data.
 */
export function PolicyAccordion({
  heading = "Policies & Information",
  className,
}: {
  heading?: string;
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: policies } = usePolicies();

  return (
    <section className={cn("border-t border-border-light", className)}>
      {heading && (
        <h2 className="pt-5 font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
          {heading}
        </h2>
      )}

      <div className={cn(heading && "mt-1")}>
        {policies.map((policy) => {
          const isOpen = openId === policy.slug;
          return (
            <div key={policy.slug} className="border-b border-border-light">
              <button
                type="button"
                onClick={() => setOpenId((prev) => (prev === policy.slug ? null : policy.slug))}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="font-body text-sm font-semibold uppercase tracking-[0.1em] text-text-primary">
                  {policy.title}
                </span>
                {isOpen ? (
                  <Minus className="h-4 w-4 shrink-0 text-text-muted" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0 text-text-muted" />
                )}
              </button>

              {/* CSS grid trick → smooth height transition without measuring */}
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 pb-4 font-body text-sm leading-relaxed text-text-secondary">
                    {policy.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    <Link
                      href={`/policies/${policy.slug}`}
                      className="inline-flex items-center gap-1 font-medium text-cta-fill transition-colors hover:underline"
                    >
                      Read full {policy.title.toLowerCase()}
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/policies"
        className="mt-4 inline-block font-body text-xs uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-text-primary"
      >
        All policies &amp; information →
      </Link>
    </section>
  );
}
