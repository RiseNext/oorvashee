import Link from "next/link";
import { AuthShell, AuthSubmit } from "./auth-shell";

/**
 * Shown only when Clerk isn't configured for this environment (no publishable
 * key). Honest "not yet available" state — never appears once auth is set up.
 */
export function AuthDisabledNotice() {
  return (
    <AuthShell>
      <div className="flex flex-col gap-6 text-center">
        <h1 className="font-display text-4xl font-semibold text-[#3d1a08]">
          Accounts coming soon
        </h1>
        <p className="text-sm text-[#9a7055] leading-relaxed">
          Sign-in is being set up. You can keep shopping as a guest — browse the
          collection and check out without an account.
        </p>
        <Link href="/saris" className="block">
          <AuthSubmit>Browse the collection</AuthSubmit>
        </Link>
      </div>
    </AuthShell>
  );
}
