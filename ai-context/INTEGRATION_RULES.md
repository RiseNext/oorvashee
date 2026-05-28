# INTEGRATION_RULES.md

The rulebook for connecting this frontend to the live backend. The backend
is the **source of truth**. When this doc and the backend disagree, the
backend wins — re-verify against:

- `BACKEND/ai-context/API_CONTRACTS.md` (authoritative endpoint list)
- the live OpenAPI at `{API_BASE}/openapi.json` (non-prod) / Swagger `/docs`

> Field shapes below are transcribed from the backend schemas as of
> 2026-05-27. **Confirm against `/openapi.json` before wiring each module** —
> never hand-edit a backend contract to match the frontend.

---

## 1. Golden rules

1. **Two conversion seams, both one-directional.**
   - *Wire → domain*: `lib/api/mappers/` ONLY. No component ever sees
     `base_price`, `primary_image_url`, `is_bestseller`, etc.
   - *Domain → approved-component props*: `lib/catalog/presenters.ts`
     (`toCardProduct`) + `features/product-detail/adapt.ts`
     (`toProductDetailData`). The approved UI components keep their existing
     prop shapes; these adapters feed them. **Every product card href is the
     canonical `/product/[slug]`** (the bot URL contract) — set here.
2. **Domain types stay stable; mappers absorb churn.** If the backend
   renames a field, only the mapper changes.
3. **No fetch outside `lib/api`.** Components → hooks → api modules → mapper.
4. **Money is decimal-as-string on the wire.** Backend returns INR amounts
   as strings (e.g. `"7499.00"`). Parse to number in the mapper; never do
   float math on the raw string. Display via `lib/format.ts`.
5. **Slugs are immutable + canonical.** Product detail is `/product/[slug]`.
   Honour the backend `available` flag — archived products return 200 with
   `available=false`; render "Product Unavailable", not a 404.

---

## 2. Base URL + transport

- `NEXT_PUBLIC_API_BASE_URL` includes `/api/v1`. All `apiFetch` paths are
  relative to it: `apiFetch("/products")` → `{BASE}/products`.
- Headers: `Content-Type: application/json`, `Accept: application/json`.
- Auth: `Authorization: Bearer <clerk-jwt>` on `/account/*`, `/cart/*`, and
  authenticated checkout. Omitted for public catalog + guest tracking.
- `Idempotency-Key: <uuid>` REQUIRED on `POST /checkout/orders` and
  `POST /payments/verify`.
- Response header `X-Request-ID` — capture it into `ApiError` for support.

---

## 3. Pagination

Backend `Page[T]` (offset mode):

```json
{ "items": [ … ], "next_cursor": null, "total": 142 }
```

Query params: `page` (1-based), `page_size` (≤100). The frontend's
`Paginated<T>` (`page/pageSize/total/totalPages`) is a **derived** shape —
the mapper computes `totalPages = ceil(total / pageSize)` and carries
`page/pageSize` from the request, not the response.

---

## 4. Error envelope

Every non-2xx returns:

```json
{ "detail": "human message", "code": "machine_code", "request_id": "abc123" }
```

`ApiError` must expose `status`, `code`, `requestId`, `detail`. A shared
`toastApiError(err)` maps known `code`s to friendly copy:

| code | UX |
|---|---|
| `rate_limit_exceeded` | "Too many requests — try again in a moment." (read `Retry-After`) |
| `out_of_stock` | "This piece just sold out." + refresh stock |
| `validation_error` | field-level messages from `meta.errors` |
| `not_found` | route → 404 / "Product Unavailable" |
| `idempotency_conflict` | silently treat as success-replay |
| default | `detail` + log `request_id` |

---

## 5. DTO mappings (backend → frontend domain)

> **`GET /products` query params** (verified against the backend source, not the
> contract doc): `q` (free-text search, ≤200 chars — drives `/search`),
> `category` (slug[]), `min_price`, `max_price`, `sort` ∈
> `new|price_asc|price_desc|bestseller|featured`, `page`, `page_size` (≤100).
> `sort=featured` IS valid (the contract doc omitted it). `listProducts` in
> `lib/api/products.ts` passes all of these.

### 5.1 Product list item

