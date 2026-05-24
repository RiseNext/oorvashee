import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  mobileNavOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  mobileNavOpen: false,
  searchOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  closeAll: () =>
    set({ cartOpen: false, mobileNavOpen: false, searchOpen: false }),
}));
