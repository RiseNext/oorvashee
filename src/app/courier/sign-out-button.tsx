"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { useAuthSession } from "@/lib/auth/use-auth-session";

/**
 * Headless-compatible account control for the courier header.
 *
 * The app runs Clerk in `clerkJSVariant="headless"` (a home-page perf win that
 * drops the Clerk UI bundle), so Clerk UI components like <UserButton> are NOT
 * available and crash with "ClerkJS was loaded without UI components". This
 * mirrors the admin shell exactly: read the session via useAuthSession() (Clerk
 * headless hooks) and sign out with a plain button — no Clerk UI component.
 */
export function CourierSignOut() {
  const { firstName, signOut } = useAuthSession();
  const router = useRouter();
  const [out, setOut] = useState(false);

  async function handleSignOut() {
    setOut(true);
    try {
      await signOut();
      router.push("/");
    } finally {
      setOut(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {firstName ? (
        <span className="hidden font-body text-xs text-text-muted sm:inline">{firstName}</span>
      ) : null}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={out}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-body text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-cta-fill disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
        <span>{out ? "Signing out…" : "Sign out"}</span>
      </button>
    </div>
  );
}
