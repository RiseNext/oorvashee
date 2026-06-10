/**
 * Product mappers — the ONLY place backend product field names appear in
 * domain code. Backend wire DTO → frontend domain type.
 *
 * If the backend renames a field, only this file changes.
 */
import type {
  BackendPage,
  BackendProductListItem,
  BackendProductRead,
  BackendProductSort,
  BackendVariant,
} from "@/types/api";
import type {
  Paginated,
  Product,
  ProductImage,
  ProductSummary,
  ProductVariant,
} from "@/types/product";

/** Shown only for products with no image — seeded data always has one. */
export const PLACEHOLDER_IMAGE = "/placeholder.svg";

/** Parse a backend decimal-string (or number) to a JS number. */
export function toNumber(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function deriveBadges(opts: {
  isNew: boolean;
  isBestseller: boolean;
  price: number;
  compareAtPrice?: number;
}): ProductSummary["badges"] {
  const badges: NonNullable<ProductSummary["badges"]> = [];
  if (opts.isNew) badges.push("new");
  if (opts.isBestseller) badges.push("bestseller");
  if (opts.compareAtPrice && opts.compareAtPrice > opts.price) badges.push("sale");
  return badges.length > 0 ? badges : undefined;
}

export function mapProductSummary(dto: BackendProductListItem): ProductSummary {
  const price = toNumber(dto.base_price);
  const compareAtPrice = dto.mrp != null ? toNumber(dto.mrp) : undefined;
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.name,
    price,
    compareAtPrice,
    currency: dto.currency,
    image: { url: dto.primary_image_url ?? PLACEHOLDER_IMAGE, alt: dto.name },
    badges: deriveBadges({
      isNew: dto.is_new,
      isBestseller: dto.is_bestseller,
      price,
      compareAtPrice,
    }),
    available: dto.available,
  };
}

export function mapVariant(dto: BackendVariant): ProductVariant {
  const label =
    [dto.color, dto.fabric, dto.size].filter(Boolean).join(" · ") || dto.sku;
  const options: Record<string, string> = {};
  if (dto.color) options.color = dto.color;
  if (dto.fabric) options.fabric = dto.fabric;
  if (dto.size) options.size = dto.size;
  return {
    id: dto.id,
    sku: dto.sku,
    title: label,
    price: toNumber(dto.price),
    inStock: dto.available,
    availableQuantity: dto.available_quantity,
    availabilityState: dto.availability_state,
    options,
  };
}

export function mapProduct(dto: BackendProductRead): Product {
  const price = toNumber(dto.base_price);
  const compareAtPrice = dto.mrp != null ? toNumber(dto.mrp) : undefined;

  const images: ProductImage[] = [...dto.images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ url: img.url, alt: img.alt_text ?? dto.name }));

  const primary =
    dto.images.find((i) => i.is_primary) ?? dto.images[0] ?? null;

  // Compose the `attributes` object the UI expects from the backend's
  // categories + tags + first variant. Backend has no `attributes` blob.
  const fabricCategory = dto.categories.find((c) => c.kind === "fabric");
  const regionCategory = dto.categories.find((c) => c.kind === "region");
  const occasionCategory = dto.categories.find((c) => c.kind === "occasion");
  const firstVariant = dto.variants[0];

  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.name,
    code: dto.code ?? undefined,
    price,
    compareAtPrice,
    currency: dto.currency,
    image: {
      url: primary?.url ?? PLACEHOLDER_IMAGE,
      alt: primary?.alt_text ?? dto.name,
    },
    badges: deriveBadges({
      isNew: dto.is_new,
      isBestseller: dto.is_bestseller,
      price,
      compareAtPrice,
    }),
    available: dto.available,
    fabric: fabricCategory?.name ?? firstVariant?.fabric ?? undefined,
    description: dto.description ?? dto.short_description ?? "",
    story: dto.short_description ?? undefined,
    images: images.length > 0 ? images : [{ url: PLACEHOLDER_IMAGE, alt: dto.name }],
    variants: dto.variants.map(mapVariant),
    tags: dto.tags,
    categories: dto.categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      kind: c.kind,
    })),
    seo: {
      title: dto.seo_title ?? undefined,
      description: dto.seo_description ?? undefined,
    },
    attributes: {
      fabric: fabricCategory?.name ?? firstVariant?.fabric ?? undefined,
      region: regionCategory?.name ?? undefined,
      occasion: occasionCategory?.name ?? undefined,
    },
  };
}

/**
 * Convert a backend offset `Page[T]` into the frontend's `Paginated<T>`.
 * `page` / `pageSize` come from the REQUEST (the backend echoes neither);
 * `totalPages` is derived.
 */
export function mapPage<TIn, TOut>(
  page: BackendPage<TIn>,
  mapItem: (item: TIn) => TOut,
  req: { page: number; pageSize: number },
): Paginated<TOut> {
  const total = page.total ?? page.items.length;
  return {
    items: page.items.map(mapItem),
    page: req.page,
    pageSize: req.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / req.pageSize)),
  };
}

/** Frontend sort value → backend `?sort=`. */
export function mapSort(
  sort: string | undefined,
): BackendProductSort | undefined {
  switch (sort) {
    case "price-asc":
      return "price_asc";
    case "price-desc":
      return "price_desc";
    case "popular":
      return "bestseller";
    case "newest":
      return "new";
    default:
      return undefined;
  }
}
