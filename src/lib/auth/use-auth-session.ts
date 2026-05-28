"use client";

/**
 * Unified auth-session hook — the single seam components read auth state from.
 * No component imports Clerk directly; they get a stable, backend-aligned shape
 * here. When Clerk is disabled the same shape is returned as a guest, so the UI
 * renders identically (signed-out) without a ClerkProvider in the tree.
 */
import { useAuth, useUser } from "@clerk/nextjs";

import { CLERK_ENABLED, type UserRole } from "./config";

export interface AuthSession {
  /** False until Clerk has restored the session (avoid auth flicker). */
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  /** Mirrors backend RBAC (`public_metadata.role`); defaults to `customer`. */
  role: UserRole;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  imageUrl: string | null;
  signOut: () => Promise<void>;
}

function useClerkAuthSession(): AuthSession {
  const { isLoaded, isSignedIn, userId, signOut } = useAuth();
  const { user } = useUser();
  const role = ((user?.publicMetadata?.role as UserRole | undefined) ?? "customer");
  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    userId: userId ?? null,
    role,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    fullName: user?.fullName ?? null,
    firstName: user?.firstName ?? null,
    imageUrl: user?.imageUrl ?? null,
    signOut: async () => {
      await signOut();
    },
  };
}

function useGuestAuthSession(): AuthSession {
  return {
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    role: "customer",
    email: null,
    fullName: null,
    firstName: null,
    imageUrl: null,
    signOut: async () => {},
  };
}

// Build-time-stable selection (see config.ts) — the same hook is used for the
// whole app lifecycle, so this respects the Rules of Hooks.
export const useAuthSession: () => AuthSession = CLERK_ENABLED
  ? useClerkAuthSession
  : useGuestAuthSession;
