import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  // Clerk server secret (F2). Required at runtime only when auth is enabled.
  CLERK_SECRET_KEY: z.string().optional(),
  // Backend origin for SERVER-side fetches (SSR/ISR/RSC). These hit Railway
  // DIRECTLY — exactly as today — so there is no self-hop through the public
  // domain and no build-time dependency on oorvashee.com resolving. NO `/api/v1`
  // suffix here; buildUrl appends it. The BROWSER does NOT use this — it goes
  // same-origin via NEXT_PUBLIC_API_BASE_URL + the next.config rewrite, so it
  // never resolves railway.app (Jio NXDOMAINs `*.up.railway.app`). Set in Vercel
  // to https://oorvashee-backend-production.up.railway.app.
  BACKEND_ORIGIN: z.string().url().default("http://localhost:8000"),
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
  // Named Clerk JWT template for getToken(). Defaults to "backend" — the
  // template that mints `aud: "oorvashee-api"` (plus the `email`/`role` claims),
  // which the FastAPI backend now REQUIRES. The default session token lacks the
  // audience and is rejected, so this is mandatory; override only if the Clerk
  // template is renamed.
  NEXT_PUBLIC_CLERK_JWT_TEMPLATE: z.string().default("backend"),
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
        BACKEND_ORIGIN: process.env.BACKEND_ORIGIN,
      })
    : (undefined as never);
