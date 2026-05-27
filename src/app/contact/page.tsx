import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Navbar } from "@/features/navbar";
import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        {/* ── Page header ── */}
        <div className="bg-bg-secondary py-10 sm:py-14 lg:py-16 text-center px-4">
          <OrnamentalDivider align="center" className="mx-auto max-w-[180px] mb-5" />
          <h1
            className="font-display font-semibold uppercase"
            style={{
              color: "var(--gold)",
              fontSize: "clamp(2.25rem, 6vw, 5rem)",
              letterSpacing: "0.14em",
              lineHeight: 1.1,
            }}
          >
            Contact Us
          </h1>
          <p className="mt-3 font-display italic text-sm sm:text-base text-text-muted">
            We&apos;d love to hear from you — visit us in store or reach out anytime
          </p>
          <OrnamentalDivider align="center" className="mx-auto max-w-[180px] mt-5" />
        </div>

        {/* ── Contact cards ── */}
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Store Location */}
            <div className="group rounded-2xl border border-border-default/50 bg-bg-card p-7 shadow-sm transition-shadow duration-300 hover:shadow-md sm:col-span-2 lg:col-span-1">
              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--gold) 15%, transparent)" }}
              >
                <MapPin className="h-6 w-6" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
              </div>
              <h2 className="mb-1 font-display text-lg font-semibold tracking-wide text-text-primary">
                Visit Our Store
              </h2>
              <p className="font-display text-[11px] uppercase tracking-[0.14em] text-text-muted mb-3">
                VR Location
              </p>
              <address className="not-italic text-[15px] leading-relaxed text-text-secondary">
                Shop No. 44 &amp; 45, Ground Floor,
                <br />
                LPT Market, LB Nagar,
                <br />
                Hyderabad, Telangana — 500074
              </address>
              <Link
                href="https://maps.google.com/?q=LPT+Market+LB+Nagar+Hyderabad"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200 hover:underline"
                style={{ color: "var(--gold)" }}
              >
                Get Directions
                <span aria-hidden>→</span>
              </Link>
            </div>

            {/* Phone */}
            <div className="group rounded-2xl border border-border-default/50 bg-bg-card p-7 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--gold) 15%, transparent)" }}
              >
                <Phone className="h-6 w-6" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
              </div>
              <h2 className="mb-1 font-display text-lg font-semibold tracking-wide text-text-primary">
                Call Us
              </h2>
              <p className="font-display text-[11px] uppercase tracking-[0.14em] text-text-muted mb-3">
                Phone &amp; WhatsApp
              </p>
              <Link
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="block text-[15px] text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                {siteConfig.contact.phone}
              </Link>
              <Link
                href={`https://wa.me/${siteConfig.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors duration-200 hover:underline"
                style={{ color: "var(--gold)" }}
              >
                Chat on WhatsApp
                <span aria-hidden>→</span>
              </Link>
            </div>

            {/* Email */}
            <div className="group rounded-2xl border border-border-default/50 bg-bg-card p-7 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div
                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--gold) 15%, transparent)" }}
              >
                <Mail className="h-6 w-6" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
              </div>
              <h2 className="mb-1 font-display text-lg font-semibold tracking-wide text-text-primary">
                Email Us
              </h2>
              <p className="font-display text-[11px] uppercase tracking-[0.14em] text-text-muted mb-3">
                We reply within 24 hrs
              </p>
              <Link
                href={`mailto:${siteConfig.contact.email}`}
                className="block text-[15px] text-text-secondary transition-colors duration-200 hover:text-text-primary"
              >
                {siteConfig.contact.email}
              </Link>
            </div>
          </div>

          {/* Store hours placeholder */}
          <div className="mt-8 rounded-2xl border border-border-default/40 bg-bg-secondary/60 px-8 py-6">
            <div className="flex items-start gap-4">
              <div
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--gold) 15%, transparent)" }}
              >
                <Clock className="h-5 w-5" style={{ color: "var(--gold)" }} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold tracking-wide text-text-primary">
                  Store Hours
                </h2>
                <p className="mt-1 text-[14px] text-text-muted italic">
                  Hours and more details coming soon — call us to confirm timings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
