import type { Collection, Product } from "@/types";

const IMG = "/images/products/sss-29.jpg";

export const mockCollections: Collection[] = [
  {
    id: "c-cotton",
    slug: "cotton",
    title: "Cotton Sarees",
    description: "Breathable everyday weaves in soft cotton.",
    heroImage: { url: IMG, alt: "Cotton Sarees" },
    productCount: 1,
  },
  {
    id: "c-silk",
    slug: "silk",
    title: "Silk Sarees",
    description: "Lustrous handwoven silks from Kanjivaram, Banarasi, and beyond.",
    heroImage: { url: IMG, alt: "Silk Sarees" },
    productCount: 1,
  },
  {
    id: "c-linen",
    slug: "linen",
    title: "Linen Sarees",
    description: "Modern, airy linens for the contemporary wardrobe.",
    heroImage: { url: IMG, alt: "Linen Sarees" },
    productCount: 1,
  },
  {
    id: "c-bridal",
    slug: "bridal",
    title: "Bridal Edit",
    description: "Heirloom-worthy pieces for the most important days.",
    heroImage: { url: IMG, alt: "Bridal Edit" },
    productCount: 1,
  },
];

const testProduct: Product = {
  id: "p-029",
  slug: "linen-printed-sss-29",
  title: "Lenin Printed",
  subtitle: "Rama green gingham with floral print",
  price: 499,
  currency: "INR",
  fabric: "Linen",
  image: { url: IMG, alt: "Lenin Printed – SSS-29" },
  hoverImage: { url: IMG, alt: "Lenin Printed – SSS-29 detail" },
  rating: { average: 4.5, count: 10 },
  collection: { slug: "cotton", title: "Cotton Sarees" },
  description:
    "A fresh rama-green gingham linen with scattered rose prints — light, breezy, and everyday-ready.",
  images: [
    { url: IMG, alt: "Front" },
    { url: IMG, alt: "Drape detail" },
    { url: IMG, alt: "Pallu" },
    { url: IMG, alt: "Border" },
  ],
  variants: [
    {
      id: "v-029-default",
      sku: "URO-LP-029",
      title: "Free size",
      price: 499,
      inStock: true,
      options: { length: "5.5m + 0.8m blouse" },
    },
  ],
  attributes: {
    fabric: "Linen",
    weave: "Printed",
    region: "South India",
    blousePiece: true,
    length: "5.5m",
    width: "1.10m",
    careInstructions: ["Hand wash cold", "Iron on medium"],
  },
};

export const mockProducts: Product[] = [
  { ...testProduct, id: "p-029-a", slug: "linen-printed-sss-29-a" },
  { ...testProduct, id: "p-029-b", slug: "linen-printed-sss-29-b" },
  { ...testProduct, id: "p-029-c", slug: "linen-printed-sss-29-c" },
  { ...testProduct, id: "p-029-d", slug: "linen-printed-sss-29-d" },
];
