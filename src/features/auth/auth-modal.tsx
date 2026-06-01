"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { AFTER_AUTH_URL } from "@/lib/auth/config";
import { AuthSubmit, Divider, GoogleIcon } from "./auth-shell";
import { OtpInput } from "./otp-input";
import { clerkErrorMessage } from "./clerk-errors";
import { useAuthModalStore } from "./auth-modal-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Clerk reports a sign-in identifier with no matching account this way. */
function isIdentifierNotFound(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("errors" in err)) return false;
  const arr = (err as { errors?: { code?: string }[] }).errors;
  return Array.isArray(arr) && arr.some((e) => e.code === "form_identifier_not_found");
}

/**
 * Custom auth modal — replaces the full-page sign-in flow. Opened from the
 * profile icon and "Proceed to Checkout" via {@link useAuthModalStore}.
 *
 * One passwordless flow handles both sign-in and sign-up: enter an email, get a
 * 6-digit code (Clerk `email_code`). If the email already has an account we run
 * Clerk's sign-in; if not, we transparently create one — the user never picks.
 * Google OAuth is offered alongside. On success we push to the modal's
 * `redirectTo` (e.g. `/checkout`), and `CartSync` merges the guest cart.
 */
export function AuthModal() {
  const open = useAuthModalStore((s) => s.open);
  const closeAuth = useAuthModalStore((s) => s.closeAuth);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAuth();
      }}
    >
      <DialogContent className="bg-white p-6 sm:max-w-[420px] sm:p-8">
        {/* Body remounts on each open, so flow state resets cleanly. */}
        <AuthModalBody />
      </DialogContent>
    </Dialog>
  );
}

function AuthModalBody() {
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const redirectTo = useAuthModalStore((s) => s.redirectTo);
  const closeAuth = useAuthModalStore((s) => s.closeAuth);

  const [view, setView] = useState<"email" | "verify">("email");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const ready = signInLoaded && signUpLoaded;
  const emailValid = EMAIL_RE.test(email);
  const destination = redirectTo ?? AFTER_AUTH_URL;

  // Already signed in (e.g. a fast click before Clerk hydrated) → no auth
  // needed; close and continue to the intended destination.
  useEffect(() => {
    if (isSignedIn) {
      closeAuth();
      router.push(destination);
    }
  }, [isSignedIn, closeAuth, router, destination]);

  function finish() {
    closeAuth();
    router.push(destination);
  }

  async function sendCode() {
    if (!ready || !signIn || !signUp || !emailValid || busy) return;
    setBusy(true);
    try {
      // Returning user → email-code first factor.
      const attempt = await signIn.create({ identifier: email });
      const factor = attempt.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code",
      );
      if (!factor || !("emailAddressId" in factor)) {
        throw new Error(
          "Email sign-in isn't available for this account — try Google instead.",
        );
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: (factor as { emailAddressId: string }).emailAddressId,
      });
      setMode("signIn");
      setCode("");
      setView("verify");
    } catch (err) {
      // New user → Clerk reports the identifier as not found; create the account.
      if (isIdentifierNotFound(err)) {
        try {
          await signUp.create({ emailAddress: email });
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
          setMode("signUp");
          setCode("");
          setView("verify");
        } catch (signUpErr) {
          toast.error(
            clerkErrorMessage(signUpErr, "Couldn't send the code. Please try again."),
          );
        }
      } else {
        toast.error(clerkErrorMessage(err, "Couldn't send the code. Please try again."));
      }
    } finally {
      setBusy(false);
    }
  }

  async function verify(otp: string) {
    if (!ready || busy) return;
    setBusy(true);
    try {
      if (mode === "signIn") {
        if (!signIn) return;
        const res = await signIn.attemptFirstFactor({ strategy: "email_code", code: otp });
        if (res.status === "complete") {
          await setActiveSignIn({ session: res.createdSessionId });
          finish();
          return;
        }
      } else {
        if (!signUp) return;
        const res = await signUp.attemptEmailAddressVerification({ code: otp });
        if (res.status === "complete") {
          await setActiveSignUp({ session: res.createdSessionId });
          finish();
          return;
        }
      }
      toast.error("Extra verification is needed. Please try again.");
    } catch (err) {
      toast.error(clerkErrorMessage(err, "That code didn't match. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!ready || busy) return;
    setBusy(true);
    try {
      if (mode === "signUp" && signUp) {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      } else if (mode === "signIn" && signIn) {
        const factor = signIn.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code",
        );
        if (factor && "emailAddressId" in factor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: (factor as { emailAddressId: string }).emailAddressId,
          });
        }
      }
      toast.success("Code re-sent — check your inbox.");
    } catch (err) {
      toast.error(clerkErrorMessage(err, "Couldn't resend the code. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    if (!ready || !signIn || busy) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: destination,
      });
    } catch (err) {
      toast.error(clerkErrorMessage(err, "Google sign-in failed. Please try again."));
    }
  }

  if (view === "email") {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <DialogTitle className="font-display text-3xl font-semibold text-[#3d1a08]">
            Sign in or sign up
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-[#9a7055]">
            Continue with Google, or enter your email and we&apos;ll send a
            verification code.
          </DialogDescription>
        </div>

        <button
          type="button"
          onClick={google}
          disabled={!ready || busy}
          className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#7a4b15]/30 py-3 text-sm font-medium text-[#3d1a08] transition-colors hover:border-[#7a4b15]/70 hover:bg-[#7a4b15]/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
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
              autoFocus
              className="rounded-full border-2 border-[#7a4b15]/30 px-5 py-3 font-display text-sm italic text-[#3d1a08] outline-none transition-colors placeholder:text-[#9a7055]/60 focus:border-[#7a4b15]"
            />
          </div>
          {/* Clerk bot-protection mount (invisible unless a challenge is shown). */}
          <div id="clerk-captcha" />
          <AuthSubmit type="submit" disabled={!emailValid || !ready || busy}>
            {busy ? "Sending…" : "Send Code"}
          </AuthSubmit>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => {
          setView("email");
          setCode("");
        }}
        className="flex w-fit items-center gap-1.5 text-sm text-[#9a7055] transition-colors hover:text-[#7a4b15]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="text-center">
        <DialogTitle className="font-display text-3xl font-semibold text-[#3d1a08]">
          Check your email
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-relaxed text-[#9a7055]">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-[#7a4b15]">{email}</span>
        </DialogDescription>
      </div>

      <OtpInput onChange={setCode} onComplete={verify} disabled={busy} />

      <AuthSubmit onClick={() => verify(code)} disabled={code.length !== 6 || busy}>
        {busy ? "Verifying…" : "Verify & Continue"}
      </AuthSubmit>

      <p className="text-center text-sm text-[#9a7055]">
        Didn&apos;t receive it?{" "}
        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="font-semibold text-[#7a4b15] hover:underline disabled:opacity-50"
        >
          Resend code
        </button>
      </p>
    </div>
  );
}
