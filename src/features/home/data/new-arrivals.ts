import type { Product } from "@/components/shared/product-card";

const BASE = {
  code: "SSS-29",
  name: "linen printed",
  price: 499,
  image: "/images/products/sss-29.jpg",
  category: "New Arrival",
};

export const NEW_ARRIVALS: Product[] = [
  { ...BASE, id: "na-01", href: "/new-arrivals/na-01" },
  { ...BASE, id: "na-02", href: "/new-arrivals/na-02" },
  { ...BASE, id: "na-03", href: "/new-arrivals/na-03" },
  { ...BASE, id: "na-04", href: "/new-arrivals/na-04" },
  { ...BASE, id: "na-05", href: "/new-arrivals/na-05" },
];
