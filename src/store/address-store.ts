import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Client-side address book. The backend has no customer address-CRUD endpoint
 * (addresses are snapshotted per order at checkout), so this persists the
 * shopper's OWN addresses locally to pre-fill checkout — real user data, not
 * fabricated. When a backend `/account/addresses` API lands, swap this store
 * for a TanStack-backed source behind the same `useAddresses` shape.
 */
export interface SavedAddress {
  id: string;
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type SavedAddressInput = Omit<SavedAddress, "id" | "isDefault">;

interface AddressState {
  addresses: SavedAddress[];
  add: (input: SavedAddressInput, makeDefault?: boolean) => SavedAddress;
  update: (id: string, input: SavedAddressInput) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `addr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export const useAddressStore = create<AddressState>()(
  persist(
    (set) => ({
      addresses: [],
      add: (input, makeDefault) => {
        const created: SavedAddress = { ...input, id: newId(), isDefault: false };
        set((state) => {
          const first = state.addresses.length === 0;
          const isDefault = Boolean(makeDefault) || first;
          const addresses = isDefault
            ? state.addresses.map((a) => ({ ...a, isDefault: false }))
            : [...state.addresses];
          return { addresses: [...addresses, { ...created, isDefault }] };
        });
        return created;
      },
      update: (id, input) =>
        set((state) => ({
          addresses: state.addresses.map((a) => (a.id === id ? { ...a, ...input } : a)),
        })),
      remove: (id) =>
        set((state) => {
          const remaining = state.addresses.filter((a) => a.id !== id);
          // Keep a default if we removed the default one.
          if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
            remaining[0] = { ...remaining[0], isDefault: true };
          }
          return { addresses: remaining };
        }),
      setDefault: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),
    }),
    {
      name: "oorvashee:addresses",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
