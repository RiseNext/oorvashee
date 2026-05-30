import Link from "next/link";
import { MessageCircle, Mail, Phone, Truck, RotateCcw, ShieldCheck, PackageSearch } from "lucide-react";

import { Navbar } from "@/features/navbar";
import { PageHeader } from "@/components/shared/page-header";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const { contact } = siteConfig;
const waNumber = contact.whatsapp.replace(/\D/g, "");
const freeShip = formatPrice(siteConfig.freeShippingThreshold);

const CHANNELS = [
  { icon: MessageCircle, label: "WhatsApp", value: contact.whatsapp, href: `https://wa.me/${waNumber}`, external: true },
  { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}`, external: true },
  { icon: Phone, label: "Call us", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}`, external: true },
] as const;

const ASSURANCES = [
  { icon: Truck, title: "Shipping & Delivery", body: `Dispatched in 1–2 business days. Free shipping on orders above ${freeShip}. Pan-India delivery in 3–7 business days.` },
  { icon: RotateCcw, title: "Returns & Exchange", body: "Easy 7-day returns on unused pieces in original packaging. Email us with your order number to begin." },
  { icon: ShieldCheck, title: "Secure Payments", body: "Pay by UPI, card, or netbanking via Razorpay, or choose Cash on Delivery. Your details are always encrypted." },
] as const;

export function SupportView() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        <PageHeader
          title="Help & Support"
          subtitle="We're here to help — every step of the way"
        />

        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* Contact channels */}
          <section>
            <h2 className="mb-5 font-body text-sm font-bold uppercase tracking-[0.18em] text-text-primary">
              Talk to us
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CHANNELS.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.external ? "_blank" : undefined}
                    rel={c.external ? "noopener noreferrer" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-border-light bg-bg-card p-5",
                      "shadow-[0_1px_2px_rgba(61,26,8,0.04)] transition-colors hover:border-border-focus",
                    )}
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <span>
                      <span className="block font-body text-sm font-semibold text-text-primary">{c.label}</span>
                      <span className="block font-body text-xs text-text-muted">{c.value}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Order help */}
          <section className="rounded-xl border border-border-light bg-bg-card p-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <PackageSearch className="mt-0.5 h-6 w-6 shrink-0 text-cta-fill" strokeWidth={1.6} />
                <div>
                  <h2 className="font-body text-sm font-bold uppercase tracking-[0.16em] text-text-primary">
                    Need help with an order?
                  </h2>
                  <p className="mt-1 font-body text-sm text-text-secondary">
                    Track any order with your order number and email, or view your history when signed in.
                  </p>
                </div>
              </div>
              <Link
                href="/account/orders"
                className={cn(
                  "shrink-0 rounded-full bg-text-primary px-6 py-2.5",
                  "font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-bg-dark",
                )}
              >
                My orders
              </Link>
            </div>
          </section>

          {/* Assurances */}
          <section>
            <h2 className="mb-5 font-body text-sm font-bold uppercase tracking-[0.18em] text-text-primary">
              Shopping with confidence
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {ASSURANCES.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="rounded-xl border border-border-light bg-bg-card p-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-secondary text-cta-fill">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <h3 className="mt-3 font-body text-sm font-semibold text-text-primary">{a.title}</h3>
                    <p className="mt-1.5 font-body text-sm leading-relaxed text-text-secondary">{a.body}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
