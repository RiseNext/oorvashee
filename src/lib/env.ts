import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  RAZORPAY_KEY_SECRET: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  NEXT_PUBLIC_USE_MOCK_API: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

const clientRaw = {
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
};

export const clientEnv = clientSchema.parse(clientRaw);

export const serverEnv =
  typeof window === "undefined"
    ? serverSchema.parse({
        NODE_ENV: process.env.NODE_ENV,
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      })
    : (undefined as never);
