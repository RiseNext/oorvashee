import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Navbar } from "@/features/navbar";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { CONTACT_INTRO } from "@/config/policies";

export const metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        {/* ── Page header ── */}
        <PageHeader
          title="Contact Us"
          subtitle="We'd love to hear from you — visit us in store or reach out anytime"
        />

        {/* ── Contact cards ── */}
        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          {/* Intro copy */}
          <div className="mx-auto mb-12 max-w-3xl space-y-4 text-center font-body text-[15px] leading-relaxed text-text-secondary sm:text-base">
            {CONTACT_INTRO.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

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
                H No: 6-3-2100/594, Plot No: S4/C-594,
                <br />
                Venkatakala Nilayam, NGO&rsquo;s Colony,
                <br />
                Vanastalipuram, Rangareddy Dist,
                <br />
                Telangana — 500070
              </address>
              <Link
                href="https://maps.google.com/?q=Venkatakala+Nilayam+NGOs+Colony+Vanastalipuram+Rangareddy+Telangana+500070"
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
                  Support Hours
                </h2>
                <p className="mt-1 text-[14px] text-text-secondary">
                  {siteConfig.contact.supportHours}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
