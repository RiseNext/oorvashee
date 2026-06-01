"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/lib/auth/use-auth-session";
import { CLERK_ENABLED } from "@/lib/auth/config";
import { useAuthModalStore } from "./auth-modal-store";

/**
 * Auth-gated navigation. `requireAuth(dest)` sends signed-in users straight to
 * `dest`; guests get the custom auth modal first, then land on `dest` after
 * verifying. Used by the profile icon (`/account`) and the checkout CTAs
 * (`/checkout`). Browsing and cart stay fully guest-accessible.
 *
 * When the session is still restoring, or Clerk is disabled, we just navigate —
 * the destination page guards itself, so we never trap a returning user behind
 * the modal during the brief hydration window.
 */
export function useAuthActions() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuthSession();
  const openAuth = useAuthModalStore((s) => s.openAuth);

  const requireAuth = useCallback(
    (destination: string) => {
      if (!CLERK_ENABLED || !isLoaded || isSignedIn) {
        router.push(destination);
        return;
      }
      openAuth(destination);
    },
    [isLoaded, isSignedIn, openAuth, router],
  );

  return { requireAuth, isLoaded, isSignedIn };
}
