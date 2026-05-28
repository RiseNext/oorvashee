# FRONTEND_ARCHITECTURE.md

How the Oorvashee storefront is structured and how it connects to the live
backend. Pairs with [INTEGRATION_RULES.md](INTEGRATION_RULES.md) (contract
mapping) and [CURRENT_STATUS.md](CURRENT_STATUS.md) (build state).

> **Next.js 16 caveat (from `AGENTS.md`):** this is a newer Next than the
> training cut-off. Before writing route/handler/caching code, read the
> relevant guide under `node_modules/next/dist/docs/`. Don't assume App
> Router APIs match older docs.

---

## 1. Layering

```
┌─────────────────────────────────────────────────────────────┐
│ app/ (routes)        Server Components by default;           │
│                      "use client" only where interactivity   │
│                      or store/query hooks are needed.        │
│   ↓                                                          │
│ features/<x>/        Feature UI — sections, cards, page      │
│                      compositions. No raw fetch here.        │
│   ↓                                                          │
│ hooks/ (TanStack)    Server-state hooks. queryKey + the      │
│                      api function. The ONLY consumers of     │
│                      lib/api in client components.           │
│   ↓                                                          │
│ lib/api/             apiFetch + per-domain modules           │
│                      (products, cart, checkout, …). Calls    │
│                      backend, returns BACKEND wire types,    │
│                      then maps → domain types via mappers.   │
│   ↓                                                          │
│ lib/api/mappers/     DTO mappers: backend shape → frontend   │
│                      domain type. Single conversion seam.    │
│   ↓                                                          │
│ [ backend /api/v1 ]  source of truth                         │
│                                                              │
│ store/ (Zustand)     CLIENT state only — cart lines, UI      │
│                      drawers, wishlist optimistic state.     │
│                      Never the cache for server data.        │
└─────────────────────────────────────────────────────────────┘
```

**Hard rules**
- No raw `fetch()` in components or features — go through `lib/api` → hook.
- Server data lives in **TanStack Query**, never in Zustand.
- Zustand holds **client/UI state** (cart drawer open, optimistic cart for
  guests, wishlist toggles) — see §5.
- The DTO mapper is the **only** place backend field names appear in domain
  code. Components never see `base_price` / `primary_image_url`.
- A second, one-directional **presentation seam** (`lib/catalog/presenters.ts`,
  `features/product-detail/adapt.ts`) maps domain types → the approved
  components' existing prop shapes, so the visual layer never changed in F1.

---

## 2. Routing (F1 — as built)

App Router. Catalog routes are **`force-dynamic`** (live price/stock, and so
`next build` never depends on backend availability).

```
app/
├── page.tsx                       # Home (ƒ dynamic, resilient: per-section catch)
├── saris/page.tsx                 # All sarees (ƒ)  — curated URL kept canonical
├── saris/[category]/page.tsx      # Dynamic catalog (ƒ) — replaced 16 static folders
├── product/[slug]/page.tsx        # CANONICAL detail (ƒ) — bot URL contract
│   ├── loading.tsx                # PDP skeleton
├── new-arrivals/page.tsx          # (ƒ) sort=new
├── search/page.tsx                # (ƒ) live search — /products?q= (F8)
├── video/page.tsx                 # YouTube-embed page (config siteConfig.videoGallery) (F8)
├── error.tsx  not-found.tsx  global-error.tsx   # branded route + root error + 404
├── sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx  twitter-image.tsx  # SEO (F6)
├── account/  about/ contact/ our-craft/ collections/   # static
└── cart/ checkout/ orders/ sign-in/ sign-up/ sso-callback/ support/ admin/…
```

**Category routing (aligned — single source of truth).** The backend/Neon
taxonomy was aligned to the client-approved merchandising structure, so the
storefront slugs (`banaras-sarees`, `kanchi-silk`, `pattu`, …) **are** the
backend category slugs. The F1 merchandising-map translation seam is **retired**
(`lib/catalog/category-map.ts` deleted). `/saris/[category]` resolves the
category directly from the backend (`getCollectionBySlug`):
- real backend category slug → render (title/subtitle from the category row;
  the "pattu" parent returns the union of its weave children);
