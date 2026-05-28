/**
 * Order reads. Guest tracking (`/orders/{number}?email=`) is anonymous;
 * account history (`/account/orders`) needs a Bearer. Both go through
 * `authedFetch` (token attached when present, ignored otherwise).
 */
import type { BackendOrder, BackendPage } from "@/types/api";
import type { Order } from "@/types/order";
import type { Paginated } from "@/types/product";
import type { AuthedFetch } from "./client";
import { mapPage } from "./mappers/product";
import { mapOrder } from "./mappers/order";

export function getOrderByNumber(
  af: AuthedFetch,
  orderNumber: string,
  email: string,
): Promise<Order> {
  return af<BackendOrder>(`/orders/${orderNumber}`, {
    query: { email },
  }).then(mapOrder);
}

export function fetchAccountOrders(
  af: AuthedFetch,
  page = 1,
  pageSize = 20,
): Promise<Paginated<Order>> {
  return af<BackendPage<BackendOrder>>("/account/orders", {
    query: { page, page_size: pageSize },
  }).then((p) => mapPage(p, mapOrder, { page, pageSize }));
}

export function fetchAccountOrder(
  af: AuthedFetch,
  orderNumber: string,
): Promise<Order> {
  return af<BackendOrder>(`/account/orders/${orderNumber}`).then(mapOrder);
}
