import type { Metadata } from "next";

import { CLERK_ENABLED } from "@/lib/auth/config";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { AuthDisabledNotice } from "@/features/auth/auth-disabled-notice";

export const metadata: Metadata = { title: "Get Started" };

export default function SignUpPage() {
  if (!CLERK_ENABLED) return <AuthDisabledNotice />;
  return <SignUpForm />;
}
