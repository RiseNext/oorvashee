import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  // Clerk server secret (F2). Required at runtime only when auth is enabled.
  CLERK_SECRET_KEY: z.string().optional(),
});

const clientSchema = z.object({
  // MUST include the `/api/v1` prefix — every apiFetch path is relative to this.
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:8000/api/v1"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  // F2: Clerk. Auth activates only when the publishable key is present
  // (graceful degradation — the app builds + runs guest-only without it).
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  // Optional named Clerk JWT template for getToken(). Leave unset to use the
  // default session token (which must be customised in the Clerk dashboard to
  // include `email` + `role` claims — the backend reads both). See AUTH docs.
  NEXT_PUBLIC_CLERK_JWT_TEMPLATE: z.string().optional(),
  // Dev-only escape hatch. Defaults to "false" (live backend) so production is
  // safe even if the env var is omitted; set "true" locally to render the UI
  // on mock data without a backend.
  NEXT_PUBLIC_USE_MOCK_API: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

// NB: each var must be referenced as a literal `process.env.NEXT_PUBLIC_*`
// so the Next.js bundler can inline it into the client bundle at build time.
const clientRaw = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  NEXT_PUBLIC_CLERK_JWT_TEMPLATE: process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE,
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
};

export const clientEnv = clientSchema.parse(clientRaw);

export const serverEnv =
  typeof window === "undefined"
    ? serverSchema.parse({
        NODE_ENV: process.env.NODE_ENV,
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
      })
    : (undefined as never);
