import Link from "next/link";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";

import { siteConfig } from "@/config/site";

// Server component — pure markup + links (no client state), so there is no
// hydration boundary and no layout shift. Links resolve to real routes only.

// Brand marks are inlined (this lucide-react build drops brand icons for
// trademark reasons). 18px, currentColor, decorative (aria-hidden).
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-[18px] w-[18px]",
  "aria-hidden": true,
};

function InstagramIcon() {
  return (
    <svg {...svgProps}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg {...svgProps}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg {...svgProps}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "All Sarees", href: "/saris" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const COLLECTION_LINKS = [
  { label: "Pure Kanjivaram Silk", href: "/saris/pure-kanjivaram-silk" },
  { label: "Banaras Sarees", href: "/saris/banaras-sarees" },
  { label: "Cotton Sarees", href: "/saris/cotton-sarees" },
  { label: "Under ₹1,000", href: "/collections/under-1000" },
  { label: "Under ₹5,000", href: "/collections/under-5000" },
];

const SUPPORT_LINKS = [
  { label: "Help & Support", href: "/support" },
  { label: "My Account", href: "/account" },
  { label: "Track Order", href: "/account/orders" },
  { label: "Wishlist", href: "/wishlist" },
];

const waNumber = siteConfig.contact.whatsapp.replace(/\D/g, "");

const SOCIALS = [
  { label: "Instagram", href: siteConfig.social.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: siteConfig.social.facebook, Icon: FacebookIcon },
  { label: "YouTube", href: siteConfig.social.youtube, Icon: YoutubeIcon },
];

const linkClass = "font-body text-sm text-white/70 transition-colors duration-200 hover:text-white";
const headingClass = "mb-4 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold";

export function Footer() {
  return (
    <footer className="relative bg-[#54100D] text-white">
      {/* Gold hairline accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="mx-auto max-w-screen-xl px-5 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <p className="font-display text-3xl font-semibold tracking-wide text-gold">{siteConfig.name}</p>
            <p className="mt-1 font-display text-sm italic text-white/60">{siteConfig.tagline}</p>
            <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-white/70">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors duration-200 hover:border-gold hover:text-gold"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <nav aria-label="Quick links">
            <h2 className={headingClass}>Explore</h2>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collections */}
          <nav aria-label="Collections">
            <h2 className={headingClass}>Collections</h2>
            <ul className="space-y-3">
              {COLLECTION_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support + contact */}
          <div>
            <h2 className={headingClass}>Help</h2>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <address className="mt-6 space-y-2.5 not-italic">
              <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className={`flex items-start gap-2 ${linkClass}`}>
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.6} />
                {siteConfig.contact.phone}
              </a>
              <a href={`mailto:${siteConfig.contact.email}`} className={`flex items-start gap-2 ${linkClass}`}>
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.6} />
                {siteConfig.contact.email}
              </a>
              <p className="flex items-start gap-2 font-body text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.6} />
                <span>{siteConfig.contact.address}</span>
              </p>
            </address>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-2 font-body text-xs font-medium uppercase tracking-[0.12em] text-gold transition-colors duration-200 hover:bg-gold hover:text-[#54100D]"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.7} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-2 px-5 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-body text-xs text-white/55">
            © {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.
          </p>
          <p className="font-display text-xs italic text-white/45">{siteConfig.storyTagline}</p>
        </div>
      </div>
    </footer>
  );
}
