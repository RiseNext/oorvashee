import { create } from "zustand";

/**
 * Global control for the custom auth modal (replaces full-page sign-in nav).
 *
 * `redirectTo` is where the user lands after a successful sign-in/sign-up —
 * e.g. `/checkout` when they hit "Proceed to Checkout" as a guest, `/account`
 * from the profile icon. It also becomes Clerk's `redirectUrlComplete` for the
 * Google OAuth round-trip, so the destination survives the full-page redirect.
 */
interface AuthModalState {
  open: boolean;
  /** Path to push after auth completes (null → stay on the current page). */
  redirectTo: string | null;
  openAuth: (redirectTo?: string | null) => void;
  closeAuth: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  open: false,
  redirectTo: null,
  openAuth: (redirectTo = null) => set({ open: true, redirectTo }),
  closeAuth: () => set({ open: false }),
}));
