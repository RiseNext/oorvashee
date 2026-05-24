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
    phone: "+91 00000 00000",
    whatsapp: "+91 00000 00000",
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
          label: "Sarees",
          href: "/saris",
          children: [
            {
              label: "Kanchipattu Sarees",
              href: "/saris/kanchi-pattu-saree",
            },
            { label: "Banaras Sarees", href: "/saris/banaras-sarees" },
            { label: "Cotton Sarees", href: "/saris/cotton-sarees" },
            { label: "Designer Sarees", href: "/saris/designer-sarees" },
            {
              label: "Cocktail Party Wear Sarees",
              href: "/saris/cocktail-party-wear-sarees",
            },
          ],
        },
      ],
    },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ] satisfies NavItem[],
} as const;

export type SiteConfig = typeof siteConfig;
