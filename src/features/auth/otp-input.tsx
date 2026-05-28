"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

/**
 * 6-digit verification-code input — pixel-identical to the client-approved
 * design. Emits the joined code on every change and calls `onComplete` when
 * all six digits are present (drives Clerk's `attempt*Verification`).
 */
export function OtpInput({
  onChange,
  onComplete,
  disabled,
}: {
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function emit(next: string[]) {
    setCode(next);
    const joined = next.join("");
    onChange?.(joined);
    if (joined.length === 6 && next.every((d) => d !== "")) onComplete?.(joined);
  }

  function handleChange(i: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    emit(next);
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
    const next = ["", "", "", "", "", ""];
    paste.split("").forEach((d, i) => {
      next[i] = d;
    });
    emit(next);
    inputs.current[Math.min(paste.length, 5)]?.focus();
    e.preventDefault();
  }

  return (
    <div className="flex justify-center gap-3 py-2">
      {code.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="h-13 w-12 rounded-xl border-2 border-[#7a4b15]/30 text-center text-xl font-semibold text-[#3d1a08] outline-none font-display transition-colors focus:border-[#7a4b15] focus:bg-[#7a4b15]/5 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
