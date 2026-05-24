import { useQuery } from "@tanstack/react-query";
import {
  getCollectionBySlug,
  getFeaturedProducts,
  getProductBySlug,
  listCollections,
  listProducts,
} from "@/lib/api/products";
import type { ProductListQuery } from "@/types";

export const productKeys = {
  all: ["products"] as const,
  list: (query: ProductListQuery) => ["products", "list", query] as const,
  detail: (slug: string) => ["products", "detail", slug] as const,
  featured: (limit: number) => ["products", "featured", limit] as const,
};

export const collectionKeys = {
  all: ["collections"] as const,
  detail: (slug: string) => ["collections", slug] as const,
};

export function useProductList(query: ProductListQuery = {}) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => listProducts(query),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: productKeys.detail(slug ?? ""),
    queryFn: () => getProductBySlug(slug as string),
    enabled: Boolean(slug),
  });
}

export function useFeaturedProducts(limit = 4) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => getFeaturedProducts(limit),
  });
}

export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.all,
    queryFn: listCollections,
  });
}

export function useCollection(slug: string | undefined) {
  return useQuery({
    queryKey: collectionKeys.detail(slug ?? ""),
    queryFn: () => getCollectionBySlug(slug as string),
    enabled: Boolean(slug),
  });
}
