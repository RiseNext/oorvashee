import type { Product } from "@/components/shared/product-card";

export interface SareeCategory {
  id: string;
  label: string;
  href: string;
  products: Product[];
}

const BASE = {
  code: "SSS-29",
  name: "linen printed",
  price: 499,
  image: "/images/products/sss-29.jpg",
  category: "Cotton",
};

function makeProducts(categorySlug: string, ids: string[]): Product[] {
  return ids.map((id) => ({ ...BASE, id, href: `/saris/${categorySlug}/${id}` }));
}

export const SAREE_COLLECTIONS: SareeCategory[] = [
  {
    id: "kanchipattu",
    label: "Kanchipattu Sarees",
    href: "/saris/kanchi-pattu-saree",
    products: makeProducts("kanchi-pattu-saree", ["kp-01", "kp-02", "kp-03", "kp-04", "kp-05"]),
  },
  {
    id: "banaras",
    label: "Banaras Sarees",
    href: "/saris/banaras-sarees",
    products: makeProducts("banaras-sarees", ["bn-01", "bn-02", "bn-03", "bn-04", "bn-05"]),
  },
  {
    id: "cotton",
    label: "Cotton Sarees",
    href: "/saris/cotton-sarees",
    products: makeProducts("cotton-sarees", ["ct-01", "ct-02", "ct-03", "ct-04", "ct-05"]),
  },
  {
    id: "designer",
    label: "Designer Sarees",
    href: "/saris/designer-sarees",
    products: makeProducts("designer-sarees", ["ds-01", "ds-02", "ds-03", "ds-04", "ds-05"]),
  },
  {
    id: "cocktail",
    label: "Cocktail Party Wear",
    href: "/saris/cocktail-party-wear-sarees",
    products: makeProducts("cocktail-party-wear-sarees", ["cp-01", "cp-02", "cp-03", "cp-04", "cp-05"]),
  },
];
