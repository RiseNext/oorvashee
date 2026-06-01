"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Navbar } from "@/features/navbar";
import { ImageGallery } from "./image-gallery";
import { BuyZone } from "./buy-zone";
import { AccordionSections } from "./accordion-sections";
import { PolicyAccordion } from "@/components/shared/policy-accordion";
import { StickyHeader } from "./sticky-header";
import { ProductsSection } from "./products-section";
import { BrandStory } from "./brand-story";
import { ReviewsSection } from "./reviews-section";
import type { Product as CardProduct } from "@/components/shared/product-card";
import type { ProductDetailData } from "./data";
import { SIMILAR_PRODUCTS, YMAL_PRODUCTS } from "./data";
import { useCart } from "@/hooks/use-cart";
import { useAuthActions } from "@/features/auth/use-auth-actions";
import { PLACEHOLDER_IMAGE } from "@/lib/api/mappers";
import type { ProductColor } from "./data";
import type { ProductVariant } from "@/types/product";

// Fallback only: attach an href to the legacy mock fixtures used when no real
// related products are supplied (offline mock mode). Real related products
// arrive already carrying canonical `/product/[slug]` hrefs.
function withHref(products: Omit<CardProduct, "href">[], basePath: string): CardProduct[] {
  return products.map((p) => ({ ...p, href: `${basePath}/${p.id}` }));
}

/** Resolve the selected colour/fabric/size combination to a concrete variant. */
function resolveVariant(
  variants: ProductVariant[] | undefined,
  colors: ProductColor[],
  selectedColor: number | null,
  selectedFabric: string | null,
  selectedSize: string | null,
): ProductVariant | undefined {
  if (!variants || variants.length === 0) return undefined;
  const colorLabel = selectedColor != null ? colors[selectedColor]?.label : undefined;
  const match = variants.find(
    (v) =>
      (!colorLabel || v.options.color === colorLabel) &&
      (!selectedFabric || v.options.fabric === selectedFabric) &&
      (!selectedSize || v.options.size === selectedSize),
  );
  return match ?? variants[0];
}

export interface ProductDetailPageProps {
  product: ProductDetailData;
  /** Domain variants (id + options + stock) — drives add-to-cart resolution. */
  variants?: ProductVariant[];
  /** Canonical category href for the breadcrumb + "View all" (e.g. `/saris/banaras-sarees`). */
  categoryHref?: string;
  /** Category label for the breadcrumb (e.g. "Banaras Sarees"). */
  categoryLabel?: string;
  /** Real "similar" products. Cards already carry `/product/[slug]` hrefs. */
  similar?: CardProduct[];
  /** Real "you may also like" products. */
  youMayAlsoLike?: CardProduct[];
}

