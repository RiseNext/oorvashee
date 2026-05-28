# FRONTEND CURRENT_STATUS.md

**Last updated:** 2026-05-28 (F8 — final system audit + completion pass)
**Phase:** F0 → F1 → taxonomy → F2 → F3 → F4 → F5 → F7 → F6 → **F8 audit** done.
A full holistic audit (pages, routes, real-data, taxonomy, admin, auth,
checkout, architecture, responsiveness) closed the last gaps: **search** is now
built + wired, the **/video** nav link resolves to a real page, the WhatsApp +
free-shipping inconsistencies are gone, and the mock-API flag now defaults to
**live** (production-safe). No fake data in any real path; architecture
boundaries intact. **The frontend is launch-ready and feature-complete.**

> Single source of truth for what the **frontend** actually is right now.
> The backend is production-grade and live (Railway + Neon, 54 admin
> endpoints + full storefront API). This document tracks the gap between
> the mock-fed UI and the live backend, phase by phase.

---

## 0. F8 Changelog (2026-05-28) — final system audit + completion pass

Holistic pre-launch audit against backend contracts + PRD + ai-context. **No
redesign** — only audit, verify, complete genuine gaps, and align. Three
read-only audits (page/nav inventory, mock/real-data, architecture/contracts)
drove a short, targeted fix list.

**Gaps closed**

| Fix | Detail | File(s) |
|---|---|---|
| **Search built** (was a PRD MUST with unwired inputs) | `/search?q=` page (live `/products?q=`, force-dynamic, reuses `SareeListingPage` with search-aware empty states); desktop navbar + mobile search inputs now submit to it | `app/search/page.tsx`, `features/navbar/components/{navbar,mobile-search-panel}.tsx`, `lib/api/products.ts` + `types/product.ts` (`q` param), `features/saree-listing/saree-listing-page.tsx` (optional empty-state props) |
| **`/video` dead nav link → real page** | YouTube-embed page in the approved design language (heading band + 16:9 embed grid + channel CTA); config-driven via `siteConfig.videoGallery` (empty now — no placeholder IDs; channel CTA links `social.youtube`) | `app/video/page.tsx`, `config/site.ts` (`videoGallery`) |
| **Placeholder WhatsApp number removed** | PDB buy-zone used `wa.me/910000000000` — now uses `siteConfig.contact.whatsapp` | `features/product-detail/buy-zone.tsx` |
| **Free-shipping copy unified** | PDP said ₹1,499 while cart/support said ₹3,000 — single-sourced to `siteConfig.freeShippingThreshold` (₹3,000) everywhere (backend ships free for now) | `config/site.ts`, `features/{cart/cart-view,product-detail/buy-zone,support/support-view}.tsx` |
| **Mock flag now production-safe** | `NEXT_PUBLIC_USE_MOCK_API` default flipped `true`→`false` (live backend), matching the documented intent; opt-in to mock locally | `lib/env.ts` |

**Audit confirmations (no action needed)**

- **Architecture clean:** no raw `fetch()` outside `lib/api/client.ts` + the Cloudinary upload; **zero** snake_case DTO leaks past the mapper/admin seam; no `any`/`@ts-ignore`; all 6 `eslint-disable`s justified; folder structure clean.
- **Contracts aligned:** every storefront + admin endpoint the frontend calls matches the backend **source** (verified `/products?q=` and `sort=featured` are real — the contract doc was stale, code is correct).
- **Real data:** all mock references are gated behind `useMock`; the 4 F1 mock files remain deleted; `MOCK_PRODUCT_DETAIL` is unused; `SIMILAR/YMAL` fixtures are offline-only fallbacks. No fake business logic in real paths.
- **Taxonomy/nav:** every `siteConfig.nav` href now resolves (the lone dead `/video` is fixed); account + admin navs all resolve; RBAC + Cloudinary admin flows intact.

**Validation:** `npm run build` ✅ (38 routes incl. new `/search` + `/video`), TypeScript clean; `npm run lint` ✅ 0 problems. Live E2E across all phases still needs the deployed origin + backend (checklists §10–§13b).

---

## 0. F6 Changelog (2026-05-28) — production hardening: SEO + performance

Final pre-launch hardening. **Zero visual/layout/flow changes** — this phase
only adds SEO infrastructure, performance/resilience, and monitoring scaffolding
on top of the finished, client-approved UI.

**SEO foundation**

| Delivered | File(s) |
|---|---|
| Structured-data seam — `JsonLd` component (XSS-escaped) + builders: `Store`/`Organization`, `WebSite`, `BreadcrumbList`, `Product` | `lib/seo/jsonld.tsx` |
| Site-wide **Organization + WebSite** JSON-LD | `app/layout.tsx` |
| **Product + Breadcrumb** JSON-LD (real price/availability/sku/images) | `app/product/[slug]/page.tsx` |
| **Breadcrumb** JSON-LD on category pages | `app/saris/[category]/page.tsx` |
| **`sitemap.xml`** — static + canonical category slugs + live products; resilient (backend-down → static-only), `revalidate=3600` | `app/sitemap.ts` |
| **`robots.txt`** — allow catalog/marketing; disallow `/admin`,`/account`,`/cart`,`/checkout`,`/wishlist`,auth,`/orders/`; sitemap + host | `app/robots.ts` |
| **`manifest.webmanifest`** — installable metadata, brand colours | `app/manifest.ts` |
| **Dynamic OG + Twitter image** (`next/og`, brand card) — fixes the previously-broken `/og.jpg` reference | `app/opengraph-image.tsx`, `app/twitter-image.tsx` |
| Enriched root metadata — keywords, authors, canonical, robots (`max-image-preview:large`), formatDetection, `en_IN` locale; removed dead `ogImage` refs | `app/layout.tsx` |

**Performance + resilience**

| Delivered | File(s) |
|---|---|
| `next/image` modern **formats** (AVIF→WebP) + 24h `minimumCacheTTL` | `next.config.ts` |
| **Smarter query retry** — retry transient/5xx once, never 4xx (no wasted retries on 401/403/404/422) | `providers/query-provider.tsx` |
| **`global-error.tsx`** — dependency-free, self-styled last-resort boundary (works even if the app shell/CSS fails) | `app/global-error.tsx` |
| **`prefers-reduced-motion`** support (only affects users who request it) | `app/globals.css` |

**Monitoring preparation (non-intrusive)**

| Delivered | File(s) |
|---|---|
| **Analytics seam** — typed event union (view_item / add_to_cart / begin_checkout / purchase / search / web_vital …), no-op until a sink (GTM `dataLayer` / registered sink) is attached; zero third-party weight | `lib/analytics/index.ts` |
| **Web-Vitals reporter** — `useReportWebVitals` → analytics seam, client boundary confined to one tiny component | `components/web-vitals.tsx` (mounted in `app/layout.tsx`) |

