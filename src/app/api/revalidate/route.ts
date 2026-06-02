/**
 * On-demand ISR cache invalidation.
 *
 * The storefront caches catalog/policy data with `revalidate` + cache tags
 * (see `lib/api/products` and `lib/api/policies`). This endpoint lets the
 * backend bust those caches *immediately* after an admin edit, so content stays
 * fresh without reverting any route to `force-dynamic`.
 *
 * Contract (server-to-server; secured by a shared secret):
 *   POST /api/revalidate
 *   header: x-revalidate-secret: <REVALIDATE_SECRET>
 *   body:   { "tags": ["products", "product:<slug>"], "paths": ["/"] }
 *
 * Typical calls from the backend after a mutation:
 *   - product create/update/delete → tags: ["products", "product:<slug>"]
 *   - category change              → tags: ["categories"]
 *   - policy edit                  → tags: ["policies"]
 *
 * Both `tags` and `paths` are optional; pass either or both.
 */
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // Fail closed: if no secret is configured, refuse rather than allow anonymous
  // cache busting.
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json(
      { revalidated: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  let body: { tags?: unknown; paths?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { revalidated: false, error: "invalid JSON body" },
      { status: 400 },
    );
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string")
    : [];
  const paths = Array.isArray(body.paths)
    ? body.paths.filter((p): p is string => typeof p === "string")
    : [];

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json(
      { revalidated: false, error: "provide at least one of `tags` or `paths`" },
      { status: 400 },
    );
  }

  // Next 16: revalidateTag requires a cache-life profile as the 2nd arg.
  // "max" = stale-while-revalidate with the longest stale window (the
  // recommended value for Route Handlers; `updateTag` is Server-Action-only).
  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, tags, paths });
}
