import type { Product } from "@/components/shared/product-card";

export interface SareeCategory {
  id: string;
  label: string;
  href: string;
  products: Product[];
}

const TEST_PRODUCT: Product = {
  id: "ct-29",
  code: "SSS-29",
  name: "linen printed",
  price: 499,
  image: "/images/products/sss-29.jpg",
  href: "/saris/cotton-sarees/sss-29",
  category: "Cotton",
};

export const SAREE_COLLECTIONS: SareeCategory[] = [
  {
    id: "kanchipattu",
    label: "Kanchipattu Sarees",
    href: "/saris/kanchi-pattu-saree",
    products: [
      { ...TEST_PRODUCT, id: "kp-01" },
      { ...TEST_PRODUCT, id: "kp-02" },
      { ...TEST_PRODUCT, id: "kp-03" },
      { ...TEST_PRODUCT, id: "kp-04" },
      { ...TEST_PRODUCT, id: "kp-05" },
    ],
  },
  {
    id: "banaras",
    label: "Banaras Sarees",
    href: "/saris/banaras-sarees",
    products: [
      { ...TEST_PRODUCT, id: "bn-01" },
      { ...TEST_PRODUCT, id: "bn-02" },
      { ...TEST_PRODUCT, id: "bn-03" },
      { ...TEST_PRODUCT, id: "bn-04" },
      { ...TEST_PRODUCT, id: "bn-05" },
    ],
  },
  {
    id: "cotton",
    label: "Cotton Sarees",
    href: "/saris/cotton-sarees",
    products: [
      { ...TEST_PRODUCT, id: "ct-01" },
      { ...TEST_PRODUCT, id: "ct-02" },
      { ...TEST_PRODUCT, id: "ct-03" },
      { ...TEST_PRODUCT, id: "ct-04" },
      { ...TEST_PRODUCT, id: "ct-05" },
    ],
  },
  {
    id: "designer",
    label: "Designer Sarees",
    href: "/saris/designer-sarees",
    products: [
      { ...TEST_PRODUCT, id: "ds-01" },
      { ...TEST_PRODUCT, id: "ds-02" },
      { ...TEST_PRODUCT, id: "ds-03" },
      { ...TEST_PRODUCT, id: "ds-04" },
      { ...TEST_PRODUCT, id: "ds-05" },
    ],
  },
  {
    id: "cocktail",
    label: "Cocktail Party Wear",
    href: "/saris/cocktail-party-wear-sarees",
    products: [
      { ...TEST_PRODUCT, id: "cp-01" },
      { ...TEST_PRODUCT, id: "cp-02" },
      { ...TEST_PRODUCT, id: "cp-03" },
      { ...TEST_PRODUCT, id: "cp-04" },
      { ...TEST_PRODUCT, id: "cp-05" },
    ],
  },
];