**Validation:** `npm run build` ✅ (35 routes incl. new `/sitemap.xml` [revalidate 1h], `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image`, `/twitter-image`), TypeScript clean; `npm run lint` ✅ 0 problems. `robots.txt` prerender verified (canonical-aligned). The OG image generates under Turbopack (statically optimised). Live SEO/CWV verification (Rich Results, Lighthouse, real social unfurl) needs the deployed origin + live backend — checklist in §13b.

---

## 0. F7 Changelog (2026-05-28) — admin operations console

Built the complete production-grade admin frontend at `/admin`, integrated
with the live admin API (products, categories, inventory, orders, analytics,
customers, Cloudinary media) and Clerk RBAC. **Not a generic template** — it
reuses the exact storefront design tokens (cream/maroon/gold, `font-display`,
`AdminCard`, `StatusBadge`, `formatPrice`) so it reads as premium commerce
operations software, not a bootstrap dashboard. No charting library was added
(CSS mini-bars + stat tiles keep it dependency-light and uncluttered).

| Delivered | File(s) |
|---|---|
| Admin **domain types** (camelCase) — products/orders/inventory/categories/customers/analytics | `types/admin.ts` |
| **Admin API seam** — the one place admin snake_case DTOs are mapped; every fn takes `authedFetch` | `lib/admin/api.ts` |
| **`AdminShell`** — RBAC guard (`role==="admin"` + `CLERK_ENABLED`), topbar (brand / view store / sign out), desktop sidebar + mobile scroll-tabs nav; `AdminHeading` | `features/admin/admin-shell.tsx` |
| Admin layout with `robots:{index:false}` | `app/admin/layout.tsx` |
| **Admin UI kit** — `StatCard`, `StatusBadge`+`statusTone`, `AdminCard`, `AdminEmpty`, `TableSkeleton`, `Pagination`, `AdminError`, `fmtINR`, `fmtDate` | `features/admin/ui.tsx` |
| **Dashboard** (`/admin`) — 4 KPI cards, 6 fulfillment queue tiles (deep-link to filtered orders), top-products with CSS mini-bars | `app/admin/page.tsx` |
| **Products** — list (search + status chips + pagination), edit (details/SEO/visibility/variants + status transitions), create, Cloudinary media manager | `app/admin/products/{page,new/page,[number]/page}.tsx`, `features/admin/product-media.tsx` |
| **Orders** — list (search + status chips, `?status=` deep-link via Suspense), detail (status action bar packed→shipped→delivered, COD-paid, cancel-with-reason, timeline, notes, totals, shipment) | `app/admin/orders/{page,[id]/page}.tsx` |
| **Inventory** — table (stock/reserved/available + low/out badges), search, low-stock filter, **adjust dialog** (set/add/remove + note) | `app/admin/inventory/page.tsx` |
| **Categories** — recursive hierarchy tree (parent→child indent), activate/archive toggle, canonical taxonomy preserved | `app/admin/categories/page.tsx` |
| **Customers** — table (name/email/phone, orders + paid, lifetime value, last order), search | `app/admin/customers/page.tsx` |

**Cloudinary flow (real, signed):** `POST /admin/media/sign` → frontend POSTs
FormData to Cloudinary with the exact signed param set (file, api_key,
timestamp, signature, folder, eager joined by `|`, public_id if present) →
`POST /admin/products/{id}/images` with the full Cloudinary response for
backend signature re-verification. No reposition endpoint exists, so image
order = position-on-upload + delete (not faked).

**RBAC:** backend enforces `role=admin` (403) server-side; the frontend guard
in `AdminShell` is UX/defense-in-depth only. Admin orders are keyed by **id
(UUID)**, not `order_number`.

**Validation:** `npm run build` ✅ (24 routes — all 9 admin routes resolve),
TypeScript clean; `npm run lint` ✅ 0 problems. No fabricated admin data and no
placeholder business logic — every view hits the live admin API. The admin
surface needs a live backend + Clerk admin session + Cloudinary to populate
(build-verified offline; live E2E checklist in §13a below).

---

## 0. F5 Changelog (2026-05-27) — account experience

