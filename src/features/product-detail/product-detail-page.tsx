"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/features/navbar";
import { ImageGallery } from "./image-gallery";
import { BuyZone } from "./buy-zone";
import { AccordionSections } from "./accordion-sections";
import { StickyHeader } from "./sticky-header";
import { ProductsSection } from "./products-section";
import { BrandStory } from "./brand-story";
import { ReviewsSection } from "./reviews-section";
import type { Product } from "@/components/shared/product-card";
import type { ProductDetailData } from "./data";
import { SIMILAR_PRODUCTS, YMAL_PRODUCTS } from "./data";
import { siteConfig, type NavItem } from "@/config/site";

// Flatten all nav entries once at module level so renders are cheap
function flattenNav(items: readonly NavItem[]): { href: string; label: string }[] {
  return items.flatMap((item) => [
    { href: item.href, label: item.label },
    ...(item.children ? flattenNav(item.children) : []),
  ]);
}
const ALL_NAV_ITEMS = flattenNav(siteConfig.nav);

// Attach the correct category-scoped href to each related product
function withHref(products: Omit<Product, "href">[], basePath: string): Product[] {
  return products.map((p) => ({ ...p, href: `${basePath}/${p.id}` }));
}

export function ProductDetailPage({ product }: { product: ProductDetailData }) {
  const pathname = usePathname();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Derive category from URL: strip last segment (product slug) to get the parent path.
  // Works for /saris/{category}/{slug}, /new-arrivals/{slug}, etc.
  const segments = pathname.split("/").filter(Boolean);
  const parentPath = segments.length > 1 ? "/" + segments.slice(0, -1).join("/") : "/";
  const parentNav = ALL_NAV_ITEMS.find((n) => n.href === parentPath);
  const resolvedProduct: ProductDetailData = {
    ...product,
    // Store the full parent href so BuyZone can use it directly as a Link href
    categorySlug: parentPath,
    category: parentNav?.label ?? product.category,
  };

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
        onSizeChange={setSelectedSize}
        onColorChange={setSelectedColor}
        onFabricChange={setSelectedFabric}
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
                quantity={quantity}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
                onFabricChange={setSelectedFabric}
                onQuantityChange={setQuantity}
              />
              <AccordionSections product={product} />
            </div>
          </div>
        </div>

        {/* ── Similar Products ── */}
        <div className="bg-bg-secondary">
          <ProductsSection
            heading="Similar Products"
            products={withHref(SIMILAR_PRODUCTS, resolvedProduct.categorySlug)}
            viewAllHref={resolvedProduct.categorySlug}
            headingStyle="dark-bar"
            layout="scroll"
          />
        </div>

        {/* ── Brand Story ── */}
        <BrandStory />

        {/* ── You May Also Like ── */}
        <div className="bg-bg-secondary">
          <ProductsSection
            heading="You May Also Like"
            products={withHref(YMAL_PRODUCTS, resolvedProduct.categorySlug)}
            headingStyle="serif"
            layout="scroll"
          />
        </div>

        {/* ── Reviews ── */}
        <ReviewsSection />
      </main>
    </>
  );
}
