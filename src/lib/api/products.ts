import { clientEnv } from "@/lib/env";
import type {
  Collection,
  Paginated,
  Product,
  ProductListQuery,
  ProductSummary,
} from "@/types";
import type {
  BackendCategoryGroup,
  BackendPage,
  BackendProductListItem,
  BackendProductRead,
} from "@/types/api";
import { apiFetch } from "./client";
import { ApiError } from "./errors";
import {
  flattenCategoryGroup,
  mapCategoryToCollection,
  mapCollections,
  mapPage,
  mapProduct,
  mapProductSummary,
  mapSort,
} from "./mappers";
import { mockCollections, mockProducts } from "./mock-data";

const useMock = clientEnv.NEXT_PUBLIC_USE_MOCK_API;

const DEFAULT_PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Mock helpers (unchanged — keeps the UI byte-identical while mock is on)
// ---------------------------------------------------------------------------

function toSummary(p: Product): ProductSummary {
  const { description, story, images, variants, attributes, ...summary } = p;
  void description;
  void story;
  void images;
  void variants;
  void attributes;
  return summary;
}

function paginate<T>(items: T[], page = 1, pageSize = DEFAULT_PAGE_SIZE): Paginated<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total,
    totalPages,
  };
}

// ---------------------------------------------------------------------------
// Public API — mock branch preserved; real branch goes through mappers
// ---------------------------------------------------------------------------

export async function listProducts(
  query: ProductListQuery = {},
): Promise<Paginated<ProductSummary>> {
  if (useMock) {
    let items = mockProducts.map(toSummary);
    if (query.q) {
      const needle = query.q.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(needle) ||
          p.fabric?.toLowerCase().includes(needle) ||
          p.collection?.title.toLowerCase().includes(needle),
      );
    }
    if (query.collection) {
      items = items.filter((p) => p.collection?.slug === query.collection);
    }
    if (query.fabric?.length) {
      items = items.filter((p) => p.fabric && query.fabric!.includes(p.fabric));
    }
    if (typeof query.priceMin === "number") {
      items = items.filter((p) => p.price >= query.priceMin!);
    }
    if (typeof query.priceMax === "number") {
      items = items.filter((p) => p.price <= query.priceMax!);
    }
    switch (query.sort) {
      case "price-asc":
        items = [...items].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items = [...items].sort((a, b) => b.price - a.price);
        break;
      case "popular":
        items = [...items].sort(
          (a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
        );
        break;
      default:
        break;
    }
    return paginate(items, query.page, query.pageSize);
  }

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const category =
    query.categorySlugs && query.categorySlugs.length > 0
      ? query.categorySlugs
      : query.collection;
  const res = await apiFetch<BackendPage<BackendProductListItem>>("/products", {
    query: {
      q: query.q,
      category,
      min_price: query.priceMin,
      max_price: query.priceMax,
      sort: mapSort(query.sort),
      page,
      page_size: pageSize,
    },
  });
  return mapPage(res, mapProductSummary, { page, pageSize });
}

/**
 * Related products for the PDP "Similar" / "You may also like" rails. Pulls
 * from the product's primary fabric category (or the newest catalog when the
 * product has none), excluding the product itself.
 */
export async function getRelatedProducts(
  product: Product,
  limit = 8,
): Promise<ProductSummary[]> {
  if (useMock) {
    return mockProducts
      .map(toSummary)
      .filter((p) => p.slug !== product.slug)
      .slice(0, limit);
  }
  const fabric = product.categories?.find((c) => c.kind === "fabric");
  const res = await apiFetch<BackendPage<BackendProductListItem>>("/products", {
    query: {
      category: fabric ? [fabric.slug] : undefined,
      page: 1,
      // Over-fetch by one so dropping the current product still fills the rail.
      page_size: limit + 1,
    },
  });
  return res.items
    .map(mapProductSummary)
    .filter((p) => p.slug !== product.slug)
    .slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (useMock) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    const dto = await apiFetch<BackendProductRead>(`/products/${slug}`);
    return mapProduct(dto);
  } catch (error) {
    // Unknown slug → 404 → null so the route can render notFound().
    // (Archived products return 200 with available=false, not 404 — those
    // still map and the UI shows the "unavailable" state.)
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function listCollections(): Promise<Collection[]> {
  if (useMock) return mockCollections;
  const group = await apiFetch<BackendCategoryGroup>("/categories");
  return mapCollections(group);
}

export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | null> {
  if (useMock) {
    return mockCollections.find((c) => c.slug === slug) ?? null;
  }
  // Backend has no per-collection detail endpoint; resolve from the grouped
  // categories response (any kind, not just `collection`).
  const group = await apiFetch<BackendCategoryGroup>("/categories");
  const match = flattenCategoryGroup(group).find((c) => c.slug === slug);
  return match ? mapCategoryToCollection(match) : null;
}

export async function getFeaturedProducts(
  limit = 4,
): Promise<ProductSummary[]> {
  if (useMock) return mockProducts.slice(0, limit).map(toSummary);
  // No dedicated /products/featured endpoint — use the sort param.
  const res = await apiFetch<BackendPage<BackendProductListItem>>("/products", {
    query: { sort: "featured", page: 1, page_size: limit },
  });
  return res.items.map(mapProductSummary);
}