| Frontend `ProductSummary` | Backend `ProductListItem` | Mapping |
|---|---|---|
| `id` | `id` | as-is (string) |
| `slug` | `slug` | as-is |
| `title` | `name` | rename |
| `price` | `base_price` | `Number(...)` |
| `compareAtPrice` | `mrp` | `mrp ? Number(mrp) : undefined` |
| `currency` | `currency` | as-is (`"INR"`) |
| `image` | `primary_image_url` | `{ url, alt: name }` — alt derived from name |
| `badges[]` | `featured`/`is_bestseller`/`is_new` | derive: bestseller→`"bestseller"`, is_new→`"new"`, mrp>price→`"sale"` |
| `rating` | — | backend has no rating yet → `undefined` (hide stars or use reviews later) |
| `available` (add to domain) | `available` | as-is — drives "sold out" badge |

> The current `ProductSummary` lacks `available`. **Add it** in F0 — the
> listing must show out-of-stock state.

### 5.2 Product detail

| Frontend `Product` (extends summary) | Backend `ProductRead` | Mapping |
|---|---|---|
| `description` | `description` | as-is |
| `story` | — | backend has none → omit / use `short_description` |
| `images[]` | `images[]` (`{url, alt_text, position, is_primary}`) | sort by `position`, `alt: alt_text ?? name` |
| `variants[]` | `variants[]` | see 5.3 |
| `attributes.fabric` etc. | derive from `variants` + `categories` + `tags` | backend has no `attributes` object; compose it |
| `seo` | `seo_title`/`seo_description` | feed `generateMetadata` |
| (use) | `available`, `status` | gate the buy-zone + "unavailable" state |

### 5.3 Variant

| Frontend `ProductVariant` | Backend variant | Mapping |
|---|---|---|
| `id` | `id` | as-is |
| `sku` | `sku` | as-is |
| `title` | compose from `color`/`fabric`/`size` | e.g. `"Maroon · Kanchipuram Silk"` |
| `price` | `price` | `Number(...)` (already resolves override) |
| `inStock` | `available` | as-is |
| `options` | `{ color, fabric, size }` | drop nulls |

### 5.4 Categories

Backend `GET /categories` returns **grouped by kind**, where each entry is a
`CategorySummary` = `{ id, slug, name, kind, description }` (verified against
`BACKEND/app/schemas/category.py` — **no `count` field**; `description` is the
storefront subtitle, single-sourced from the category row). The navigable
merchandising tree lives under `kind=collection` and its **slugs equal the
storefront slugs** (canonical taxonomy — see `BACKEND/ai-context/TAXONOMY.md`):

```json
{ "fabric": [{ "id", "slug", "name", "kind" }], "occasion": […], "color": […],
  "region": […], "price_bracket": […], "collection": […] }
```

There is **no `/collections` endpoint**. The frontend's "collections" map to
`kind=collection` categories. The mapper flattens/selects the kind the UI
needs. `Collection.title` ← `name`. `Collection.productCount` is NOT
available from this endpoint (omit it, or fetch per-category counts later if
the design requires them).

### 5.5 Cart (F3 — implemented) — base path **`/account/cart`**

| Endpoint | Method | Body | Notes |
|---|---|---|---|
| `/account/cart` | GET | — | hydrated server cart |
| `/account/cart/items` | POST | `{ variant_id, quantity }` | add / increment (201) |
| `/account/cart/items/{id}` | PATCH | `{ quantity }` | **quantity is `ge=1`** — to remove, use DELETE (NOT qty 0) |
| `/account/cart/items/{id}` | DELETE | — | remove a line |
| `/account/cart` | DELETE | — | clear cart |
| `/account/cart/merge` | POST | `{ items: [{ variant_id, quantity }] }` | guest-cart merge after login |

**Every mutation returns the full `CartRead`** → the client replaces its cached
cart with the mapped result (no refetch). `CartRead` = `{ id, items[],
item_count, distinct_count, subtotal, currency, has_unavailable_items }`;
`CartItemRead` carries `unit_price`, `line_total`, `available`, `max_quantity`.

**Unified `useCart` seam.** Guests use the persisted Zustand cart (instant,
offline); authenticated users use the server cart via TanStack (optimistic
quantity/remove). Components never branch on auth — they call
`addItem/updateQuantity/removeItem/clear`. On sign-in, `CartSync` POSTs
`/account/cart/merge` with the guest lines, then clears the guest store.
Money/totals shown are line-sum only; authoritative totals come from
`/checkout/quote` (F4).

### 5.6 Checkout (F4 — implemented) — verified against the backend schemas

