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
  contact: {
    email: "hello@oorvashee.com",
    phone: "+91 97037 66779",
    whatsapp: "+91 97037 66779",
    address: "Shop No. 44 & 45, Ground Floor, LPT Market, LB Nagar, Hyderabad, Telangana — 500074",
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
