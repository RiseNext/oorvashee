# Image assets — drop real files here

Until the real assets land, the hero page references placeholder URLs from `placehold.co`. Replace each `src` with the local path once the file exists.

## Required for the hero page

| Slot | Local path the code expects | What to drop |
|---|---|---|
| Logo | `/images/ui/logo.png` | Circular gold-coin medallion (woman profile + "OORVASHEE SAREE HOUSE" wrapping). Recommend transparent PNG, 256×256 or 512×512. |
| Hero background | `/images/ui/temple-illustration.png` | Faint pencil-style palace/temple illustration. PNG with transparency, ~1600×900. Rendered at 8–12% opacity behind the headline. |
| Hero model | `/images/hero/model.jpg` | Portrait of model in saree. Aspect 3:4 portrait, ~1200×1600, WebP or JPG. Natural lighting, no filter. |

## Required for later pages
- `/images/icons/` — `lotus.svg`, `spool.svg`, `shield-check.svg`, `heart.svg`, `weave-grid.svg`, `temple-arch.svg` (gold stroke line-art, 24–28px source)
- `/images/ui/ornament-divider.svg` — center ornament for `——❖——` style dividers
- `/images/ui/price-card-frame.svg` — gold arch frame for price filter cards
- `/images/collections/` — collection banner images
- `/images/products/` — product photography, 3:4 portrait
- `/images/saree-table/` — folded sarees + brass lamp image for the dark banner

## How to swap a placeholder

In the component using the image, find the `src="https://placehold.co/..."` line and change to the local path:

```tsx
// Before
<Image src="https://placehold.co/1200x1600/F0E6D3/3D1A08?text=Model+Photo" ... />

// After
<Image src="/images/hero/model.jpg" ... />
```

All `next.config.ts` `remotePatterns` already include `placehold.co`, so no config change is needed in the meantime.
