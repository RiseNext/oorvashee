import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "@/types";

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

// NB: cart counts/subtotals are derived in `useCart` (unified guest+server).
// Authoritative shipping/tax/discount come from `/checkout/quote` (F4) — there
// is intentionally no client-side shipping math here anymore.
