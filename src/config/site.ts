export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const siteConfig = {
  name: "Oorvashee",
  fullName: "Oorvashee Saree House",
  tagline: "Timeless Sarees. Traditional Elegance.",
  storyTagline: "Every Weave Tells a Story of Grace",
  description:
    "Oorvashee Saree House — handwoven sarees in pure silk, cotton, and heritage weaves. Timeless designs, crafted with care.",
  url: "https://oorvashee.com",
  ogImage: "/og.jpg",
  locale: "en-IN",
  currency: "INR",
  // Free-shipping threshold (₹). Frontend marketing copy only — the backend
  // currently returns shipping = 0; single-sourced here so cart / PDP / support
  // never disagree.
  freeShippingThreshold: 3000,
  contact: {
    email: "hello@oorvashee.com",
    phone: "+91 97037 66779",
    whatsapp: "+91 97037 66779",
    address: "H No: 6-3-2100/594, Plot No: S4/C-594, Venkatakala Nilayam, NGO's Colony, Vanastalipuram, Rangareddy Dist, Telangana — 500070",
    supportHours: "Monday to Saturday, 10:00 AM to 7:00 PM IST",
  },
  social: {
    instagram: "https://instagram.com/oorvashee",
    facebook: "https://facebook.com/oorvashee",
    pinterest: "https://pinterest.com/oorvashee",
    youtube: "https://youtube.com/@oorvashee",
  },
  nav: [
    { label: "Home", href: "/" },
    {
      label: "Collection",
      href: "/collections",
      children: [
        {
          label: "Pattu",
          href: "/saris/pattu",
          children: [
            { label: "Gadwal Silk Sarees", href: "/saris/gadwal-silk-sarees" },
            { label: "Kanchi Silk", href: "/saris/kanchi-silk" },
            { label: "Narayanapet Sarees", href: "/saris/narayanapet-sarees" },
            { label: "Mangalgiri Sarees", href: "/saris/mangalgiri-sarees" },
            { label: "Harini Pattu", href: "/saris/harini-pattu" },
          ],
        },
        { label: "Cotton Sarees", href: "/saris/cotton-sarees" },
        { label: "Banaras Sarees", href: "/saris/banaras-sarees" },
        { label: "Designer Sarees", href: "/saris/designer-sarees" },
        { label: "Kalamkari Sarees", href: "/saris/kalamkari-sarees" },
      ],
    },
    { label: "Pure Kanjivaram Silk", href: "/saris/pure-kanjivaram-silk" },
    { label: "Fancy Sarees", href: "/saris/fancy-sarees" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Video", href: "/video" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],
} as const;

export type SiteConfig = typeof siteConfig;

export interface VideoItem {
  /** YouTube video ID (the part after `watch?v=`). */
  id: string;
  title: string;
}

/**
 * Featured films for the `/video` page. Populate with real YouTube video IDs
 * to render an embed grid; until then the page links out to the channel
 * (`siteConfig.social.youtube`). Intentionally empty — no placeholder IDs.
 */
export const videoGallery: VideoItem[] = [];