`POST /checkout/quote` (anonymous; **the only trusted pricing**):
```json
// body
{ "items": [{ "variant_id", "quantity" }], "shipping_postal_code"?, "coupon_code"? }
// CheckoutQuoteRead
{ "items": [{ "variant_id","product_name","variant_label","unit_price",
  "quantity","line_total","available","available_stock" }],
  "subtotal","shipping_amount","tax_amount","discount_amount","total",
  "currency","has_unavailable_items" }
```

`POST /checkout/orders` (Bearer **optional** — sent via `authedFetch` to link
the user; **`Idempotency-Key` header REQUIRED**, generated per attempt):
```json
// PlaceOrderRequest
{ "items": [{ "variant_id","quantity" }],
  "customer": { "email","phone","full_name" },
  "shipping_address": { "recipient_name","phone","line1","line2"?,"city",
    "state","postal_code","country" },        // country defaults "IN"
  "billing_address"?, "payment_method": "razorpay"|"cod",
  "coupon_code"?, "notes"? }
// PlaceOrderRead (201)
{ "order_number","status","payment_status","payment_method","total","currency",
  "payment": { "razorpay_order_id","razorpay_key_id","amount_paise","currency" } | null }
```
`payment` is **null for COD** (and any non-razorpay). There is NO `save_address`
field and NO `coupon` object in the quote — do not invent them.

`POST /payments/verify` (**`Idempotency-Key` required**):
```json
{ "order_number","razorpay_order_id","razorpay_payment_id","razorpay_signature" }
// → full OrderRead (the finalised order)
```

**Flow (`useCheckout`):** quote (live totals) → `placeOrder` (idem key) →
COD: straight to success; Razorpay: open the widget (`react-razorpay`) with
`razorpay_key_id` + `razorpay_order_id` + `amount_paise` → on success POST
`/payments/verify` (idem key) → success. The **Razorpay webhook is the
backend's source of truth** — if verify fails or the tab closes, the order
still finalises server-side, so the success page re-fetches the order and
proceeds regardless. `modal.ondismiss` / `payment.failed` keep the order
recoverable (saved as pending; retry from My Orders).

### 5.7 Orders (F5 read APIs — used in F4) — verified

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /orders/{order_number}?email=` | none | guest tracking (rate-limited); 404 on email mismatch. Returns `OrderRead`. |
| `GET /account/orders?page&page_size` | Bearer | history, `Page[OrderRead]` |
| `GET /account/orders/{order_number}` | Bearer | detail (own orders only) |

`OrderRead` = `{ id, order_number, status (placed/packed/shipped/delivered/
cancelled), payment_status (pending/paid/failed/refunded/cod_pending),
payment_method, customer_name, email, phone, items[OrderItemRead], subtotal,
shipping_amount, tax_amount, discount_amount, total, currency, shipping_address,
billing_address?, notes?, *_at timestamps, shipment? }`.

### 5.8 Wishlist (F3 — implemented) — base path **`/account/wishlist`**, auth-only

| Endpoint | Method | Notes |
|---|---|---|
| `/account/wishlist` | GET | returns `WishlistRead` `{ items[], count }` |
| `/account/wishlist/{product_id}` | PUT | add (idempotent, 201) |
| `/account/wishlist/{product_id}` | DELETE | remove (idempotent) |
| `/account/wishlist/{product_id}/move-to-cart` | POST | `{ variant_id, quantity, remove_from_wishlist }` → returns `CartRead` |

Add/remove return the full `WishlistRead`. Wishlist is **auth-only** (no guest
merge endpoint) — guests get a sign-in prompt via `useWishlist`. The product
card heart toggles wishlist; move-to-cart needs a variant, so from the wishlist
the card routes to the PDP for selection.

### 5.9 Admin APIs (F7 — implemented) — all Bearer + `role=admin` (backend 403s otherwise)

The **one** seam for admin field names is `lib/admin/api.ts` (the admin analogue
of `lib/api/mappers/`); domain types are `types/admin.ts`. Every fn takes
`authedFetch`. **Admin orders are keyed by `id` (UUID), not `order_number`.**

**Analytics + summary**

| Endpoint | Returns (domain) |
|---|---|
| `GET /admin/analytics/overview` | `AnalyticsOverview` — revenue/orders/paidOrders/AOV/units/newCustomers/guestOrders (money as string → `toNumber`) |
| `GET /admin/analytics/fulfillment` | `FulfillmentKPI` — awaitingPacking/awaitingShipment/inTransit/deliveredToday/shippedMissingTracking/codOutstanding |
| `GET /admin/analytics/top-products?limit` | `{ rows: TopProductRow[] }` — productId/name/slug/unitsSold/revenue/orders |
| `GET /admin/orders/summary` | `OrderStatusSummary` — per-status counts + awaitingFulfillment/pendingShipment/codPending/totalRevenuePaid |

**Products** (`/admin/products`)

| Endpoint | Method | Notes |
|---|---|---|
| `/admin/products?q&status[]&page&page_size` | GET | `Page[AdminProductListItem]` (totalStock, variantCount, primaryImageUrl, status) |
| `/admin/products/{id}` | GET | full `AdminProduct` (variants[], images[] sorted by position, categoryIds) |
| `/admin/products` | POST | `{ name, base_price, short_description? }` → created product |
| `/admin/products/{id}` | PATCH | partial: name/short_description/description/base_price/mrp/tags/featured/is_bestseller/is_new/seo_* |
| `/admin/products/{id}/{publish\|unpublish\|archive\|unarchive}` | POST | status transition → product |

**Media — Cloudinary signed upload** (do NOT reorder the param set):
```
POST /admin/media/sign  { context:"product", entity_id }
  → { cloud_name, api_key, timestamp, signature, upload_url, folder,
      eager[], public_id?, resource_type, allowed_formats[], max_file_size }
