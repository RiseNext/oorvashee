"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { useAuthSession } from "@/lib/auth/use-auth-session";
import { cn } from "@/lib/utils";

/** Content-only — rendered inside `AccountShell`. Identity is Clerk-owned. */
export function ProfileView() {
  const { firstName, fullName, email, imageUrl, role, signOut } = useAuthSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const displayName = fullName || firstName || email?.split("@")[0] || "Your account";
  const initial = (firstName || email || "O").charAt(0).toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-xl border border-border-light bg-bg-card p-6 shadow-[0_1px_2px_rgba(61,26,8,0.04)]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={displayName}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary font-display text-xl text-cta-fill">
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-display text-lg text-text-primary">{displayName}</p>
          {email && <p className="font-body text-sm text-text-muted">{email}</p>}
          {role !== "customer" && (
            <span className="mt-1 inline-flex rounded-full bg-bg-secondary px-2 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.12em] text-text-secondary">
              {role}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border-light bg-bg-card p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cta-fill" strokeWidth={1.75} />
        <p className="font-body text-sm text-text-secondary">
          Your name, email, and password are managed securely by our sign-in
          provider. To update them, use the account menu when signing in.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border-[1.5px] border-cta-fill px-7 py-3",
          "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
          "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <LogOut className="h-4 w-4" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
