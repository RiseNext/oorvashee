"use client";

import { type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

import {
  AFTER_AUTH_URL,
  CLERK_ENABLED,
  CLERK_PUBLISHABLE_KEY,
  SIGN_IN_URL,
  SIGN_UP_URL,
} from "./config";

// Brand appearance for any Clerk-managed surface (UserButton, account portal).
// The sign-in/up screens use our own approved UI via custom flows, so this is
// mostly a safety net — kept on-brand (maroon + warm browns, pill radius).
const appearance = {
  variables: {
    colorPrimary: "#7B0D0D",
    colorText: "#3d1a08",
    colorTextSecondary: "#9a7055",
    colorBackground: "#ffffff",
    borderRadius: "9999px",
    fontFamily: "var(--font-body)",
  },
} as const;

/**
 * Mounts ClerkProvider only when auth is configured. When disabled, renders
 * children directly — the app works guest-only and `useAuthSession` returns a
 * guest, so nothing in the tree depends on a provider that isn't there.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (!CLERK_ENABLED) return <>{children}</>;

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      // The app uses ONLY Clerk Control Components (the `useAuth`/`useUser`/
      // `useSignIn`/`useSignUp` hooks + our own custom sign-in/up UI) — never a
      // Clerk-rendered UI component (UserButton/SignIn/UserProfile). That's the
      // documented precondition for the "headless" clerk-js variant, which loads
      // a minimal bundle and drops the ~128KB UI chunk that otherwise parses/
      // executes on the main thread on every page (incl. the public home, where
      // there's no auth UI above the fold) — the home LCP render-delay culprit.
      clerkJSVariant="headless"
      appearance={appearance}
      signInUrl={SIGN_IN_URL}
      signUpUrl={SIGN_UP_URL}
      signInFallbackRedirectUrl={AFTER_AUTH_URL}
      signUpFallbackRedirectUrl={AFTER_AUTH_URL}
    >
      {children}
    </ClerkProvider>
  );
}
