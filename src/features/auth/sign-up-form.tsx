"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { AFTER_AUTH_URL, SIGN_IN_URL } from "@/lib/auth/config";
import { AuthShell, AuthSubmit, Divider, GoogleIcon } from "./auth-shell";
import { OtpInput } from "./otp-input";
import { clerkErrorMessage } from "./clerk-errors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign-up — real Clerk auth on the client-approved "Get Started" UI. Email →
 * 6-digit code (Clerk `email_code`) + Google OAuth. The `#clerk-captcha` node
 * is Clerk's bot-protection mount point for custom sign-up flows.
 */
export function SignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [view, setView] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isSignedIn) router.replace(AFTER_AUTH_URL);
  }, [isSignedIn, router]);

  const emailValid = EMAIL_RE.test(email);

  async function start() {
    if (!isLoaded || !signUp || !emailValid || busy) return;
    setBusy(true);
    try {
      await signUp.create({ emailAddress: email });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setView("verify");
    } catch (err) {
      toast.error(
        clerkErrorMessage(err, "Couldn't start sign-up. Check your email and try again."),
      );
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp: string) {
    if (!isLoaded || !signUp || busy) return;
    setBusy(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: otp });
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
    if (!isLoaded || !signUp || busy) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: AFTER_AUTH_URL,
      });
    } catch (err) {
      toast.error(clerkErrorMessage(err, "Google sign-up failed. Please try again."));
    }
  }

  return (
    <AuthShell>
      {view === "email" ? (
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="font-display text-4xl font-semibold text-[#3d1a08] mb-2">
              Get Started
            </h1>
            <p className="text-sm text-[#9a7055] leading-relaxed">
              Create your account and start exploring
            </p>
          </div>

          <button
            type="button"
            onClick={google}
            className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#7a4b15]/30 py-3 text-sm font-medium text-[#3d1a08] transition-colors hover:border-[#7a4b15]/70 hover:bg-[#7a4b15]/5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <Divider />

          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              start();
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
            {/* Clerk bot-protection mount (invisible unless a challenge is shown) */}
            <div id="clerk-captcha" />
            <AuthSubmit type="submit" disabled={!emailValid || busy}>
              {busy ? "Sending…" : "Continue"}
            </AuthSubmit>
          </form>

          <p className="text-center text-sm text-[#9a7055]">
            Already have an account?{" "}
            <Link href={SIGN_IN_URL} className="font-semibold text-[#7a4b15] hover:underline">
              Sign in
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
              onClick={start}
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