- unknown slug → `notFound()`.

Canonical taxonomy spec: `BACKEND/ai-context/TAXONOMY.md`.

So **category listing URLs are NOT redirected** (the approved slugs are
canonical and now backed by real categories). Only legacy *product-detail* URLs
are 308-redirected to the canonical product URL, in `next.config.ts`:
- `/saris/:category/:slug` → `/product/:slug`
- `/new-arrivals/:slug` → `/product/:slug`

**Presentation seam.** Server route → `lib/api` (mapped to domain) →
`lib/catalog/presenters.ts` / `features/product-detail/adapt.ts` → approved
component props. The 16 static `saris/<category>/` folders + legacy `[slug]`
product pages were deleted (the dynamic routes + redirects cover them).

**RSC vs client:** category + product + home pages render on the server
(SEO + LCP). Interactive islands (filters, buy-zone, sort, carousels) are
client components fed mapped data from the server parent.

---

## 3. API layer

```
lib/api/
├── client.ts          apiFetch<T>() — fetch wrapper, query builder,
│                      ApiError on non-2xx, auth-header injection (F0),
│                      Idempotency-Key support (F4).
├── errors.ts          ApiError { status, code, requestId, details }
├── mappers/           backend → domain converters (product, category,
│                      cart, order). Pure functions, unit-tested.
├── products.ts        listProducts, getProductBySlug, getFeatured
├── categories.ts      listCategories (grouped), category detail
├── cart.ts            (F3) get/add/update/remove/merge
├── checkout.ts        (F4) quote, placeOrder
├── payments.ts        (F4) verify
├── orders.ts          (F5) track, account history
└── mock-data.ts       dev fallback (gated by env flag; removed from prod build path)
```

**Base URL:** `NEXT_PUBLIC_API_BASE_URL` must point at the backend origin
**including `/api/v1`** (e.g. `http://localhost:8000/api/v1` dev,
`https://api.oorvashee.com/api/v1` prod). The current default `:4000` is
wrong and is fixed in F0.

**Auth header:** in client components, the token comes from Clerk's
`getToken()`. `apiFetch` accepts an optional `token`; a thin
`useApiClient()` hook injects it for authenticated calls. Server components
that need auth use Clerk's server `auth()` → `getToken()`.

---

## 4. State architecture

