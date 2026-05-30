/**
 * Store policies — fetched from the backend (admin-managed) with the static
 * `@/config/policies` set as a guaranteed fallback.
 *
 * The backend owns the canonical copy: admins edit it in the dashboard and it
 * flows to every product, the cart, checkout, and the `/policies/*` pages. If
 * the API is unavailable (or mock mode is on) the storefront still renders the
 * seeded defaults from config — the UI never shows an empty policy section.
 */
import { clientEnv } from "@/lib/env";
import { PRODUCT_POLICIES, POLICIES_BY_SLUG, type PolicyDoc } from "@/config/policies";
import { apiFetch } from "./client";

const useMock = clientEnv.NEXT_PUBLIC_USE_MOCK_API;

/** Backend `PolicyRead` shape (snake-case-free — already lean). */
interface BackendPolicy {
  key: string;
  title: string;
  summary: string | null;
  body: string;
}

/** Split a stored body (paragraphs separated by blank lines) into paragraphs. */
function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function mapPolicy(p: BackendPolicy): PolicyDoc {
  return {
    slug: p.key,
    title: p.title,
    summary: p.summary ?? "",
    paragraphs: splitParagraphs(p.body),
  };
}

/** All active policies in display order. Falls back to the seeded config set. */
export async function listPolicies(): Promise<PolicyDoc[]> {
  if (useMock) return PRODUCT_POLICIES;
  try {
    const rows = await apiFetch<BackendPolicy[]>("/policies");
    return rows.length > 0 ? rows.map(mapPolicy) : PRODUCT_POLICIES;
  } catch {
    return PRODUCT_POLICIES;
  }
}

/**
 * A single policy by slug/key. Falls back to the config doc when the backend
 * is unreachable; returns `null` only for a genuinely unknown slug.
 */
export async function getPolicyDoc(slug: string): Promise<PolicyDoc | null> {
  if (useMock) return POLICIES_BY_SLUG[slug] ?? null;
  try {
    const row = await apiFetch<BackendPolicy>(`/policies/${slug}`);
    return mapPolicy(row);
  } catch {
    return POLICIES_BY_SLUG[slug] ?? null;
  }
}
