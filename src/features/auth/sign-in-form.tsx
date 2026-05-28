"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { AFTER_AUTH_URL, SIGN_UP_URL } from "@/lib/auth/config";
import { AuthShell, AuthSubmit, Divider, GoogleIcon } from "./auth-shell";
import { OtpInput } from "./otp-input";
import { clerkErrorMessage } from "./clerk-errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign-in — real Clerk auth on the client-approved UI. Email → 6-digit code
 * (Clerk `email_code` first factor) + Google OAuth. No fake/local auth.
 */
export function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [view, setView] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in → no reason to be here.
  useEffect(() => {
    if (isSignedIn) router.replace(AFTER_AUTH_URL);
  }, [isSignedIn, router]);

  const emailValid = EMAIL_RE.test(email);

  async function sendCode() {
    if (!isLoaded || !signIn || !emailValid || busy) return;
    setBusy(true);
    try {
      const attempt = await signIn.create({ identifier: email });
      const factor = attempt.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code",
      );
      if (!factor || !("emailAddressId" in factor)) {
        throw new Error("Email sign-in isn't available for this account.");
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: (factor as { emailAddressId: string }).emailAddressId,
      });
      setView("verify");
    } catch (err) {
      toast.error(
        clerkErrorMessage(err, "Couldn't start sign-in. Check your email and try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp: string) {
    if (!isLoaded || !signIn || busy) return;
    setBusy(true);
    try {
      const res = await signIn.attemptFirstFactor({ strategy: "email_code", code: otp });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push(AFTER_AUTH_URL);
      } else {
        toast.error("Extra verification is needed. Please try again.");
      }
    } catch (err) {
      toast.error(clerkErrorMessage(err, "That code didn't match. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (!isLoaded || !signIn || busy) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: AFTER_AUTH_URL,
      });
    } catch (err) {
      toast.error(clerkErrorMessage(err, "Google sign-in failed. Please try again."));
    }
  }

  return (
    <AuthShell>
      {view === "email" ? (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold text-[#3d1a08] mb-2">
              Sign in
            </h1>
            <p className="text-sm text-[#9a7055] leading-relaxed">
              Enter your email and we&apos;ll send you a verification code
            </p>
          </div>

          <button
            type="button"
            onClick={google}
            className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#7a4b15]/30 py-3 text-sm font-medium text-[#3d1a08] transition-colors hover:border-[#7a4b15]/70 hover:bg-[#7a4b15]/5"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          <Divider />

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#3d1a08]">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-full border-2 border-[#7a4b15]/30 px-5 py-3 text-sm text-[#3d1a08] placeholder:text-[#9a7055]/60 outline-none font-display italic transition-colors focus:border-[#7a4b15]"
              />
            </div>
            <AuthSubmit type="submit" disabled={!emailValid || busy}>
              {busy ? "Sending…" : "Send Verification Code"}
            </AuthSubmit>
          </form>

          <p className="text-center text-sm text-[#9a7055]">
            Don&apos;t have an account?{" "}
            <Link href={SIGN_UP_URL} className="font-semibold text-[#7a4b15] hover:underline">
              Get Started
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={() => setView("email")}
            className="flex items-center gap-1.5 text-sm text-[#9a7055] transition-colors hover:text-[#7a4b15] w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold text-[#3d1a08] mb-2">
              Check your email
            </h1>
            <p className="text-sm text-[#9a7055] leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-[#7a4b15]">{email}</span>
            </p>
          </div>

          <OtpInput onChange={setCode} onComplete={verify} disabled={busy} />

          <AuthSubmit onClick={() => verify(code)} disabled={code.length !== 6 || busy}>
            {busy ? "Verifying…" : "Verify"}
          </AuthSubmit>

          <p className="text-center text-sm text-[#9a7055]">
            Didn&apos;t receive it?{" "}
            <button
              type="button"
              onClick={sendCode}
              className="font-semibold text-[#7a4b15] hover:underline"
            >
              Resend code
            </button>
          </p>
        </div>
      )}
    </AuthShell>
  );
}
