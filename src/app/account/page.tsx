"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/features/navbar";

type View = "signin" | "signup" | "verify";

export default function AccountPage() {
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center px-4 pt-12 pb-20 bg-white">
        <div className="w-full max-w-[400px]">
          {view === "signin" && (
            <SignInView
              email={email}
              setEmail={setEmail}
              onSendCode={() => setView("verify")}
              onGetStarted={() => setView("signup")}
            />
          )}
          {view === "signup" && (
            <SignUpView
              email={email}
              setEmail={setEmail}
              onSendCode={() => setView("verify")}
              onSignIn={() => setView("signin")}
            />
          )}
          {view === "verify" && (
            <VerifyView email={email} onBack={() => setView("signin")} />
          )}
        </div>
      </main>
    </>
  );
}

/* ─────────────────────────────────────────────
   Sign In
───────────────────────────────────────────── */
function SignInView({
  email,
  setEmail,
  onSendCode,
  onGetStarted,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSendCode: () => void;
  onGetStarted: () => void;
}) {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-[#3d1a08] mb-2">
          Sign in
        </h1>
        <p className="text-sm text-[#9a7055] leading-relaxed">
          Enter your email and we'll send you a verification code
        </p>
      </div>

      {/* Google */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#7a4b15]/30 py-3 text-sm font-medium text-[#3d1a08] transition-colors hover:border-[#7a4b15]/70 hover:bg-[#7a4b15]/5"
      >
        <GoogleIcon />
        Sign in with Google
      </button>

      <Divider />

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#3d1a08]">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-full border-2 border-[#7a4b15]/30 px-5 py-3 text-sm text-[#3d1a08] placeholder:text-[#9a7055]/60 outline-none font-display italic transition-colors focus:border-[#7a4b15]"
        />
      </div>

      <button
        type="button"
        onClick={onSendCode}
        disabled={!valid}
        className="w-full rounded-full bg-[#7a4b15] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5e3810] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Send Verification Code
      </button>

      <p className="text-center text-sm text-[#9a7055]">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onGetStarted}
          className="font-semibold text-[#7a4b15] hover:underline"
        >
          Get Started
        </button>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Get Started (Sign Up)
───────────────────────────────────────────── */
function SignUpView({
  email,
  setEmail,
  onSendCode,
  onSignIn,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSendCode: () => void;
  onSignIn: () => void;
}) {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-[#3d1a08] mb-2">
          Get Started
        </h1>
        <p className="text-sm text-[#9a7055] leading-relaxed">
          Create your account and start exploring
        </p>
      </div>

      {/* Google */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#7a4b15]/30 py-3 text-sm font-medium text-[#3d1a08] transition-colors hover:border-[#7a4b15]/70 hover:bg-[#7a4b15]/5"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <Divider />

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#3d1a08]">
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-full border-2 border-[#7a4b15]/30 px-5 py-3 text-sm text-[#3d1a08] placeholder:text-[#9a7055]/60 outline-none font-display italic transition-colors focus:border-[#7a4b15]"
        />
      </div>

      <button
        type="button"
        onClick={onSendCode}
        disabled={!valid}
        className="w-full rounded-full bg-[#7a4b15] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5e3810] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
      </button>

      <p className="text-center text-sm text-[#9a7055]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="font-semibold text-[#7a4b15] hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Verify OTP
───────────────────────────────────────────── */
function VerifyView({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;
    const next = [...code];
    paste.split("").forEach((d, i) => {
      next[i] = d;
    });
    setCode(next);
    inputs.current[Math.min(paste.length, 5)]?.focus();
    e.preventDefault();
  }

  const full = code.every((d) => d !== "");

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
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

      {/* OTP boxes */}
      <div className="flex justify-center gap-3 py-2">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="h-13 w-12 rounded-xl border-2 border-[#7a4b15]/30 text-center text-xl font-semibold text-[#3d1a08] outline-none font-display transition-colors focus:border-[#7a4b15] focus:bg-[#7a4b15]/5"
          />
        ))}
      </div>

      <button
        type="button"
        disabled={!full}
        className="w-full rounded-full bg-[#7a4b15] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5e3810] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Verify
      </button>

      <p className="text-center text-sm text-[#9a7055]">
        Didn't receive it?{" "}
        <button
          type="button"
          className="font-semibold text-[#7a4b15] hover:underline"
        >
          Resend code
        </button>
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */
function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#7a4b15]/15" />
      <span className="text-xs text-[#9a7055]">or</span>
      <div className="h-px flex-1 bg-[#7a4b15]/15" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
