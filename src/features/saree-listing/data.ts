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
  all: [
    ...makeProducts("kp", "kanchi-pattu-saree", "Kanchipattu", 20),
    ...makeProducts("bn", "banaras-sarees", "Banaras", 20),
    ...makeProducts("ct", "cotton-sarees", "Cotton", 20),
  ],
};