// then POST FormData to upload_url with EXACTLY: file, api_key, timestamp,
//   signature, folder, eager(joined by "|"), public_id (if present)
POST /admin/products/{id}/images  { cloudinary_response, is_primary, alt_text? }
  → ProductImageRead (backend RE-VERIFIES the signature)  // map to void; refetch product
DELETE /admin/products/{id}/images/{imageId}  → 204
```
No reposition endpoint exists → image order = position-on-upload + delete only.

**Orders** (`/admin/orders`, keyed by **id**)

| Endpoint | Method | Body |
|---|---|---|
| `/admin/orders?q&status[]&page&page_size` | GET | `Page[AdminOrderListItem]` |
| `/admin/orders/{id}` | GET | `AdminOrderDetail` (items[], timeline[], shipment?) |
| `/admin/orders/{id}/packed` | POST | — |
| `/admin/orders/{id}/shipped` | POST | `{ courier_name, tracking_id, tracking_url? }` |
| `/admin/orders/{id}/delivered` | POST | — |
| `/admin/orders/{id}/cod-paid` | POST | — (only when payment_method=cod & cod_pending) |
| `/admin/orders/{id}/cancel` | POST | `{ reason }` |
| `/admin/orders/{id}/notes` | POST | `{ note }` |

All transitions return the full updated `AdminOrderDetail` → `setQueryData(["admin-order", id])`.

**Inventory** (`/admin/inventory`)

| Endpoint | Method | Notes |
|---|---|---|
| `/admin/inventory?q&low_stock_only&page&page_size` | GET | `Page[InventoryItem]` — stock/reserved/available + isLowStock/isOutOfStock |
| `/admin/inventory/{variantId}/adjust` | POST | `{ mode:"set"\|"increment"\|"decrement", value, reason:"manual_adjustment", note? }` → movement result (list refetches) |

**Categories** (`/admin/categories`) — `listCategories` requests `page_size=100`
and tolerates either a `Page` or a bare array. Toggle is two endpoints, not a
PATCH: `POST /admin/categories/{id}/archive` and `.../unarchive`. The frontend
builds the parent→child tree client-side from `parent_id` + `display_order`.

**Customers** (`/admin/customers`) — `GET ?q&page&page_size` → `Page[AdminCustomerItem]`
(email, fullName, phone, ordersCount, paidOrdersCount, lifetimeValue, lastOrderAt).

---

## 6. Auth rules (F2 — implemented, Clerk v6)

- **Token transport.** Authed endpoints (`/account/*`, `/cart/*`, authed
  checkout) MUST go through `useApiClient().authedFetch`, never bare
  `apiFetch`. It injects `Authorization: Bearer <clerk-jwt>` via
  `useAuth().getToken()`.
- **Claims contract.** The backend reads `email` + `role` from the JWT. The
  Clerk **session token must be customised** to include them:
  `{ "email": "{{user.primary_email_address}}", "role": "{{user.public_metadata.role}}" }`
  (or set a named template in `NEXT_PUBLIC_CLERK_JWT_TEMPLATE`). Without this,
  the backend 401s ("JWT missing email claim").
- **Token lifecycle.** Clerk auto-refreshes; on a backend **401** `authedFetch`
  force-refreshes once (`getToken({ skipCache: true })`) and retries before
  surfacing the error. Persistent 401/403 → `ApiError` → `toastApiError`
  (`unauthenticated` / `forbidden` friendly copy + `request_id`).
- **Provisioning.** The frontend NEVER creates/updates users — the backend's
  Svix-signed Clerk webhook owns that. The frontend only sends the token.
- **Roles.** Client reads role from `useAuthSession().role`
  (`user.publicMetadata.role`, default `customer`) for UX gating only. The
  backend is the real gate: `/admin/*` → 403 unless `role=admin`; `proxy.ts`
  additionally redirects non-admins away from `/admin` pages.
- **No raw auth fields in components.** Components read auth via
  `useAuthSession()` only; no component imports `@clerk/nextjs` directly.
- **Graceful degradation.** With no publishable key, auth is disabled
  (`CLERK_ENABLED=false`): guest-only, `authedFetch` === `apiFetch`, no provider.
- **Account data sources (F5).** The backend account surface is **cart, orders,
  wishlist only** — there is NO customer address-CRUD or profile/me endpoint.
  So: **profile** = Clerk identity (`useAuthSession`); **saved addresses** =
  client store (`store/address-store`, the user's own data) that prefills
  checkout. If/when a backend `/account/addresses` (and profile) API lands,
  swap these behind the same hook shapes — components won't change.

---

## 7. Image / Cloudinary rules

- Product images come back as full Cloudinary `secure_url`s + a
  `cloudinary_public_id`. Prefer the pre-generated eager transforms
  (card 320×400 / 640×800, PDP 1280×1600) the backend already created.
- Use `next/image`; `res.cloudinary.com` is already allow-listed in
  `next.config.ts`. **F6:** the Next optimizer also negotiates AVIF→WebP
  (`images.formats`) with a 24h `minimumCacheTTL`; Cloudinary URLs still carry
  `f_auto,q_auto`. (No `cloudinaryUrl` helper was needed — the optimizer +
  eager transforms cover sizing.)
- `alt` text: product name + fabric/occasion tags (SEO + a11y).

## 7a. SEO route data sources (F6)

- `sitemap.xml` (`app/sitemap.ts`) enumerates via the **public** `/products`
  (paginated, capped) + `/categories` endpoints — no auth. It is `try/catch`'d
  end-to-end: a backend-down build/runtime still emits static + canonical-nav
  routes (never fails). `revalidate=3600`.
- Structured data (`lib/seo/jsonld.tsx`) reads only already-mapped **domain**
  types (`Product`, categories) — no new backend fields. `Product` JSON-LD uses
  `price`/`currency`/`available`/`variants[0].sku`/`images`; canonical URLs via
  `absoluteUrl()` against `siteConfig.url`.
- `robots.txt` disallows `/admin`, `/account`, `/cart`, `/checkout`,
  `/wishlist`, auth routes, and `/orders/` (guest tracking carries an `?email=`
  param — must never be indexed).

---

## 8. Mock-data retirement policy

- `NEXT_PUBLIC_USE_MOCK_API` **defaults to `false`** (live backend) as of **F8**
  — the code default was flipped from `true` so production is safe even if the
  var is omitted (the F8 audit caught the code/doc drift). It survives only as
  an offline-demo escape hatch (set `true` locally to render the UI without a
  backend).
- **F1 retired the catalog mocks**: deleted `features/saree-listing/data.ts`,
  `features/home/data/{collections,new-arrivals}.ts`,
  `features/new-arrivals-page/data.ts`. The central `lib/api/mock-data.ts`
  remains (backs the escape hatch only) and is the last to go (end of F5).
  `features/product-detail/data.ts` is kept for its `ProductDetailData` type +
  the fallback related-product fixtures (used only in mock mode); the real PDP
  passes live related products.
- The F1 `lib/catalog/category-map.ts` merchandising seam is **retired** — the
  backend taxonomy was aligned to the approved structure (slugs now match), so
  the frontend resolves categories directly from the backend. One source of
  truth. See `BACKEND/ai-context/TAXONOMY.md`.

---

## 9. Verification checklist per integrated module

Before marking a module done in `CURRENT_STATUS.md`:
- [ ] Request shape matches `/openapi.json` exactly (names, casing, query).
- [ ] Mapper unit-tested for the happy path + null/optional fields.
- [ ] Loading (skeleton), error (toast + `request_id`), empty states present.
- [ ] Works with `NEXT_PUBLIC_USE_MOCK_API=false` against the live backend.
- [ ] No backend field name leaked past the mapper.
- [ ] Visual identity unchanged (diff against approved design).
