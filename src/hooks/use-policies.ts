"use client";

import { useQuery } from "@tanstack/react-query";

import { listPolicies } from "@/lib/api/policies";
import { PRODUCT_POLICIES } from "@/config/policies";

/**
 * Active store policies for client components (product page, cart, checkout).
 *
 * Seeds with the static config set as `initialData` so the accordion renders
 * instantly and never flashes empty, then swaps in the admin-managed copy from
 * the backend once it resolves. Policies change rarely → long stale time.
 */
export function usePolicies() {
  return useQuery({
    queryKey: ["policies"],
    queryFn: listPolicies,
    initialData: PRODUCT_POLICIES,
    staleTime: 5 * 60_000,
  });
}
