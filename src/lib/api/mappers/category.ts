/**
 * Category mappers. The frontend's "Collection" concept maps to the
 * backend's `kind=collection` categories. The backend has no `/collections`
 * endpoint — `/categories` returns all kinds grouped.
 */
import type {
  BackendCategoryGroup,
  BackendCategorySummary,
} from "@/types/api";
import type { Collection } from "@/types/product";

export function mapCategoryToCollection(dto: BackendCategorySummary): Collection {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.name,
    description: dto.description ?? undefined,
  };
}

/** Flatten every kind into a single list (e.g. for a full category index). */
export function flattenCategoryGroup(
  group: BackendCategoryGroup,
): BackendCategorySummary[] {
  return [
    ...group.fabric,
    ...group.occasion,
    ...group.region,
    ...group.price_bracket,
    ...group.color,
    ...group.collection,
  ];
}

/** The UI's "collections" = backend categories of kind `collection`. */
export function mapCollections(group: BackendCategoryGroup): Collection[] {
  return group.collection.map(mapCategoryToCollection);
}
