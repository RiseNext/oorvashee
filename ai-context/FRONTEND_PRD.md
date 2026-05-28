# FRONTEND_PRD.md

**Scope:** the customer-facing storefront + (later) admin dashboard for
Oorvashee Saree House. Derived from the master PRD (`ai-context/PRD.md`)
§5–§6, §7 (bot contract), §10 (SEO), and the finalised design system
(`docs/UI.md`, `docs/rule.md`).

> This document defines WHAT the frontend must do. Architecture (HOW) is in
> [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md). Backend wiring rules
> are in [INTEGRATION_RULES.md](INTEGRATION_RULES.md). Honest build state is
> in [CURRENT_STATUS.md](CURRENT_STATUS.md).

---

## 1. Non-negotiables (from the brief)

1. **Do not redesign.** Visual identity, theme, colours, typography,
   landing-page styling, animations, responsiveness — all finalised and
   client-approved. Preserve exactly.
2. **Backend is the source of truth.** Frontend API calls match backend
   contracts exactly; the frontend maps the wire shape into its own domain
   types, never the reverse.
3. **Integration, not rewrite.** Remove mock data gradually behind a flag;
   connect real APIs; keep the app shippable at every step.

---

## 2. Brand + Design (locked — reference only)

| Token | Value |
|---|---|
| Primary | Deep Maroon `#7B0D0D` |
| Accent | Gold `#C9A84C` |
| Display font | Cormorant Garamond (serif) |
| Body font | DM Sans (sans-serif) |
| Feel | Editorial, spacious, large imagery, premium ethnic luxury |
| Motion | Slow reveals, fade-ins, subtle scale (GPU-composited only) |
| Breakpoints | Mobile-first; bot traffic is majority mobile |

Full spec: `docs/UI.md` (colour system, type scale, component patterns) and
`docs/rule.md` (engineering rules). These are AUTHORITATIVE for any visual
decision. Do not invent colours/fonts/spacing.

---

## 3. Customer Storefront — Pages & Features

Priority tags mirror the master PRD §5.

### 3.1 Public pages

| Page | Route (target) | Priority | Backend source |
|---|---|---|---|
| Home | `/` | MUST | `/products?sort=featured`, `/products?sort=new`, `/categories` |
| Catalog / category | `/saris/[category]` (dynamic; slug == canonical backend category slug — see BACKEND/ai-context/TAXONOMY.md) | MUST | `/products?category=…&min_price&max_price&sort&page` |
| Product detail | **`/product/[slug]`** (canonical, bot contract) | MUST | `/products/{slug}` |
| Search | `/search?q=` ✅ F8 | MUST | `/products?q=` (navbar + mobile inputs wired) |
| About | `/about` | SHOULD | static |
| Contact | `/contact` | SHOULD | static + WhatsApp/IG links |
| Collections landing | `/collections` | SHOULD | `/categories` (kind=collection) |
| Video | `/video` ✅ F8 | SHOULD | YouTube-embed page (config `siteConfig.videoGallery`) — in main nav |

**Bot URL contract (PRD §7.2):** `/product/[slug]` must resolve every
published slug, and render a graceful "Product Unavailable" state (not a
404) when the backend returns `available=false` for an archived product.
The backend's `GET /products/{slug}` already returns 200 with
`available=false` for archived rows — the frontend must honour that.

### 3.2 Shopping & checkout

| Feature | Route | Priority | Backend |
|---|---|---|---|
| Cart | `/cart` ✅ F3 | MUST | server cart (`/account/cart`) for auth users; localStorage for guests; merge on login |
| Wishlist | `/wishlist` ✅ F3 | MUST | `/account/wishlist` (auth-only) |
| Checkout flow | `/checkout` ✅ F4 | MUST | `/checkout/quote`, `/checkout/orders` (+ `Idempotency-Key`) |
| Payment | within checkout ✅ F4 | MUST | Razorpay widget → `/payments/verify`; COD |
| Guest checkout | `/checkout` (no auth) ✅ F4 | MUST | order with `user_id=null` |
| Order confirmation | `/checkout/success` ✅ F4 | MUST | re-fetch via `/orders/{number}?email=` |
| Order tracking | `/orders/[number]?email=` ✅ F4 | MUST | `/orders/{number}` |
| Discount code | checkout field ✅ F4 | SHOULD | coupon in `/checkout/quote` |

### 3.3 Account (Clerk) — F2 ✅

Auth is Clerk v6 with **custom flows on the approved UI** (not Clerk's prebuilt
widgets). Methods: **email verification code + Google**. Backend verifies the
JWT (JWKS) and provisions users via the Clerk webhook. Auth activates only when
a publishable key is configured (else guest-only). Full architecture:
[FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) §5.

| Feature | Route | Priority | Status |
|---|---|---|---|
| Sign in | `/sign-in/[[...sign-in]]` (custom Clerk flow) | MUST | ✅ F2 |
| Sign up | `/sign-up/[[...sign-up]]` (custom Clerk flow) | MUST | ✅ F2 |
| OAuth callback | `/sso-callback` | MUST | ✅ F2 |
| Account section | `/account` + nav (Overview/Orders/Addresses/Profile) in `AccountShell` | MUST | ✅ F5 |
| Order history | `/account/orders` + `/account/orders/[number]` | MUST | ✅ F4 |
| Wishlist | `/wishlist` | MUST | ✅ F3 |
| Saved addresses | `/account/addresses` (client book; prefills checkout) | SHOULD | ✅ F5 |
| Profile | `/account/profile` (Clerk identity + sign-out) | SHOULD | ✅ F5 |
| Help & Support | `/support` (channels + order help + assurances) | SHOULD | ✅ F5 |
| Recently viewed | home / account widget | SHOULD | later |