| State | Home | Why |
|---|---|---|
| Catalog, product, categories, orders | TanStack Query | server cache, dedupe, revalidation |
| Cart (guest) | Zustand + localStorage | F3: instant/offline; merged via `/account/cart/merge` on sign-in (`CartSync`) |
| Cart (authenticated) | Server cart via TanStack (`["cart"]`); mutations return full `CartRead` → cache replace; optimistic qty/remove | F3: backend source of truth. **`useCart` unifies both** — components never branch on auth |
| Wishlist | Server via TanStack (`["wishlist"]`), **auth-only** | F3: `useWishlist`; guests get a sign-in prompt (no fake local wishlist) |
| Saved addresses | Zustand + localStorage (`address-store`) | F5: **no backend customer address API** — client address book (the user's own data); prefills checkout. Swap to TanStack when an API lands. |
| Profile / identity | Clerk (`useAuthSession`) | F5: no backend profile endpoint — name/email/avatar/role read from Clerk |
| UI (drawers, modals, mobile menu) | Zustand `ui-store` | ephemeral, client-only |
| Auth/session | Clerk | not in our stores |

**Cart totals:** the client may show an *optimistic estimate* but the
**authoritative totals come from `/checkout/quote`**. Remove the hardcoded
`shipping ₹149 under ₹2999` rule from `selectCartTotals` once quote is wired
(F4) — keep it only as a pre-quote placeholder.

**Hydration:** persisted Zustand stores must not be read during SSR render
in a way that diverges from the server HTML. Gate reads behind a mounted
flag (or `useEffect`) for any value that affects first paint (e.g. cart
count badge).

---

## 5. Auth architecture (F2 — implemented)

**Package:** `@clerk/nextjs` **pinned to v6.39.5** (stable App-Router API). v7
ships a new "signals" hooks API (`useSignIn` → `SignInSignalValue`, no
`isLoaded`) incompatible with the documented custom-flow code and the backend's
`useAuth().getToken()` assumptions — v6 is the production-correct choice.

**Graceful-degradation seam (`lib/auth/config.ts`).** `CLERK_ENABLED =
!!NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`. When unset, the app builds + runs
**guest-only**: no `ClerkProvider`, no proxy protection, `useAuthSession`
returns a guest. When the key is present, the full auth layer activates with no
code change. `CLERK_ENABLED` is a build-stable constant, so hooks/components
select a Clerk-vs-guest implementation at module scope (Rules-of-Hooks safe).

**Component/seam map:**
| Concern | File |
|---|---|
| Conditional `ClerkProvider` (brand `appearance`, sign-in/up URLs) | `lib/auth/auth-provider.tsx` (mounted outermost in `providers/index.tsx`) |
| Unified auth state (`isLoaded/isSignedIn/userId/role/email/signOut`) | `lib/auth/use-auth-session.ts` — **no component imports Clerk directly** |
| Token injection into the API client | `hooks/use-api-client.ts` → `useAuth().getToken()` |
| Protected-route gate (Next 16 **`proxy.ts`**, not middleware) | `src/proxy.ts` |
| Custom sign-in/up flows on the **approved UI** | `features/auth/{sign-in,sign-up}-form.tsx` |
| Routes | `app/sign-in/[[...sign-in]]`, `app/sign-up/[[...sign-up]]`, `app/sso-callback` |
| Protected account dashboard | `app/account/page.tsx` → `features/account/account-guard.tsx` + `account-dashboard.tsx` |

**Token flow.** Client `getToken({ template? })` → `Authorization: Bearer
<jwt>` on `/account/*`, `/cart/*`, authed checkout (via `authedFetch`). Clerk
auto-refreshes; on a backend **401** the client force-refreshes once
(`skipCache`) and retries — seamless. The backend reads `email` + `role` claims,
so the Clerk **session token must be customised** to include them (or a named
template via `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`). The backend verifies via JWKS
and provisions the local user through the Clerk webhook — the frontend only
sends the token; it never creates users.

**RBAC.** Role is read client-side from `user.publicMetadata.role` (mirrors the
backend's `public_metadata.role`); `proxy.ts` gates `/admin` to `role=admin`.
This is **UX-only** — the backend independently enforces 403 on every `/admin`
+ `/account` API. No frontend-only security assumption.

**Protected routing.** `proxy.ts` runs `clerkMiddleware`; `/account`, `/cart`,
`/admin` require a session (`auth.protect()` → redirect to sign-in); `/admin`
additionally requires the admin role. The account page adds a client guard as
defence-in-depth + a flicker-free hold while the session restores.

**No-flicker contract.** Navbar account icon is identical in both states
(href flips to `/sign-in` only once known-signed-out); ClerkProvider absent in
guest mode; account page holds a spinner until `isLoaded`.

---

## 6. Backend integration patterns

- **Read flow:** Server Component calls the api module directly (server
  fetch) for first paint + SEO; client islands use the TanStack hook for
  interactions (filter changes, pagination). Same api module, two callers.
- **Write flow:** mutation hook → api module POST/PATCH → optimistic Zustand
  update → invalidate the relevant query key on success → toast on error.
- **Idempotency:** `/checkout/orders` and `/payments/verify` send a
  client-generated `Idempotency-Key` (UUID per submit attempt), retried
  safely.
- **Errors:** `ApiError` carries the backend's `{detail, code, request_id}`.
  A shared `toastApiError(err)` maps `code` → friendly copy and logs
  `request_id` for support.

---

## 7. Environment setup

| Var | Example (dev) | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api/v1` | includes `/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | for canonical/SEO |
| `NEXT_PUBLIC_USE_MOCK_API` | `false` once F1 lands | dev-only escape hatch |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_…` | public key id |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_…` | F2 |
| `CLERK_SECRET_KEY` | `sk_test_…` | server only, F2 |
| `RAZORPAY_KEY_SECRET` | — | only if a server route ever needs it; verify is backend-owned |

Prod values live in Vercel project env. Never commit `.env.local`.

---

## 8. Deployment strategy

- **Vercel** (PRD §8) — native Next.js, edge CDN, deploy from Git.
- Frontend at `oorvashee.com`; backend at `api.oorvashee.com/api/v1`.
- CORS: backend allowlist already includes the prod origin + `*.vercel.app`
  preview pattern.
- Preview deploys per PR; production on `main`.

---

## 9. Performance strategy

- `next/image` everywhere (PRD design rule). Cloudinary `f_auto,q_auto` +
  responsive `sizes`. Backend provides pre-generated eager transforms.
- RSC streaming; `loading.tsx` skeletons per route.
- Dynamic-import heavy client islands (carousels, buy-zone) where below fold.
- Query `staleTime` tuned per resource (catalog 60s, product 5min).
- Avoid layout shift: fixed aspect ratios on product images (3:4).

---

## 10. Responsive + reusable conventions

- Mobile-first; majority bot traffic is mobile.
- All reuse goes through `components/ui` (primitives) and
  `components/shared` (brand). Feature-specific stays in `features/<x>`.
- Animations use `src/animations` shared `motion` variants; animate only
  `opacity` / `transform` / `scale`.
- Loading: skeleton matching the final layout. Error: inline + toast. Empty:
  branded empty-state with a CTA (never a blank screen).

---

## 10a. Admin console architecture (F7)

The admin surface lives entirely under `app/admin/` and **reuses the storefront
design system** — no new component library, no separate theme. It feels like
premium commerce operations software, not a bootstrap template.

```
app/admin/
├── layout.tsx                  # robots:{index:false} + <AdminShell>
├── page.tsx                    # dashboard (KPIs / fulfillment tiles / top products)
├── products/
│   ├── page.tsx                # list (search + status chips + pagination)
│   ├── new/page.tsx            # minimal create → redirect to edit
│   └── [number]/page.tsx       # edit (details/SEO/visibility/variants/transitions/media)
├── orders/
│   ├── page.tsx                # list (search + status chips, ?status= deep-link via Suspense)
│   └── [id]/page.tsx           # detail (status bar / timeline / notes / totals / shipment)
├── inventory/page.tsx          # table + low-stock filter + adjust dialog
├── categories/page.tsx         # hierarchy tree + activate/archive
└── customers/page.tsx          # table + search

features/admin/
├── admin-shell.tsx             # RBAC guard + topbar + nav (sidebar / mobile tabs); AdminHeading
├── ui.tsx                      # StatCard, StatusBadge+statusTone, AdminCard, AdminEmpty,
│                               #   TableSkeleton, Pagination, AdminError, fmtINR, fmtDate
└── product-media.tsx           # Cloudinary drag/drop upload + grid + delete

lib/admin/api.ts                # admin API seam (snake_case DTOs → domain), all take authedFetch
types/admin.ts                  # admin domain types (camelCase)
```

**Same layering as the storefront** (§1): pages → `lib/admin/api.ts` (the admin
analogue of `lib/api`) → TanStack Query. The admin API seam is the **only**
place admin backend field names appear; every function takes `authedFetch`
(Clerk admin token, 401 refresh-retry). Server state is TanStack Query
(`["admin-products"]`, `["admin-order", id]`, `["admin-inventory"]`, …);
mutations `setQueryData`/`invalidateQueries` and `toastApiError` on failure.

**RBAC** (mirrors §5): `AdminShell` gates on `useAuthSession().role === "admin"`
+ `CLERK_ENABLED` (spinner while loading, "Admin access required" otherwise) —
**UX/defense-in-depth only**; `proxy.ts` protects the route and the backend
enforces 403 on every `/admin` API independently.

**Media (Cloudinary, real signed flow):** `signUpload` → `uploadToCloudinary`
(POST FormData with the exact signed param set) → `attachProductImage` (full
Cloudinary response re-verified server-side). No reposition endpoint → order =
position-on-upload + delete.

**Charts:** none. CSS mini-bars + `StatCard` tiles keep the dashboard premium
and dependency-light (no chart library added).

**Keys:** admin orders are addressed by **id (UUID)**, not `order_number`.

---

## 10b. SEO, performance & monitoring (F6)

All of the below is **additive and non-visual** — no layout, theme, or flow
changed. It layers production concerns onto the finished UI.

**Structured data (`lib/seo/jsonld.tsx`)** — the single seam for schema.org
markup. Pure builder functions return plain objects; `<JsonLd>` renders them as
a sanitised `application/ld+json` script (`<` → `<`, the Next.js-recommended
XSS guard for backend-sourced strings). `absoluteUrl(path)` resolves canonical
URLs against `siteConfig.url`. Emitted as **Server Components only**:
- Root layout → `Store`/`Organization` + `WebSite` (with `@id` cross-refs).
- Product page → `Product` (real price/currency/availability/sku/images) + `BreadcrumbList` (Home → category → product).
- Category page → `BreadcrumbList` (Home → Sarees → category).
- No `SearchAction` (there is no `/search` route yet — don't point crawlers at a 404).

**Metadata routes** (Next file conventions, app root):
- `sitemap.ts` — static + canonical category slugs (`siteConfig.nav`) + live products (`listProducts`, paginated, capped). **Resilient**: every backend read is `try/catch`'d, so a build/runtime with the backend down still emits static + nav routes. `revalidate=3600`.
- `robots.ts` — allow catalog/marketing; disallow operational/personal surfaces (`/admin`, `/account`, `/cart`, `/checkout`, `/wishlist`, auth, `/orders/`); declares sitemap + host.
- `manifest.ts` — installable metadata, palette colours.
- `opengraph-image.tsx` (+ `twitter-image.tsx` re-export) — dynamic brand card via `next/og` `ImageResponse` (no font/asset dependency, statically optimised). This is the **single default OG source**; the old hardcoded (missing) `/og.jpg` references were removed from root metadata. Product `generateMetadata` still overrides with the product image.

**Performance**
- `next.config.ts` images: `formats: ["image/avif","image/webp"]` + `minimumCacheTTL` 24h. Cloudinary URLs already carry `f_auto,q_auto`; this covers the Next optimizer for all sources. Existing `next/image` usage (fill + responsive `sizes` + `priority` on LCP) is unchanged.
- Catalog/product/category pages stay `force-dynamic` (live price/stock; `next build` independent of backend). `sitemap` uses ISR.
- TanStack retry is now a predicate: transient/5xx → retry once; **4xx → never** (a 401/403/404/422 won't change on retry). `staleTime` 60s / `gcTime` 5m / `refetchOnWindowFocus:false` unchanged.

**Resilience & a11y**
- `global-error.tsx` — last-resort boundary for root-layout failures; renders its own `<html>/<body>`, **dependency-free + inline-styled** so it works even if the shell/CSS failed. Complements the existing branded `error.tsx` (route segment) + `not-found.tsx` + per-route `loading.tsx`.
- `prefers-reduced-motion: reduce` in `globals.css` neutralises animation/transition durations for users who request it (no effect otherwise). Existing `focus-visible` rings + semantic landmarks retained.

**Monitoring seam (non-intrusive)**
- `lib/analytics/index.ts` — `track(event)` over a **typed event union** (commerce + `web_vital`). No-op until a sink is attached: pushes to `window.dataLayer` (GTM) if present, fans out to any `registerAnalyticsSink()` consumer (PostHog/GA/etc.), and dev-logs otherwise. **Zero third-party weight/network until wired** in production.
- `components/web-vitals.tsx` — `useReportWebVitals` (from `next/web-vitals`, built-in — no new dep) → `track({name:"web_vital",…})`. Mounted once in the root layout; the `'use client'` boundary is confined to this tiny component.

---

## 11. Integration Roadmap (authoritative sequencing)

| Phase | Deliverable | Visual change? | Depends on |
|---|---|---|---|
| **F0** | Fix base URL + `/api/v1`; `apiFetch` auth+idempotency hooks; DTO mapper layer + types aligned to backend; `toastApiError`. | None | — |
| **F1 ✅** | Real catalog reads (list/detail/categories) behind mappers + presenter seam; **hybrid** dynamic `saris/[category]`; **canonical `/product/[slug]`** + archived "unavailable" 200 state; legacy product 308s; loading/error/404/empty states; catalog mock retired. Build + lint green; live E2E pending (CURRENT_STATUS §10). | None (same UI, real data) | F0 |
| **F2 ✅** | Clerk v6 (graceful-degradation seam): conditional provider, custom sign-in/up flows on the approved UI, `proxy.ts` route protection + admin RBAC, `getToken` injection (401 refresh-retry), protected account dashboard, auth-aware navbar. | None (approved auth UI preserved exactly) | F0 |
| **F3 ✅** | Unified `useCart` (guest Zustand ↔ server cart, optimistic) + `/account/cart` wiring + guest merge-on-login (`CartSync`); `useWishlist` (auth-only) + `/account/wishlist`; `/cart` + `/wishlist` pages; product-card heart+bag + PDP add-to-cart/buy-now with variant resolution; `/checkout` CTA placeholder. | None (new pages built in the approved design system) | F2 |
| **F4 ✅** | `useCheckout` (quote → place-order w/ Idempotency-Key → Razorpay widget → verify; COD path); `/checkout` form (RHF+zod), `/checkout/success`, `/orders/[number]` guest tracking, `/account/orders` + `/account/orders/[number]`; shared `OrderDetailView` with status track; recovery (cancel/fail; webhook is source of truth). | New checkout/order pages built in the approved design system | F3 |
| **F5 ✅** | Cohesive account section: `AccountShell` (Navbar + guard + persistent nav, mobile tabs) wrapping Overview / Orders / Addresses / Profile; client address book (prefills checkout + save-to-book); Clerk-identity profile + sign-out; `/support` trust page. (Order confirmation/tracking shipped in F4.) | New account/support pages in the approved design system | F4 |
| **F6 ✅** | Production hardening: structured data (Organization/WebSite/Product/Breadcrumb JSON-LD), `sitemap.xml`/`robots.txt`/`manifest`, dynamic OG+Twitter image, enriched metadata; `next/image` AVIF/WebP; `global-error.tsx`; smarter query retry (no 4xx retries); `prefers-reduced-motion`; dependency-free analytics + web-vitals seam. **All non-visual.** Build + lint green; live SEO/CWV verification pending (CURRENT_STATUS §13b). | None | F1–F5 |
| **F8 ✅** | Final system audit + completion pass: built **search** (`/search?q=` + wired navbar/mobile inputs), turned the dead **`/video`** nav link into a real YouTube-embed page, removed a placeholder WhatsApp number, unified free-shipping copy via `siteConfig.freeShippingThreshold`, and flipped `NEXT_PUBLIC_USE_MOCK_API` default to `false` (prod-safe). Audited architecture/contracts/real-data/taxonomy — clean. Build + lint green. | None (additive search/video in approved design) | F0–F7 |
| **F7 ✅** | Complete admin operations console at `/admin`: shell + RBAC guard, dashboard (KPIs/fulfillment/top-products), products (list/edit/create + Cloudinary signed media), orders (list/detail + status transitions/shipment/cancel/notes), inventory (+ adjust dialog), categories (hierarchy + activate/archive), customers. Admin API seam (`lib/admin/api.ts`) + domain types (`types/admin.ts`) + admin UI kit. Build + lint green; live E2E pending (CURRENT_STATUS §13a). | New (admin-only), built in the storefront design language | F2 |

Each phase ends with: build passes, lint passes, the touched flows verified
against the **live backend** (not mock), docs updated.
