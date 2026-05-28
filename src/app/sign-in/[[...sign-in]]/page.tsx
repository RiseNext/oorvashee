import type { Metadata } from "next";

import { CLERK_ENABLED } from "@/lib/auth/config";
import { SignInForm } from "@/features/auth/sign-in-form";
import { AuthDisabledNotice } from "@/features/auth/auth-disabled-notice";

export const metadata: Metadata = { title: "Sign in" };

// Optional catch-all so Clerk sub-paths under /sign-in resolve to this screen.
export default function SignInPage() {
  if (!CLERK_ENABLED) return <AuthDisabledNotice />;
  return <SignInForm />;
}
