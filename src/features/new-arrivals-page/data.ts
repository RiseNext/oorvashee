import type { Product } from "@/components/shared/product-card";

const BASE: Omit<Product, "id" | "href"> = {
  code: "SSS-29",
  name: "linen printed",
  price: 499,
  image: "/images/products/sss-29.jpg",
  category: "New Arrival",
};

export const NEW_ARRIVALS_PAGE_PRODUCTS: Product[] = Array.from(
  { length: 40 },
  (_, i) => {
    const id = `na-page-${String(i + 1).padStart(2, "0")}`;
    return { ...BASE, id, href: `/new-arrivals/${id}` };
  },
);
