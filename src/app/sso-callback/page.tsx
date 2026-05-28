"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

import { AFTER_AUTH_URL, CLERK_ENABLED } from "@/lib/auth/config";

/**
 * OAuth (Google) redirect lands here. Clerk completes the handshake and routes
 * the user on. Only meaningful when auth is configured.
 */
export default function SSOCallbackPage() {
  if (!CLERK_ENABLED) return null;
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl={AFTER_AUTH_URL}
      signUpForceRedirectUrl={AFTER_AUTH_URL}
    />
  );
}