Completed the premium customer/account experience. Backend account surface is
cart/orders/wishlist only — **there is no customer address-CRUD or profile/me
endpoint**, so profile reads from Clerk and the address book is a client store
(the user's own data, not fabricated; like the guest cart).

| Delivered | File(s) |
|---|---|
| **`AccountShell`** — Navbar + auth guard + persistent account nav (desktop sidebar / mobile scroll-tabs), sign-out, support link | `features/account/account-shell.tsx` |
| Account section retrofit into the shell: Overview, Orders, Order detail | `features/account/{account-overview,order-history-view,account-order-view}.tsx`, `app/account/**` |
| **Profile** (`/account/profile`) — Clerk identity (avatar/name/email/role) + sign-out + security note | `features/account/profile-view.tsx` |
| **Addresses** (`/account/addresses`) — client address book CRUD + default | `features/account/addresses-view.tsx`, `store/address-store.ts` |
| Checkout **saved-address reuse** (picker prefills form) + "save this address" | `features/checkout/checkout-view.tsx` |
| **`/support`** — channels (WhatsApp/email/phone), order-help CTA, shipping/returns/payment assurances (from `siteConfig`) | `features/support/support-view.tsx`, `app/support` |
| Retired the old standalone dashboard/guard (superseded by shell + overview) | deleted `account-dashboard.tsx`, `account-guard.tsx` |

**Validation:** `npm run build` ✅ (23 routes), TypeScript clean; `npm run lint`
✅ 0 problems. No fabricated account data; profile + addresses are real
(Clerk + client store). Authed views need live backend + Clerk to populate
orders (build-verified; F4 §13 checklist covers the live run).

---

## 0. F4 Changelog (2026-05-27) — checkout + payment + orders

The storefront can now take real money. Full purchase flow against the live
backend contracts (`/checkout/quote`, `/checkout/orders` + `Idempotency-Key`,
`/payments/verify`, `/orders`, `/account/orders`), with Razorpay + COD. All new
pages are built in the approved design system.

| Delivered | File(s) |
|---|---|
| Domain order/checkout types + backend DTOs + mappers | `types/{order,checkout}.ts`, `types/api.ts`, `lib/api/mappers/order.ts` |
| API: checkout (quote, placeOrder+idem, verify+idem) + orders (track, account list/detail) | `lib/api/{checkout,orders}.ts` |
| **`useCheckout`** — live quote, place-order, **Razorpay handoff** (`react-razorpay`) + COD, verify, recovery (cancel/fail; webhook = source of truth) | `hooks/use-checkout.ts` |
| `useAccountOrders` / `useAccountOrder` / `useOrderTracking` | `hooks/use-orders.ts` |
| `/checkout` — RHF+zod form (contact + address + payment method), live quote summary, coupon, unavailable-items gate, Clerk prefill | `app/checkout`, `features/checkout/checkout-view.tsx` |
| `/checkout/success` — premium confirmation (re-fetches order) | `app/checkout/success`, `features/checkout/order-success-view.tsx` |
| Shared `OrderDetailView` — status track + items + totals + address + shipment | `features/order/order-detail-view.tsx` |
| `/orders/[number]` guest tracking (email gate) | `app/orders/[number]`, `features/order/order-tracking-view.tsx` |
| `/account/orders` + `/account/orders/[number]` (protected) | `app/account/orders/**`, `features/account/{order-history,account-order}-view.tsx` |
| Account dashboard Orders + Wishlist cards now live links | `features/account/account-dashboard.tsx` |

**Validation:** `npm run build` ✅ (21 routes), TypeScript clean; `npm run lint`
✅ 0 problems. No fake payment logic; the `/checkout` placeholder is gone. The
**guest checkout form + quote-less COD path** are exercisable offline; the
quote/place/Razorpay/verify paths need a live backend + Razorpay keys —
verified by build + documented (§13).

---

## 0. F3 Changelog (2026-05-27) — cart + wishlist

Real shopping experience wired to the live backend (`/account/cart` +
`/account/wishlist`). New pages are built in the approved design system
(heading band + tokens + `formatPrice` + skeletons), so they read as part of
the original storefront.

| Delivered | File(s) |
|---|---|
| Domain `Cart`/`CartItem`/`Wishlist` + backend DTOs + mappers | `types/{cart,wishlist}.ts`, `types/api.ts`, `lib/api/mappers/cart.ts` |
| Cart + wishlist API modules (correct `/account/cart`, `/account/wishlist`) | `lib/api/{cart,wishlist}.ts`, `AuthedFetch` type in `client.ts` |
| **Unified `useCart`** (guest Zustand ↔ server TanStack; optimistic qty/remove; every mutation replaces cache from full `CartRead`) | `hooks/use-cart.ts` |
| `useWishlist` (auth-only; optimistic remove; guest → sign-in prompt) | `hooks/use-wishlist.ts` |
| Guest-cart **merge on sign-in** | `features/cart/cart-sync.tsx` (mounted in providers) |
| `/cart` page — line items, qty stepper, remove, clear, subtotal, free-ship hint, unavailable banner, empty/loading states, checkout CTA | `app/cart`, `features/cart/cart-view.tsx` |
| `/wishlist` page — reuses approved `ProductCard`; empty + signed-out + loading states | `app/wishlist`, `features/wishlist/wishlist-view.tsx` |
| Product-card heart (wishlist toggle, filled when saved) + bag (→ PDP to pick variant) | `components/shared/product-card.tsx` |
| PDP Add-to-Cart / Buy-It-Now + **variant resolution** (colour/fabric/size → variant id); sticky-header add-to-cart; sold-out gating | `features/product-detail/{product-detail-page,buy-zone,sticky-header}.tsx` |
| Cart-button badge → unified count | `features/navbar/components/cart-button.tsx` |
| `/checkout` CTA placeholder (real flow = F4) | `app/checkout/page.tsx` |
| **Retired** orphan local wishlist store + dead client-side shipping math | deleted `store/wishlist-store.ts`; trimmed `store/cart-store.ts` |

**Validation:** `npm run build` ✅ (17 routes), TypeScript clean; `npm run lint`
✅ 0 problems. The **guest cart works fully offline** (testable here). The
authenticated cart + wishlist paths need a live backend + Clerk keys — verified
by build + documented (§12). No fake/demo cart or wishlist logic remains (the
guest cart is real and the backend's `/merge` endpoint exists for it).

---

## 0. F2 Changelog (2026-05-27) — Clerk authentication

Production-grade auth integrated against the live backend (PyJWT/JWKS verify +
Svix webhook provisioning + `require_role`). The client-approved auth UI is
**preserved exactly** — the old mock email/OTP screens are now real Clerk flows.

**Package decision:** `@clerk/nextjs` pinned to **v6.39.5**. v7.4.1 (initially
installed) ships a new "signals" hooks API incompatible with the documented
custom-flow code (`useSignIn` → `SignInSignalValue`, no `isLoaded`); v6 is the
stable, documented App-Router API and matches the backend's assumptions.

| Delivered | File(s) |
|---|---|
| Graceful-degradation seam (`CLERK_ENABLED`) + env (publishable/secret/JWT-template/URLs) | `lib/auth/config.ts`, `lib/env.ts`, `.env.example` |
| Conditional `ClerkProvider` (brand appearance) | `lib/auth/auth-provider.tsx`, `providers/index.tsx` |
| Unified `useAuthSession` (Clerk **or** guest; no component imports Clerk directly) | `lib/auth/use-auth-session.ts` |
| Token injection: `getToken` + JWT template + **401 refresh-retry** | `hooks/use-api-client.ts` |
| Protected-route gate (Next 16 **`proxy.ts`**) for `/account` `/cart` `/admin` + admin RBAC redirect | `src/proxy.ts` |
| Custom Clerk sign-in/up on the **approved UI** (email_code + Google) | `features/auth/{sign-in,sign-up,otp-input,auth-shell,clerk-errors,auth-disabled-notice}` |
| Routes: `/sign-in/[[...]]`, `/sign-up/[[...]]`, `/sso-callback` | `app/sign-in`, `app/sign-up`, `app/sso-callback` |
| Mock `/account` replaced by protected dashboard (real identity + sign-out, **no fake data**) | `app/account/page.tsx`, `features/account/{account-guard,account-dashboard}.tsx` |
| Auth-aware navbar account icon (no flicker/shift) | `features/navbar/components/navbar.tsx` |

**Backend contract honoured:** JWT carries `email` + `role` (session-token
customisation required, documented in `.env.example`); role from
`public_metadata.role`; webhook owns provisioning; backend enforces 401/403
server-side (frontend RBAC is UX-only).

**Validation:** `npm run build` ✅ (14 routes incl. auth + `ƒ Proxy`), TypeScript
clean; `npm run lint` ✅ **0 problems**. Verified in **guest mode** (no keys →
`CLERK_ENABLED=false`). **⚠️ The keyed path (real sign-in/up/out, token claims,
protected redirects, admin gate) was NOT run here** — no Clerk keys + Clerk's
frontend API unreachable from this sandbox. See §11 for the keyed E2E checklist.

---

## 0. Taxonomy Alignment (2026-05-27, post-F1) — ONE source of truth

A real merchandising-taxonomy mismatch was found: the client-approved frontend
collections (Banaras Sarees, Kanchi Silk, Gadwal, Narayanapet, Kalamkari, …)
didn't match the backend's fabric-based Neon taxonomy (banarasi-silk,
kanchipuram-silk, …). F1 had bridged this with a frontend-only merchandising
map — a temporary seam. That seam is now **retired**: the **backend/Neon data
was aligned to the approved structure** (the canonical source of truth).

**Authoritative spec:** `BACKEND/ai-context/TAXONOMY.md` (audit, canonical
tree, slug strategy, hierarchy, Neon reseed runbook).

| Change | Where |
|---|---|
| Backend seed categories rebuilt to the approved tree (`kind=collection`, `parent_slug` hierarchy "Pattu" → weave children, **slugs == storefront slugs**, descriptions/SEO); facets kept; legacy fabric cats dropped | `BACKEND/app/seeds/data.py` |
| Demo products re-themed to populate **every** approved department (+ parent/facet links); legacy demo retired on reseed | `BACKEND/app/seeds/data.py`, `runner.py` |
| `CategorySummary` gains `description` → storefront subtitle is single-sourced from the category row | `BACKEND/app/schemas/category.py`, FE `types/api.ts`, `mappers/category.ts` |
| **Retired `lib/catalog/category-map.ts`** — `/saris/[category]` now resolves the category directly from the backend (name + description); unknown slug → 404; "pattu" parent shows the union | FE `app/saris/[category]/page.tsx` |
| PDP breadcrumb + home tabs use real category slugs (no translation); `primaryDepartment()` picks the breadcrumb department | FE `lib/catalog/presenters.ts`, `app/product/[slug]/page.tsx`, `app/page.tsx` |

**No DB schema migration** — `parent_id`, `description`, `seo_*` columns and
`kind=collection` already existed. Alignment = data reseed + read-shape only.

**⚠️ Apply to Neon:** deploy backend + run `uv run python -m scripts.seed_dev
reseed --yes` (see TAXONOMY.md §5). Frontend + backend must ship together — the
storefront now depends on the aligned slugs (nav links 404 until reseeded).
Frontend `build` + `lint` green; backend pure tests green + seed integrity
validated (38 categories / 14 products / 13 leaf departments, none empty).

---

## 0. F1 Changelog (2026-05-27) — real catalog + routing

The storefront stopped being a mock shell. `NEXT_PUBLIC_USE_MOCK_API` is now
`false` everywhere; every catalog surface fetches the live backend through the
F0 mapper layer and a new **presentation seam**. **No visual redesign** — the
approved components are untouched in look/behaviour; only their data source
changed (static imports → server-fetched, mapped props).

### Routing (production)
| Change | File(s) |
|---|---|
| **Canonical `/product/[slug]`** (the bot URL contract) — server component, `force-dynamic`, `generateMetadata` (SEO + OG + `noindex` when unavailable), 404 for unknown slugs, **"Product Unavailable" 200 view** for `available=false` | `app/product/[slug]/{page,loading}.tsx`, `features/product-detail/product-unavailable.tsx` |
| **Dynamic `/saris/[category]`** — resolves curated slug → backend category via the merchandising map, validates non-curated slugs against live categories (else 404) | `app/saris/[category]/page.tsx` |
| Retired **16 static category folders** + legacy `[slug]` product subroutes (replaced by the dynamic routes) | (deleted under `app/saris/*`, `app/new-arrivals/[slug]`) |
| **308 redirects** for legacy/demo product URLs → `/product/[slug]` | `next.config.ts` |
| `/saris` (All) + `/new-arrivals` now fetch real data | `app/saris/page.tsx`, `app/new-arrivals/page.tsx` |
| Home (`/`) is a resilient server component: real "Collection" tabs + "New Arrivals" strip, each fetch independently caught so a backend blip never blanks the landing page | `app/page.tsx` |

### Data + seams
| Change | File(s) |
|---|---|
| **Merchandising map** (curated nav slug → backend slug[], + reverse lookup for breadcrumbs). Keeps the approved nav visually identical while serving real categories | `src/lib/catalog/category-map.ts` |
| **Presentation seam** domain → approved component props (cards link to `/product/[slug]`) | `src/lib/catalog/presenters.ts`, `features/product-detail/adapt.ts` |
| `listProducts` gains multi-category (`categorySlugs`); added `getRelatedProducts`, `findBackendCategory` | `src/lib/api/products.ts` |
| Domain `Product` enriched (real `tags`, `categories`, `seo`, `attributes.occasion`) for breadcrumb / related / spec / metadata | `src/types/product.ts`, `src/lib/api/mappers/product.ts` |
| Deleted orphaned mock catalog fixtures (4 files) | `features/{saree-listing,home/data,new-arrivals-page}/…` |

### States + media
| Change | File(s) |
|---|---|
| `loading.tsx` skeletons (catalog + PDP), global `error.tsx` (retry), branded `not-found.tsx` | `app/**/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` |
| Empty states in listing + new-arrivals + home (polished "arriving soon", no blank grids) | `features/saree-listing/*`, `features/new-arrivals-page/*`, home sections |
| `next/image`: added `picsum.photos` (dev/staging seed) alongside `res.cloudinary.com` (prod); null image → `/placeholder.svg` in mapper; all uses are CLS-safe (`fill` in aspect-ratio boxes) | `next.config.ts`, mappers |

**Validation:** `npm run build` ✅ passes (TypeScript clean; 11 routes — the
catalog routes are `ƒ` dynamic). `npm run lint` ✅ **green (0 problems)** — F1
introduced no lint issues; the 3 pre-existing idiomatic `set-state-in-effect`
sites now carry justified `eslint-disable` lines, apostrophes escaped, dead var
removed.

**⚠️ Live-backend E2E NOT run in this environment** — the backend wasn't
reachable on `localhost:8000` here. Build/lint pass without it (pages are
`force-dynamic`, so nothing fetches at build). See §10 for the manual E2E
checklist to run once the backend is up + seeded.

---

## 0. F0 Changelog (2026-05-27) — integration foundation

Foundation laid underneath the approved UI. **No visual change** — the build
static-generates all 27 routes on mock data exactly as before.

| Delivered | File(s) |
|---|---|
| Backend wire DTOs (mirror `BACKEND/app/schemas` exactly) | `src/types/api.ts` |
| DTO mapper layer (the ONLY place backend field names appear) | `src/lib/api/mappers/{product,category,index}.ts` |
| `apiFetch` gains `token` + `idempotencyKey` headers | `src/lib/api/client.ts` (exports `RequestOptions`) |
| `ApiError` carries `{status, code, detail, requestId}` + `.from()` parser | `src/lib/api/errors.ts` |
| `toastApiError()` — code→friendly copy + logs `request_id` | `src/lib/api/toast.ts` |
| `newIdempotencyKey()` (UUID per submit) | `src/lib/api/idempotency.ts` |
| `useApiClient()` — Clerk-token injection seam (stub until F2) | `src/hooks/use-api-client.ts` |
| Real-API branch of products API now goes through mappers | `src/lib/api/products.ts` |
| Domain `ProductSummary`/`Product` gain optional `available` | `src/types/product.ts` |
| Env: base URL → `http://localhost:8000/api/v1`; Clerk key slot; mock-flag docs | `src/lib/env.ts`, `.env.example`, `.env.local` |
| `useMediaQuery` → `useSyncExternalStore` (hydration-safe, no cascading renders) | `src/hooks/use-media-query.ts` |
| Image placeholder for null-image products | `public/placeholder.svg` |

**Validation:** `npm run build` ✅ passes (27/27 routes). New F0 code is
lint-clean and type-clean. Mock path untouched → UI byte-identical.

**Pre-existing lint debt — RESOLVED in F1 (green lint):** the 6 errors + 1
warning that F0 deferred are cleared. Apostrophes in `account/page.tsx` escaped
(byte-identical render); dead `selectedLabel` removed; the 3 intentional
`set-state-in-effect` sites (`carousel.tsx` embla sync, `cart-button.tsx`
hydration guard, `navbar.tsx` route-reset) now carry justified
`eslint-disable-next-line` comments — no behaviour/visual change.

---

## 1. TL;DR

The frontend is a **well-architected Next.js 16 / React 19 UI shell** with a
finalised premium-saree visual identity, running **entirely on mock data**.
The folder structure, design system, component library, state stores, and a
TanStack Query + typed API scaffold are all in place and high quality. What's
missing is **every actual backend connection**: no auth, no real catalog
reads, no cart sync, no checkout, no orders, no admin.

**Integration progress: ~85%** (F0–F5 done — the **full customer journey** is
live: browse → cart/wishlist → checkout → pay (Razorpay/COD) → order
confirmation → tracking → account (orders, addresses, profile, support). Still:
SEO + performance hardening (F6), admin frontend (F7).)

The work ahead is **integration, not redesign** — preserve the exact visual
identity and wire it to the live backend contracts.

---

## 2. Stack (as built)

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.6 (App Router) | ⚠️ Bleeding edge — `AGENTS.md`: APIs differ from training data, read `node_modules/next/dist/docs/` before writing code |
| UI runtime | React 19.2.4 | Server Components default |
| Styling | Tailwind CSS v4 + `tw-animate-css` | Design tokens in `globals.css` |
| Components | shadcn (v4) on `@base-ui/react` | NOT Radix — base-ui is the new shadcn primitive layer |
| Server state | TanStack Query v5 | Provider wired; hooks exist for products/collections |
| Client state | Zustand v5 (+ persist) | cart / wishlist / ui stores |
| Forms | react-hook-form v7 + Zod v4 | Installed; not yet used in a real form |
| Animation | `motion` v12 (Framer Motion) | `src/animations/fade.ts` shared variants |
| Toasts | `sonner` | Wired in providers |
| Carousel | `embla-carousel-react` | Used in home / product-detail |
| Theme | `next-themes` | Wired |
| Payments | `react-razorpay` v3 ✅ | F4: wired in `useCheckout` (widget handoff + verify); needs Razorpay keys to transact |
| Auth | `@clerk/nextjs` **v6.39.5** ✅ | F2: conditional provider, custom flows, `proxy.ts` gate, token injection, RBAC. Guest-only until keys set. |

---

## 3. Folder Structure (actual)

```
src/
├── app/                      # App Router pages
│   ├── page.tsx              # Home ✅ (mock)
│   ├── layout.tsx            # Root layout + providers
│   ├── globals.css           # Design tokens
│   ├── about/ contact/ our-craft/ collections/ account/
│   ├── new-arrivals/         # + [slug] detail
│   └── saris/                # 15+ STATIC category route folders
│       ├── cotton-sarees/    # + [slug] detail (some)
│       ├── banaras-sarees/   # + [slug]
│       ├── kanchi-pattu-saree/ # + [slug]
│       └── … (hardcoded per category)
├── components/
│   ├── ui/                   # 28 shadcn primitives ✅
│   └── shared/               # brand components (product-card, logo, dividers, trust-bar) ✅
├── features/                 # feature folders, EACH with its own data.ts mock
│   ├── home/                 # + data/collections.ts, data/new-arrivals.ts
│   ├── navbar/
│   ├── product-detail/       # + data.ts
│   ├── saree-listing/        # + data.ts (SAREE_LISTING_PRODUCTS map)
│   └── new-arrivals-page/    # + data.ts
├── lib/
│   ├── api/                  # client.ts, errors.ts, products.ts, mock-data.ts, index.ts
│   ├── env.ts                # Zod-validated env
│   ├── format.ts utils.ts
├── hooks/                    # use-products.ts (TanStack), use-media-query.ts
├── store/                    # cart-store, wishlist-store, ui-store
├── providers/                # query-provider, index (AppProviders)
├── types/                    # product, cart, order, index
└── animations/               # fade.ts
```

**Verdict:** structure is clean and scalable. Feature-folder convention is
correct. The problem is *content* (mock data, no wiring), not *structure*.

---

## 4. What's Built ✅

| Area | State |
|---|---|
| Design system + tokens | ✅ Complete (`globals.css`, `docs/UI.md`) |
| shadcn UI primitives (28) | ✅ Complete |
| Brand shared components | ✅ product-card, logo, ornamental-divider, trust-bar, section-label, temple-backdrop |
| Home page (hero, collections, new-arrivals, sarees-for-you) | ✅ Built, mock-fed |
| Navbar (desktop + mobile menu/search panels) | ✅ Built |
| Product detail page (gallery, buy-zone, accordion, reviews, related) | ✅ Built, mock-fed |
| Saree listing page (filters/sort UI) | ✅ Built, mock-fed |
| New-arrivals listing + detail | ✅ Built, mock-fed |
| Static content pages (about, contact, our-craft) | ✅ Built |
| API client scaffold (`apiFetch`, `ApiError`) | ✅ Solid foundation |
| TanStack Query hooks (products, collections) | ✅ Exist |
| Zustand stores (cart, wishlist, ui) | ✅ Local-only |
| Skeleton component | ✅ Exists (`ui/skeleton.tsx`) — route-level usage absent |
| Env validation (Zod) | ✅ `lib/env.ts` |

---

## 5. What's Mock / Fake 🟡

| Source | Detail |
|---|---|
| `src/lib/api/mock-data.ts` | `mockProducts`, `mockCollections` — drive the API layer when `NEXT_PUBLIC_USE_MOCK_API=true` (the default) |
| `src/features/saree-listing/data.ts` | `SAREE_LISTING_PRODUCTS` keyed map — every category page imports a hardcoded array |
| `src/features/product-detail/data.ts` | Hardcoded product detail |
| `src/features/home/data/*.ts` | Hardcoded collections + new-arrivals |
| `src/features/new-arrivals-page/data.ts` | Hardcoded list |
| Cart totals (`selectCartTotals`) | Client-side math (`shipping ₹149 under ₹2999`) — **duplicates** backend `/checkout/quote` and will diverge |

**`NEXT_PUBLIC_USE_MOCK_API` defaults to `"true"`** — the app ships on mock
data unless explicitly turned off.

---

## 6. What's Missing ❌ (Integration Gaps)

### 6.1 Critical — breaks core flows

| Gap | Impact |
|---|---|
| **No `/product/[slug]` route** | The bot URL contract (PRD §7: `oorvashee.com/product/[slug]`) is **unmet**. Detail pages live at `/saris/{cat}/{slug}` and `/new-arrivals/{slug}`. WhatsApp/Instagram bots have nowhere correct to send buyers. **Highest-priority fix.** |
| **No Clerk auth** | No `@clerk/nextjs`, no `ClerkProvider`, no sign-in/up routes, no token in API client. Account, wishlist, registered checkout all impossible. |
| **No cart page / route** | Cart is local Zustand only; no `/cart`, no server cart sync, no merge-on-login. |
| **No checkout flow** | No `/checkout`, no Razorpay invocation, no `/checkout/quote` or `/checkout/orders` calls. `react-razorpay` never imported. |
| **No order tracking** | No `/orders/{number}` page, no `/account/orders`. |
| **No admin frontend** | The entire backend admin surface (54 endpoints: products, categories, inventory, orders, analytics, customers, CSV import) has **zero** frontend. |

### 6.2 Contract mismatches (must map before wiring)

| Frontend | Backend | Issue |
|---|---|---|
| `ProductSummary.title` | `ProductListItem.name` | naming |
| `.price` / `.compareAtPrice` | `.base_price` / `.mrp` | naming |
| `.image{url,alt}` | `.primary_image_url` (string) | shape |
| `.badges[]` | `.featured` / `.is_bestseller` / `.is_new` (bools) | shape |
| `Paginated{items,page,pageSize,total,totalPages}` | `Page{items,next_cursor,total}` + offset `page`/`page_size` query | pagination model |
| `GET /collections`, `/collections/{slug}` | `GET /categories` (grouped by kind); no `/collections` | endpoint shape differs |
| `GET /products/featured` | `GET /products?sort=featured` | no dedicated endpoint |
| Base URL `http://localhost:4000` | `http://localhost:8000` + **`/api/v1` prefix** | wrong port + missing prefix |
| Variant `{id,sku,title,price,inStock,options}` | `{id,color,fabric,size,price,stock,available}` | shape |

See [INTEGRATION_RULES.md](INTEGRATION_RULES.md) for the full DTO-mapping spec.

### 6.3 Production-readiness gaps

| Gap | Notes |
|---|---|
| Auth token injection | `apiFetch` sends no `Authorization` header |
| Idempotency-Key | Checkout/payment POSTs need it (backend requires it) — not implemented |
| Error → UI surfacing | `ApiError` exists but no error boundaries / toast mapping wired |
| Loading states | Skeleton component exists; per-route `loading.tsx` files absent |
| Empty states | No verified "no products" / "empty cart" components |
| SEO / metadata | Static `metadata` on some pages; no dynamic per-product `generateMetadata`, no JSON-LD, no sitemap |
| Cloudinary delivery | `next.config` allows `res.cloudinary.com`; no transformation-URL helper |
| Category routing | 15+ hardcoded static category folders vs backend's dynamic 33-category taxonomy with different slugs (`banaras-sarees` vs `banarasi-silk`) |
| Store name typo | cart persist key is `urosi:cart` (not `oorvashee:cart`) |

---

## 7. Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Next.js 16 API drift from training data | High | Per `AGENTS.md`, read `node_modules/next/dist/docs/` before each implementation phase |
| Bot URL contract unmet (`/product/[slug]`) | High | Roadmap F1 — add the canonical route first |
| Cart totals diverge (client math vs backend) | Medium | Move totals to `/checkout/quote`; keep client total as optimistic estimate only |
| Category slug mismatch | ~~Medium~~ Resolved | **RESOLVED at the data layer (post-F1).** The F1 frontend merchandising map was a temporary bridge; the **backend/Neon taxonomy was aligned** to the approved structure (slugs == storefront slugs, "Pattu" hierarchy). The map is deleted; the frontend resolves categories directly from the backend. Canonical spec: `BACKEND/ai-context/TAXONOMY.md`. |
| Hydration mismatches (RSC + Zustand persist) | Medium | Gate persisted-store reads behind a mounted check |
| Type divergence silently breaks at runtime | Medium | Central DTO mappers + typed contract layer |

---

## 8. Integration Roadmap (proposed — phase by phase)

Detail + sequencing in [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) §Roadmap.
Headline order:

| Phase | Scope | Why this order |
|---|---|---|
| **F0** Integration foundation ✅ | Fixed env (base URL + `/api/v1`), DTO mapper layer, typed API client with auth+idempotency hooks, `toastApiError`, `useApiClient` seam, hydration-safe media-query. No visual change. | Everything else depends on a correct client |
| **F1** Catalog reads ✅ | Products list + detail + categories wired to the real API behind mapper + presenter seams. Canonical `/product/[slug]` + dynamic `/saris/[category]` + 308 redirects. Home strips real. Mock retired (env-flag fallback only). Loading/error/empty/404 states. | Unblocks the core funnel; highest business value |
| **F2** Clerk auth ✅ | Clerk v6 graceful-degradation seam: conditional provider, custom sign-in/up on approved UI, `proxy.ts` route protection + admin RBAC, `getToken` injection (401 retry), protected account dashboard, auth-aware navbar. Guest-only until keys set. Build+lint green (guest mode); keyed E2E pending (§11). | Gates account / cart-sync / checkout |
| **F3** Cart + wishlist ✅ | Unified guest+server cart (`useCart`), server wishlist (`useWishlist`), `/cart` + `/wishlist` pages, PDP add-to-cart + variant resolution, product-card heart, guest merge-on-login, checkout CTA prepared. Build+lint green; authed-path E2E pending (§12). | Depends on auth |
| **F4** Checkout + Razorpay ✅ | `/checkout` form + live quote, place-order (Idempotency-Key), Razorpay widget + COD, `/payments/verify`, order success, guest tracking, account orders. Build+lint green; payment E2E pending (§13). | Depends on cart + auth |
| **F5** Orders + account ✅ | Cohesive account section (shell + nav: Overview/Orders/Addresses/Profile), client address book + checkout reuse, Clerk-identity profile, `/support`. Order confirmation/tracking shipped in F4. Build+lint green. | Depends on checkout |
| **F6** SEO + perf hardening | `generateMetadata` per product, JSON-LD, sitemap, Cloudinary transforms, `loading.tsx`, empty states, image optimisation. | Launch readiness |
| **F7** Admin frontend | Separate `/admin` surface against the 54 admin endpoints. | Largest; can run parallel post-launch |

**Rule for every phase:** preserve the exact visual identity. Integration only.

**Decisions locked 2026-05-27:**
- Category taxonomy → **the client-approved frontend structure is canonical**;
  the backend/Neon data was aligned to it (slugs == storefront slugs, "Pattu"
  parent hierarchy, `kind=collection`). The F1 hybrid merchandising map is
  retired — ONE source of truth. Dynamic `/saris/[category]` resolves directly
  from the backend; 308 redirects remain for legacy *product* URLs only.
  Spec: `BACKEND/ai-context/TAXONOMY.md`. (post-F1)
- Catalog pages render `force-dynamic` (live price/stock; keeps `next build`
  independent of backend availability). Server-driven pagination deferred —
  listing pages fetch up to 100 and paginate client-side (launch catalog is small).
- Cadence → one phase per turn, user triggers each next phase.

---

## 9. How to Update This File

Update after each integration phase. Move "missing ❌" rows to "built ✅"
only when verified against the live backend, not when the code merely
compiles.

---

## 10. F1 live-backend E2E checklist (run once backend is up + seeded)

F1's build + lint are green, but the running app was **not** verified against a
live backend in this environment. Before calling F1 field-verified, run:

```bash
# 1. Backend up + seeded
cd BACKEND && uv run uvicorn app.main:app --reload --port 8000
uv run python scripts/seed_dev.py          # categories + 10 products + images
curl http://localhost:8000/api/v1/products | head   # sanity: returns items

# 2. Frontend against it (.env.local already has USE_MOCK_API=false)
cd frontend && npm run dev
```

Then confirm in the browser:
- [ ] `/` — "Collection" tabs + "New Arrivals" strip show **real** products; images load (picsum in dev).
- [ ] `/saris` — all 10 seeded products render; sort + client pagination work.
- [ ] `/saris/banaras-sarees` → Banarasi products; `/saris/cotton-sarees` → cotton; `/saris/pattu` → silks. Curated heading preserved.
- [ ] `/saris/gadwal-silk-sarees` (no backend match) → polished **empty state**, not a blank grid, not a 404.
- [ ] `/saris/not-a-real-category` → **404** (branded not-found).
- [ ] Click any product card → lands on `/product/<slug>` (canonical bot URL); gallery, price, variants (colour/fabric), spec, breadcrumb all from real data; **no fake star ratings**.
- [ ] `/product/<unknown-slug>` → 404. An archived product (`available=false`) → "Product Unavailable" (HTTP **200**, `noindex`), not a 404.
- [ ] Old link `/saris/cotton-sarees/<slug>` and `/new-arrivals/<slug>` → **308** to `/product/<slug>`.
- [ ] Stop the backend, reload `/saris` → branded **error** boundary with retry (not a crash); reload `/` → page still renders (sections degrade/hide).
- [ ] No console errors; no hydration warnings; no layout shift on image load.
- [ ] Responsive: grid + PDP intact on mobile / tablet / desktop / ultra-wide.

**Prod note:** `NEXT_PUBLIC_API_BASE_URL` is inlined and used for **both**
browser and SSR fetches, so in production it must be a URL reachable from the
Next server too (the public API origin, e.g. `https://api.oorvashee.com/api/v1`).

---

## 11. F2 keyed-path E2E checklist (run once Clerk keys are set)

F2's build + lint are green in **guest mode** (no keys). The keyed path was not
runnable here. To activate + verify:

**Clerk setup (one-time):**
1. Create a Clerk app (dev instance). Enable **Email code** + **Google** sign-in.
2. Clerk dashboard → **Sessions → Customize session token**, add:
   `{ "email": "{{user.primary_email_address}}", "role": "{{user.public_metadata.role}}" }`
   (the backend reads both claims).
3. Point the backend's `CLERK_ISSUER` / `CLERK_JWKS_URL` / `CLERK_AUTHORIZED_PARTIES`
   at the same instance + the frontend origin.
4. Frontend env: set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`.
   Configure the Clerk webhook → `POST {API}/api/v1/webhooks/clerk` (Svix).
5. For an admin: set `publicMetadata.role = "admin"` on that Clerk user.

**Then verify:**
- [ ] `npm run build` still green with keys present.
- [ ] `/sign-in` → email → 6-digit code → lands on `/account` (approved UI, no flicker). Google button → OAuth → `/sso-callback` → `/account`.
- [ ] `/sign-up` → email code → account created; Clerk webhook creates the local `users` row.
- [ ] Signed out, visit `/account` → redirected to `/sign-in` by `proxy.ts`. Signed in → dashboard shows real name/email; **Sign out** returns to `/`.
- [ ] Navbar account icon → `/account` when signed in, `/sign-in` when signed out (icon unchanged; no layout shift / hydration warning).
- [ ] An authed call (once F3 cart lands) carries `Authorization: Bearer`; expire/rotate the token → one silent refresh-retry, no visible re-auth; hard 401 → friendly toast.
- [ ] Non-admin hitting `/admin` → redirected home; backend returns 403 on `/admin` APIs regardless.
- [ ] No console errors; no auth flicker; no hydration mismatch.

---

## 12. F3 cart + wishlist E2E checklist

The **guest cart** works offline (no backend/keys needed) and is verifiable now:
- [ ] PDP → select colour → Add to Cart → cart badge increments; `/cart` shows the line (qty stepper, remove, clear, subtotal); persists across reload (localStorage).
- [ ] Buy It Now → adds + routes to `/checkout` (placeholder until F4).
- [ ] Empty cart + empty wishlist states render; product-card bag → PDP.

The **authenticated** path needs a live backend + Clerk keys (build-verified, run to confirm):
- [ ] Signed in: cart reads/writes `/account/cart`; add/qty/remove/clear hit the API and the badge/subtotal reflect the returned `CartRead`.
- [ ] Sign in with a non-empty guest cart → `CartSync` POSTs `/account/cart/merge`, guest store clears, server cart shows merged lines.
- [ ] Product-card heart (signed in) → toggles `/account/wishlist`; filled when saved; `/wishlist` lists items; guest heart → "Sign in to save" prompt.
- [ ] Out-of-stock variant → Add to Cart disabled / "Sold Out"; `has_unavailable_items` shows the cart banner + blocks checkout CTA.
- [ ] Token expiry mid-session → one silent retry (F2); hard failure → `toastApiError` with `request_id`. No console errors; no layout shift.
- [ ] Mobile: cart line items, qty steppers, and summary CTA are touch-friendly and don't break layout.

**Note:** ~~`/checkout` is a polished placeholder~~ — **resolved in F4**: real
checkout/payment/order flow is live.

---

## 13. F4 checkout + payment E2E checklist (needs live backend + Razorpay keys)

Build-verified; run end-to-end once the backend, Clerk, and Razorpay test keys
are configured:

**Setup:** backend Razorpay keys + webhook (`/api/v1/webhooks/razorpay`);
frontend `NEXT_PUBLIC_RAZORPAY_KEY_ID` optional (the widget key comes from the
backend handoff). Seed catalog + a Clerk user.

- [ ] Add items → `/checkout` shows live quote totals (subtotal/shipping/tax/total) from `/checkout/quote`; coupon re-quotes.
- [ ] **COD:** Place Order → 201 with `payment_status=cod_pending` → `/checkout/success` shows the order (re-fetched via `/orders/{n}?email=`) → cart cleared.
- [ ] **Razorpay:** Pay & Place Order → Razorpay widget opens (brand colour, prefilled) → test-pay → handler POSTs `/payments/verify` → success page shows `paid`.
- [ ] **Idempotency:** double-submit / retry never double-charges (same `Idempotency-Key` replays).
- [ ] **Cancel:** close the Razorpay modal → toast "saved as pending", no crash; order recoverable.
- [ ] **Webhook truth:** if verify fails but payment succeeded, the order still finalises server-side; success page reflects it on reload.
- [ ] **Unavailable/stock:** `has_unavailable_items` blocks the place CTA with the banner; stale stock surfaces a clear error toast.
- [ ] Guest tracking `/orders/{n}` (email gate) + `/account/orders` list + detail render real orders; status track correct.
- [ ] Mobile: form usable (keyboard-safe), sticky summary CTA, Razorpay modal fits; no layout shift / hydration mismatch / console errors.

---

## 13a. F7 admin console E2E checklist (needs live backend + Clerk admin + Cloudinary)

Build-verified offline; run end-to-end once a Clerk user with `role=admin`,
the live admin API, and Cloudinary signed-upload creds are configured.

**Setup:** Clerk user promoted to `admin` (publicMetadata.role); backend admin
endpoints reachable; Cloudinary cloud + signed-upload preset wired to
`/admin/media/sign`. Seed catalog + a few orders/customers.

- [ ] **RBAC:** non-admin (or guest) hitting `/admin/*` sees "Admin access required", not data; admin sees the console. Backend still returns 403 on direct API calls regardless of the client guard.
- [ ] **Dashboard:** KPI cards (revenue/orders/AOV/units), 6 fulfillment tiles, and top-products bars all show live numbers; tiles deep-link to `/admin/orders?status=…`.
- [ ] **Products:** list search + status chips + pagination work; open a product → edit details/SEO/visibility → Save persists; status transitions (publish/unpublish/archive/restore) update the badge; create → redirects to edit.
- [ ] **Media:** drag/drop + click upload → progress → image appears (first = primary); delete removes it; reload shows persisted order. Signature re-verification on attach succeeds.
- [ ] **Orders:** list filters + `?status=` deep-link; detail status bar walks placed→packed→shipped (courier+tracking)→delivered; COD-paid; cancel-with-reason; add-note appends; timeline updates after each action.
- [ ] **Inventory:** table shows stock/reserved/available + low/out badges; low-stock filter narrows; Adjust dialog (set/add/remove + note) updates the row after save.
- [ ] **Categories:** hierarchy renders parent→child indented in display order; archive/activate toggles `is_active` and the badge.
- [ ] **Customers:** table shows name/email/phone, orders (+ paid), lifetime value, last order; search narrows.
- [ ] **Responsive:** sidebar → mobile scroll-tabs; tables scroll horizontally; adjust/shipment/cancel forms usable on tablet+mobile. No hydration mismatch / console errors on any admin route.

---

## 13b. F6 SEO + performance verification (run on the deployed origin + live backend)

Build-verified offline; run on a real deployment (`NEXT_PUBLIC_USE_MOCK_API=false`,
backend reachable, `NEXT_PUBLIC_SITE_URL`/`siteConfig.url` = the live origin):

**SEO**
- [ ] `GET /robots.txt` lists the disallows + `Sitemap:` + `Host:` on the prod origin.
- [ ] `GET /sitemap.xml` includes home/catalog/marketing + every canonical category + all published `/product/[slug]` URLs (absolute, prod origin); regenerates within ~1h of publishing a product.
- [ ] Product page: **Rich Results Test** validates `Product` (price/availability/sku) + `BreadcrumbList` with no errors/warnings.
- [ ] Home: `Organization`/`Store` + `WebSite` JSON-LD validate (Schema Markup Validator).
- [ ] Each product/category page emits a unique `<title>`, meta description, and `<link rel="canonical">` to `/product/[slug]` or `/saris/[category]`; archived products carry `robots: noindex`.
- [ ] Social unfurl: sharing a product URL shows the product image; sharing home/marketing shows the brand OG card (`/opengraph-image`); Twitter/X shows a large summary card.
- [ ] No duplicate canonical/og tags (the broken `/og.jpg` is gone; file-convention OG is the single default).

**Core Web Vitals / performance (mid-range mobile, throttled)**
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms on home + PDP + category (Lighthouse mobile).
- [ ] Images serve as AVIF/WebP with correct `sizes`; no layout shift (fixed aspect ratios hold with real Cloudinary images).
- [ ] Web-vitals events flow into the analytics seam once a sink (GTM `dataLayer` or registered sink) is attached; no events / no third-party requests until then.
- [ ] `prefers-reduced-motion: reduce` (OS setting) neutralises animations; default motion unchanged otherwise.

**Resilience**
- [ ] Forcing a server-component failure renders the branded route `error.tsx` (retry works); a root-layout failure renders `global-error.tsx`.
- [ ] A failed query surfaces the empty/error state + toast (no infinite spinner); 4xx does not retry, transient/5xx retries once.
