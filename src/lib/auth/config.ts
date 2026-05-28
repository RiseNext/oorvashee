/**
 * Auth configuration seam.
 *
 * Clerk activates ONLY when a publishable key is configured. Without it, the
 * app builds and runs guest-only (no ClerkProvider, no middleware protection,
 * `useAuthSession` returns a guest) — so a missing/late Clerk setup never
 * blocks the build or the storefront. With the key present, the full auth
 * layer activates with no code change.
 *
 * `CLERK_ENABLED` is a build-time-stable constant (the publishable key is a
 * `NEXT_PUBLIC_*` var inlined at build), so it can safely select between two
 * hook/component implementations at module scope without breaking the Rules of
 * Hooks (the chosen implementation never changes within a running app).
 */
import { clientEnv } from "@/lib/env";

export const CLERK_PUBLISHABLE_KEY = clientEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** True when Clerk auth is configured for this build/environment. */
export const CLERK_ENABLED = Boolean(CLERK_PUBLISHABLE_KEY);

export const SIGN_IN_URL = clientEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
export const SIGN_UP_URL = clientEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL;

/**
 * Named Clerk JWT template for `getToken()`. Always set (defaults to "backend",
 * see env.ts) — it mints the `aud: "oorvashee-api"` audience plus the
 * `email`/`role` claims the FastAPI backend verifies. Every authenticated call
 * goes through this template; there is no default-session-token fallback.
 */
export const CLERK_JWT_TEMPLATE = clientEnv.NEXT_PUBLIC_CLERK_JWT_TEMPLATE;

/** Default landing route after a successful sign-in / sign-up. */
export const AFTER_AUTH_URL = "/account";

/** Roles mirrored from the backend RBAC (`public_metadata.role`). */
export type UserRole = "admin" | "staff" | "customer";
