import type { Product } from "@/components/shared/product-card";

export interface ProductColor {
  label: string;
  swatch: string;
}

/**
 * Structured variant the storefront PDP needs to render a selector and
 * live-update price/SKU/availability. Derived from the domain `ProductVariant`
 * in `adapt.ts` — keeps backward compat by ALWAYS providing this list (empty
 * for products with no variants); the buy-zone gates UI on `length >= 2`.
 */
export interface ProductVariantOption {
  id: string;
  sku: string;
  /** Human label: "Red · Silk · M" if axes present, else falls back to SKU. */
  label: string;
  price: number;
  available: boolean;
  isDefault: boolean;
}

export interface ProductDetailData {
  id: string;
  slug: string;
  category: string;
  categorySlug: string;
  name: string;
  code: string;
  price: number;
  mrp?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  fabrics: string[];
  /**
   * Every active variant in display order. Includes id, label, price,
   * availability — buy-zone uses this to render a flat picker fallback when
   * no color/size/fabric axes are populated, and to drive live price/stock.
   */
  variants: ProductVariantOption[];
  description: string;
  specification: { label: string; value: string }[];
  returnPolicy: string;
  shippingInfo: string;
  manufacturedBy: string;
  customerCare: string;
}

export const MOCK_PRODUCT_DETAIL: ProductDetailData = {
  id: "sss-29",
  slug: "sss-29",
  category: "Cotton Sarees",
  categorySlug: "cotton-sarees",
  name: "SSS-29 Linen Printed Saree",
  code: "SSS-29",
  price: 499,
  mrp: 999,
  rating: 4,
  reviewCount: 128,
  images: [
    "/images/products/sss-29.jpg",
    "/images/products/sss-29.jpg",
    "/images/products/sss-29.jpg",
    "/images/products/sss-29.jpg",
  ],
  sizes: ["S", "M", "L", "XL"],
  // Mock fixture only — real PDP fills this from adapt.ts.
  variants: [],
  colors: [
    { label: "Ivory", swatch: "/images/products/sss-29.jpg" },
    { label: "Dusty Rose", swatch: "/images/products/sss-29.jpg" },
    { label: "Teal Green", swatch: "/images/products/sss-29.jpg" },
    { label: "Midnight Blue", swatch: "/images/products/sss-29.jpg" },
  ],
  fabrics: ["Linen", "Cotton Blend", "Pure Silk"],
  description: `A timeless linen printed saree that effortlessly blends tradition with comfort. Featuring a delicate block-print pattern inspired by traditional motifs from South India, this saree is perfect for daily wear, festive gatherings, or cultural celebrations.

The soft linen fabric ensures breathability and ease of draping, making it a favourite across seasons. Each piece is individually crafted, ensuring subtle variations that speak to its handmade origins.`,
  specification: [
    { label: "Fabric", value: "Linen (60% Linen, 40% Cotton)" },
    { label: "Saree Length", value: "5.5 metres + 0.8 m blouse piece" },
    { label: "Width", value: "44 inches" },
    { label: "Weight", value: "Approx. 400 g" },
    { label: "Blouse Piece", value: "Included" },
    { label: "Print Type", value: "Block Print" },
    { label: "Occasion", value: "Casual, Festive, Daily Wear" },
    { label: "Origin", value: "Kanchipuram, Tamil Nadu" },
  ],
  returnPolicy: `We accept returns within 7 days of delivery, provided the item is unused, unwashed, and in original packaging with all tags intact.

To initiate a return, contact us at hello@oorvashee.com with your order number. Exchange requests are processed within 5–7 business days of receiving the returned item.`,
  shippingInfo: `Orders are dispatched within 1–2 business days.\n\nEstimated delivery:\n• Metro cities: 2–4 business days\n• Tier 2 / Tier 3: 4–7 business days\n• International: 10–14 business days\n\nFree shipping on orders above ₹3,000.`,
  manufacturedBy: `Oorvashee Saree House\nKanchipuram, Tamil Nadu — 631 501\nGSTIN: 22AAAAA0000A1Z5`,
  customerCare: `Email: hello@oorvashee.com\nPhone / WhatsApp: +91 00000 00000\nMon–Sat, 10 AM – 7 PM IST`,
};

const _BASE: Omit<Product, "id" | "href"> = {
  code: "SSS-29",
  name: "linen printed",
  price: 499,
  mrp: 999,
  image: "/images/products/sss-29.jpg",
  category: "Cotton",
};

export const SIMILAR_PRODUCTS: Omit<Product, "href">[] = Array.from({ length: 8 }, (_, i) => ({
  ..._BASE,
  id: `sim-${i + 1}`,
  mrp: i % 2 === 0 ? 999 : undefined,
}));

export const YMAL_PRODUCTS: Omit<Product, "href">[] = Array.from({ length: 8 }, (_, i) => ({
  ..._BASE,
  id: `ymal-${i + 1}`,
}));