export function ProductDetailPage({
  product,
  variants,
  categoryHref,
  categoryLabel,
  similar,
  youMayAlsoLike,
}: ProductDetailPageProps) {
  // Default to the first colour so a variant always resolves for add-to-cart.
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(
    product.colors.length > 0 ? 0 : null,
  );
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  // Explicit pick from the flat variant fallback picker (shown when the
  // product has variants but no color/size/fabric axes). When null, axis
  // resolution drives the selection. Cleared whenever an axis changes so the
  // axis pickers always win for axis-driven products.
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [adding, setAdding] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { addItem } = useCart();
  // "Buy Now" adds to the bag, then routes to checkout — auth-gated like the
  // cart CTA (guests sign in first, then continue to /checkout).
  const { requireAuth } = useAuthActions();

  // Variant resolution: explicit manual pick wins; otherwise axis-based.
  // Falls through to the first variant when neither is set so add-to-cart
  // always has a target.
  const variant = (() => {
    if (selectedVariantId && variants) {
      const explicit = variants.find((v) => v.id === selectedVariantId);
      if (explicit) return explicit;
    }
    return resolveVariant(variants, product.colors, selectedColor, selectedFabric, selectedSize);
  })();
  const outOfStock = variant ? variant.inStock === false : false;
  const canBuy = Boolean(variant) && !outOfStock;

  // Axis-change wrappers clear the manual pick so axis selection takes over.
  function handleSizeChange(s: string) {
    setSelectedVariantId(null);
    setSelectedSize(s);
  }
  function handleColorChange(i: number) {
    setSelectedVariantId(null);
    setSelectedColor(i);
  }
  function handleFabricChange(f: string) {
    setSelectedVariantId(null);
    setSelectedFabric(f);
  }

  async function handleAddToCart(buyNow: boolean) {
    if (!variant || outOfStock) {
      toast.error(outOfStock ? "This piece just sold out." : "Please select your options.");
      return;
    }
    setAdding(true);
    try {
      await addItem({
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        title: product.name,
        variantLabel: variant.title,
        image: { url: product.images[0] ?? PLACEHOLDER_IMAGE, alt: product.name },
        unitPrice: variant.price || product.price,
        quantity,
      });
      if (buyNow) requireAuth("/checkout");
    } finally {
      setAdding(false);
    }
  }

  // Category linking comes from the server (which knows the product's real
  // category), falling back to whatever the adapter put on the product.
  const resolvedProduct: ProductDetailData = {
    ...product,
    categorySlug: categoryHref ?? product.categorySlug,
    category: categoryLabel ?? product.category,
  };

  const similarProducts =
    similar ?? withHref(SIMILAR_PRODUCTS, resolvedProduct.categorySlug);
  const ymalProducts =
    youMayAlsoLike ?? withHref(YMAL_PRODUCTS, resolvedProduct.categorySlug);

  /* Show sticky header once the buy zone scrolls out of view */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-60px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      <StickyHeader
        product={resolvedProduct}
        visible={stickyVisible}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
        selectedFabric={selectedFabric}
        currentVariantId={variant?.id ?? null}
        onSizeChange={handleSizeChange}
        onColorChange={handleColorChange}
        onFabricChange={handleFabricChange}
        onAddToCart={() => handleAddToCart(false)}
        adding={adding}
        canBuy={canBuy}
      />

      <main className="bg-bg-primary">
        {/* ── Hero buy zone ── */}
        <div
          ref={heroRef}
          className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12 xl:gap-16">
            {/* Left: sticky image gallery */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Right: buy zone + accordions */}
            <div>
              <BuyZone
                product={resolvedProduct}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                selectedFabric={selectedFabric}
                currentVariantId={variant?.id ?? null}
                onVariantChange={setSelectedVariantId}
                quantity={quantity}
                onSizeChange={handleSizeChange}
                onColorChange={handleColorChange}
                onFabricChange={handleFabricChange}
                onQuantityChange={setQuantity}
                onAddToCart={() => handleAddToCart(false)}
                onBuyNow={() => handleAddToCart(true)}
                adding={adding}
                canBuy={canBuy}
                outOfStock={outOfStock}
              />
              <AccordionSections product={product} />
              <PolicyAccordion className="mt-6" />
            </div>
          </div>
        </div>

        {/* ── Similar Products ── */}
        {similarProducts.length > 0 && (
          <div className="bg-bg-secondary">
            <ProductsSection
              heading="Similar Products"
              products={similarProducts}
              viewAllHref={resolvedProduct.categorySlug}
              headingStyle="dark-bar"
              layout="scroll"
            />
          </div>
        )}

        {/* ── Brand Story ── */}
        <BrandStory />

        {/* ── You May Also Like ── */}
        {ymalProducts.length > 0 && (
          <div className="bg-bg-secondary">
            <ProductsSection
              heading="You May Also Like"
              products={ymalProducts}
              headingStyle="serif"
              layout="scroll"
            />
          </div>
        )}

        {/* ── Reviews ── */}
        <ReviewsSection />
      </main>
    </>
  );
}
