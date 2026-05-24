import { clientEnv } from "@/lib/env";
import type {
  Collection,
  Paginated,
  Product,
  ProductListQuery,
  ProductSummary,
} from "@/types";
import { apiFetch } from "./client";
import { mockCollections, mockProducts } from "./mock-data";

const useMock = clientEnv.NEXT_PUBLIC_USE_MOCK_API;

function toSummary(p: Product): ProductSummary {
  const { description, story, images, variants, attributes, ...summary } = p;
  void description;
  void story;
  void images;
  void variants;
  void attributes;
  return summary;
}

function paginate<T>(items: T[], page = 1, pageSize = 12): Paginated<T> {
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

export async function listProducts(
  query: ProductListQuery = {},
): Promise<Paginated<ProductSummary>> {
  if (useMock) {
    let items = mockProducts.map(toSummary);
    if (query.collection) {
      items = items.filter((p) => p.collection?.slug === query.collection);
    }
    if (query.fabric?.length) {
      items = items.filter(
        (p) => p.fabric && query.fabric!.includes(p.fabric),
      );
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
  return apiFetch<Paginated<ProductSummary>>("/products", {
    query: {
      collection: query.collection,
      fabric: query.fabric,
      priceMin: query.priceMin,
      priceMax: query.priceMax,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    },
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (useMock) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
  return apiFetch<Product>(`/products/${slug}`);
}

export async function listCollections(): Promise<Collection[]> {
  if (useMock) return mockCollections;
  return apiFetch<Collection[]>("/collections");
}

export async function getCollectionBySlug(
  slug: string,
): Promise<Collection | null> {
  if (useMock) {
    return mockCollections.find((c) => c.slug === slug) ?? null;
  }
  return apiFetch<Collection>(`/collections/${slug}`);
}

export async function getFeaturedProducts(
  limit = 4,
): Promise<ProductSummary[]> {
  if (useMock) return mockProducts.slice(0, limit).map(toSummary);
  return apiFetch<ProductSummary[]>("/products/featured", { query: { limit } });
}
