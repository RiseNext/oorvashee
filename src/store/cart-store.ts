import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, CartTotals } from "@/types";

interface CartState {
  lines: CartLine[];
  appliedCouponCode?: string;
  addLine: (line: Omit<CartLine, "id">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
}

function makeLineId(productId: string, variantId: string) {
  return `${productId}::${variantId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      appliedCouponCode: undefined,
      addLine: (line) =>
        set((state) => {
          const id = makeLineId(line.productId, line.variantId);
          const existing = state.lines.find((l) => l.id === id);
          if (existing) {
            const next = Math.min(
              existing.quantity + line.quantity,
              existing.maxQuantity ?? 99,
            );
            return {
              lines: state.lines.map((l) =>
                l.id === id ? { ...l, quantity: next } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, id }] };
        }),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.id === lineId
                ? { ...l, quantity: Math.max(0, quantity) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.id !== lineId),
        })),
      clear: () => set({ lines: [], appliedCouponCode: undefined }),
      applyCoupon: (code) => set({ appliedCouponCode: code }),
      removeCoupon: () => set({ appliedCouponCode: undefined }),
    }),
    {
      name: "urosi:cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export function selectCartCount(state: CartState) {
  return state.lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function selectCartTotals(state: CartState): CartTotals {
  const subtotal = state.lines.reduce(
    (sum, l) => sum + l.unitPrice * l.quantity,
    0,
  );
  const compareSubtotal = state.lines.reduce(
    (sum, l) => sum + (l.compareAtUnitPrice ?? l.unitPrice) * l.quantity,
    0,
  );
  const discount = Math.max(0, compareSubtotal - subtotal);
  const shipping = subtotal === 0 || subtotal >= 2999 ? 0 : 149;
  const tax = 0;
  const total = subtotal + shipping + tax;
  return { subtotal, discount, shipping, tax, total };
}
