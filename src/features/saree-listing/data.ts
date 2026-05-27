import type { Product } from "@/components/shared/product-card";

const BASE: Omit<Product, "id" | "href" | "category"> = {
  code: "SSS-29",
  name: "linen printed",
  price: 499,
  image: "/images/products/sss-29.jpg",
};

function makeProducts(prefix: string, slug: string, category: string, count = 60): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const id = `${prefix}-${String(i + 1).padStart(2, "0")}`;
    return { ...BASE, id, href: `/saris/${slug}/${id}`, category };
  });
}

export const SAREE_LISTING_PRODUCTS: Record<string, Product[]> = {
  "kanchi-pattu-saree": makeProducts("kp", "kanchi-pattu-saree", "Kanchipattu"),
  "banaras-sarees": makeProducts("bn", "banaras-sarees", "Banaras"),
  "cotton-sarees": makeProducts("ct", "cotton-sarees", "Cotton"),
  "designer-sarees": makeProducts("ds", "designer-sarees", "Designer"),
  "cocktail-party-wear-sarees": makeProducts("cp", "cocktail-party-wear-sarees", "Cocktail"),
  "gadwal-silk-sarees": makeProducts("gw", "gadwal-silk-sarees", "Gadwal Silk"),
  "kanchi-silk": makeProducts("ks", "kanchi-silk", "Kanchi Silk"),
  "narayanapet-sarees": makeProducts("np", "narayanapet-sarees", "Narayanapet"),
  "mangalgiri-sarees": makeProducts("mg", "mangalgiri-sarees", "Mangalgiri"),
  "harini-pattu": makeProducts("hp", "harini-pattu", "Harini Pattu"),
  "kalamkari-sarees": makeProducts("kl", "kalamkari-sarees", "Kalamkari"),
  "fancy-sarees": makeProducts("fn", "fancy-sarees", "Fancy"),
  "pure-kanjivaram-silk": makeProducts("pk", "pure-kanjivaram-silk", "Pure Kanjivaram Silk"),
  "pattu": [
    ...makeProducts("gw", "gadwal-silk-sarees", "Gadwal Silk", 12),
    ...makeProducts("ks", "kanchi-silk", "Kanchi Silk", 12),
    ...makeProducts("np", "narayanapet-sarees", "Narayanapet", 12),
    ...makeProducts("mg", "mangalgiri-sarees", "Mangalgiri", 12),
    ...makeProducts("hp", "harini-pattu", "Harini Pattu", 12),
  ],
  all: [
    ...makeProducts("kp", "kanchi-pattu-saree", "Kanchipattu", 20),
    ...makeProducts("bn", "banaras-sarees", "Banaras", 20),
    ...makeProducts("ct", "cotton-sarees", "Cotton", 20),
  ],
};
