// Next.js 16 "Proxy" (formerly Middleware). Runs Clerk's request handler to
// gate protected routes. Auth activates only when configured — without a Clerk
// key this is a passthrough, so the storefront stays fully usable guest-only.
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Storefront auth (account, cart, checkout) is handled CLIENT-side by the
// custom auth modal — deliberately NOT gated here — so guests are never bounced
// to Clerk's hosted UI. Browsing, viewing the cart, and reaching checkout stay
// public at the edge; the backend independently enforces auth on every
// protected API call (the real security boundary). Only the internal admin
// area is gated at the edge.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

/** Role lives in the customised session token (`role` or `*_metadata.role`). */
function extractRole(claims: Record<string, unknown> | null | undefined): string {
  if (!claims) return "customer";
  const meta =
    (claims.metadata as Record<string, unknown> | undefined) ??
    (claims.public_metadata as Record<string, unknown> | undefined) ??
    (claims.publicMetadata as Record<string, unknown> | undefined);
  return String(claims.role ?? meta?.role ?? "customer");
}

const handler = CLERK_ENABLED
  ? clerkMiddleware(async (auth, req) => {
      if (isAdminRoute(req)) {
        // Unauthenticated → redirected to the sign-in page by Clerk.
        await auth.protect();
        const { sessionClaims } = await auth();
        if (extractRole(sessionClaims as Record<string, unknown>) !== "admin") {
          // Authenticated but not an admin → bounce home (defence in depth;
          // the backend independently enforces 403 on /admin APIs).
          return NextResponse.redirect(new URL("/", req.url));
        }
      }
      return NextResponse.next();
    })
  : () => NextResponse.next();

export default handler;

export const config = {
  matcher: [
    // Skip Next internals + any file with an extension; run on app routes.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run on API/trpc.
    "/(api|trpc)(.*)",
  ],
};
