"use client";

import { CLERK_ENABLED } from "@/lib/auth/config";
import { AuthModal } from "./auth-modal";

/**
 * App-wide mount point for the custom auth modal. Renders nothing when Clerk
 * isn't configured (the modal's Clerk hooks need a ClerkProvider ancestor, and
 * the app runs guest-only in that case). `CLERK_ENABLED` is build-time stable,
 * so this conditional never changes within a running app.
 */
export function AuthModalMount() {
  if (!CLERK_ENABLED) return null;
  return <AuthModal />;
}
