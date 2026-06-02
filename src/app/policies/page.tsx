import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Globe, Clock, ArrowRight } from "lucide-react";

import { Navbar } from "@/features/navbar";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { listPolicies } from "@/lib/api/policies";

// ISR: cached + revalidated hourly, bustable on-demand via revalidateTag("policies").
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Policies & Information",
  description:
    "Oorvashee website policies and information — about us, contact, privacy, shipping, refund, and terms.",
  alternates: { canonical: "/policies" },
};

const websiteUrl = siteConfig.url.replace(/^https?:\/\//, "");

export default async function PoliciesOverviewPage() {
  const policies = await listPolicies();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        {/* ── Header ── */}
        <PageHeader
          title="Policies & Information"
          subtitle={`Everything you need to know about shopping with ${siteConfig.name}`}
        />

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* About + Contact quick links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/about"
              className="group rounded-2xl border border-border-default/50 bg-bg-card p-6 transition-shadow hover:shadow-md"
            >
              <h2 className="font-display text-lg font-semibold text-text-primary">About Us</h2>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-text-secondary">
                Premium ethnic fashion built on quality, authenticity, and customer satisfaction.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 font-body text-xs font-medium uppercase tracking-[0.12em] text-cta-fill">
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              href="/contact"
              className="group rounded-2xl border border-border-default/50 bg-bg-card p-6 transition-shadow hover:shadow-md"
            >
              <h2 className="font-display text-lg font-semibold text-text-primary">Contact Us</h2>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-text-secondary">
                Prompt, professional support for products, orders, shipping, and returns.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 font-body text-xs font-medium uppercase tracking-[0.12em] text-cta-fill">
                Get in touch <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          {/* Policy summaries */}
          <h2 className="mt-12 mb-5 font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
            Our Policies
          </h2>
          <ul className="divide-y divide-border-light border-y border-border-light">
            {policies.map((policy) => (
              <li key={policy.slug}>
                <Link
                  href={`/policies/${policy.slug}`}
                  className="group flex items-start justify-between gap-4 py-5"
                >
                  <div>
                    <span className="font-body text-[15px] font-semibold text-text-primary">
                      {policy.title}
                    </span>
                    <p className="mt-1 font-body text-sm leading-relaxed text-text-secondary">
                      {policy.summary}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>

          {/* Contact summary */}
          <div className="mt-12 rounded-2xl border border-border-default/40 bg-bg-secondary/60 px-6 py-7 sm:px-8">
            <h2 className="font-display text-lg font-semibold text-text-primary">Reach Us</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="font-body text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  {siteConfig.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 shrink-0" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
                <span className="font-body text-sm text-text-secondary">{websiteUrl}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 shrink-0" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
                <span className="font-body text-sm text-text-secondary">
                  {siteConfig.contact.supportHours}
                </span>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </>
  );
}
