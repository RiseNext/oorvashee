import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { AppProviders } from "@/providers";
import { JsonLd, organizationSchema, webSiteSchema } from "@/lib/seo/jsonld";
import { WebVitals } from "@/components/web-vitals";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  // 700 dropped — no element renders the display font at bold (every `font-bold`
  // heading carries `font-body`, so those are DM_Sans). Used display weights are
  // 400/500/600 only. DM_Sans weights are all in use and unchanged.
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.fullName,
  keywords: [
    "sarees",
    "silk sarees",
    "kanjivaram",
    "pattu sarees",
    "banaras sarees",
    "handwoven sarees",
    "cotton sarees",
    "Oorvashee",
  ],
  authors: [{ name: siteConfig.fullName, url: siteConfig.url }],
  creator: siteConfig.fullName,
  publisher: siteConfig.fullName,
  category: "shopping",
  // Canonical for the home route; deeper routes set their own canonical.
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  // The default OG/Twitter image is supplied by the app `opengraph-image`
  // (and `twitter-image`) file conventions; routes can override per page.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.fullName,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.fullName,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#F0E6D3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-body"
      >
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
        <WebVitals />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