---

## 4. Performance & Image Strategy (PRD §5.4 — non-negotiable) — F6 ✅

- All product imagery served via **Cloudinary CDN** (`f_auto,q_auto`); the
  Next image optimizer also negotiates **AVIF→WebP** (`next.config.ts`
  `formats` + 24h `minimumCacheTTL`). `next/image` everywhere with `fill` +
  responsive `sizes` + `priority` on LCP images.
- **Lazy loading** with skeleton placeholders; above-the-fold (hero, first
  product row) eager/preloaded; fixed aspect ratios prevent CLS.
- Core Web Vitals targets: **LCP < 2.5s, CLS < 0.1, INP < 200ms** — measured
  via the web-vitals seam (`components/web-vitals.tsx` → `lib/analytics`).
- TanStack Query caching (60s stale / 5m gc) with retry that skips 4xx.
- Streaming: navbar → hero → content → recommendations; `prefers-reduced-motion`
  honoured.
- Resilience: branded `error.tsx` (route) + `global-error.tsx` (root) + per-route
  `loading.tsx` + empty/error states; no blank/crashing screens.

---

## 5. SEO (PRD §10 — built-in, not bolted on) — F6 ✅

- ✅ Server-rendered, crawlable product + category pages (`force-dynamic` for live price/stock; fully indexable HTML).
- ✅ Dynamic `generateMetadata` per product + category (title/description/canonical; archived products `noindex`).
- ✅ JSON-LD `Product` (price/availability/sku/images) + `BreadcrumbList` per product; `BreadcrumbList` per category; site-wide `Organization`/`Store` + `WebSite` (`lib/seo/jsonld.tsx`).
- ✅ `sitemap.xml` — static + canonical categories + live published products, resilient + `revalidate=3600`; `robots.txt` (operational routes disallowed) + `manifest.webmanifest`.
- ✅ Dynamic OG + Twitter image (`next/og`); enriched root metadata (keywords/canonical/robots `max-image-preview:large`/`en_IN`).
- ✅ URL structure: `/saris/[category]` + canonical `/product/[slug]`; image `alt` from product name (via mappers/adapters).

Live verification (Rich Results, social unfurl) on the deployed origin:
[CURRENT_STATUS.md](CURRENT_STATUS.md) §13b.

---

## 6. Admin Dashboard (Phase F7 — ✅ built)

A separate authenticated `/admin` surface against the backend's admin
endpoints (products, categories, inventory, orders, analytics, customers,
Cloudinary media). Gated by Clerk `role=admin` (backend enforces 403; the
client guard is UX/defense-in-depth). **Built entirely in the storefront
design language** — premium commerce operations software, not a generic
template; no charting library added (CSS mini-bars + stat tiles).

| Module | Route | Status |
|---|---|---|
| Console shell + RBAC guard + nav (sidebar / mobile tabs) | `/admin/*` | ✅ F7 |
| Dashboard — revenue/orders/AOV/units KPIs, 6 fulfillment queue tiles, top products | `/admin` | ✅ F7 |
| Products — list (search/status/pagination), edit (details/SEO/visibility/variants/transitions), create | `/admin/products`, `/admin/products/new`, `/admin/products/[number]` | ✅ F7 |
| Media — Cloudinary signed upload (drag/drop, primary, delete) | within product edit | ✅ F7 |
| Orders — list (search/status, `?status=` deep-link), detail (packed→shipped→delivered, COD-paid, cancel, timeline, notes) | `/admin/orders`, `/admin/orders/[id]` | ✅ F7 |
| Inventory — table + low-stock filter + adjust dialog (set/add/remove) | `/admin/inventory` | ✅ F7 |
| Categories — hierarchy tree + activate/archive | `/admin/categories` | ✅ F7 |
| Customers — table (orders, lifetime value, last order) + search | `/admin/customers` | ✅ F7 |

Contracts: [INTEGRATION_RULES.md](INTEGRATION_RULES.md) §5.9. Architecture:
[FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md) §10a. Live E2E checklist:
[CURRENT_STATUS.md](CURRENT_STATUS.md) §13a. CSV import remains out of scope
(master PRD §14 — no bulk-import UI in Phase 1).

---

## 7. Explicitly Out of Scope (Phase 1)

Mirrors master PRD §14: no mobile app, no i18n (English only), no
blog/lookbook, no automated courier API (manual tracking ID), no multi-admin
UI, no returns/refunds flow, no loyalty/referral.

---

## 8. Success Criteria

The frontend is launch-ready when:
- Every published product is reachable at `/product/[slug]` (bot contract).
- Catalog, cart, checkout, payment, order tracking work end-to-end against
  the live backend with zero mock data on production.
- Core Web Vitals targets met on a mid-range mobile device.
- Guest + registered checkout both complete a real Razorpay/COD order.
- The visual identity is pixel-identical to the approved design.
