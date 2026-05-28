/**
 * Extract a human-friendly message from a Clerk error (which carries an
 * `errors: [{ message, longMessage, code }]` array) with a safe fallback.
 */
export function clerkErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "errors" in err) {
    const arr = (err as {
      errors?: { longMessage?: string; message?: string }[];
    }).errors;
    if (arr?.length) return arr[0].longMessage ?? arr[0].message ?? fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
