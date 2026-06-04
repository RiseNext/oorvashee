"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePolicies } from "@/hooks/use-policies";

/**
 * Store-wide policies (shipping, refund, terms, privacy) collapsed into a single
 * compact box. The box shows only an "All Policies & Information" trigger by
 * default; clicking it expands downward to reveal the individual policy rows
 * (each itself collapsible) plus a link to the full policies page.
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
  // Outer box (the "All Policies & Information" trigger) is collapsed by default
  // so it stays compact; opens to reveal the rows.
  const [expanded, setExpanded] = useState(false);
  // Which individual policy row is open inside the box.
  const [openId, setOpenId] = useState<string | null>(null);
  const { data: policies } = usePolicies();

  return (
    <section className={className}>
      <div className="overflow-hidden rounded-xl border border-border-light bg-bg-card">
        {/* ── Box trigger: "All Policies & Information" ── */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-bg-secondary/40"
        >
          <span className="font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
            All Policies &amp; Information
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-text-muted transition-transform duration-300 ease-in-out",
              expanded && "rotate-180",
            )}
          />
        </button>

        {/* ── Box body: enlarges downward when open (grid-rows height trick) ── */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-border-light px-5 pb-3">
              {heading && (
                <h2 className="pt-4 font-body text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                  {heading}
                </h2>
              )}

              <div className="mt-1">
                {policies.map((policy) => {
                  const isOpen = openId === policy.slug;
                  return (
                    <div key={policy.slug} className="border-b border-border-light last:border-0">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenId((prev) => (prev === policy.slug ? null : policy.slug))
                        }
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
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
                View all policies &amp; information →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
