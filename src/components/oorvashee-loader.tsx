"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

/**
 * Gold-emblem loading screen.
 *
 * Self-contained and purely additive: every rule is scoped under `#oorv-loader`
 * and every class is `oorv-`-prefixed, so it cannot leak into or override any
 * existing site styles. Mounted once at the app root (src/app/layout.tsx).
 *
 * Readiness, not a timer: the storefront fetches its product data server-side
 * (ISR — see app/page.tsx), so by the time the page paints the data is already
 * present. What remains to wait on is visual readiness — the document finishing
 * load, web fonts resolving, and the above-the-fold images decoding — so the
 * site is fully painted before the loader fades and the user never sees image
 * pop-in, font swap, or layout shift. A stability settle plus a hard cap mean it
 * can never hang. Re-runs on every route change so each navigation is covered.
 *
 * The emblem lives in /public, whose paths are served verbatim (never hashed),
 * so the same literal URL is safe for both the <img> and the shimmer mask. It is
 * still threaded through a `--oorv-logo` CSS variable so the two can never drift.
 */

// Optimized loader emblem (transparent). Modern browsers load the ~46 KB AVIF
// for both the <img> (via <picture>) and the shimmer mask — one request — while
// the ~52 KB palette PNG is only fetched by browsers without AVIF support. The
// original loadingscreen.png is kept in the repo, untouched.
const LOGO_AVIF = "/images/hero/hero-logo/loadingscreen-opt.avif";
const LOGO_PNG = "/images/hero/hero-logo/loadingscreen-opt.png";

const STYLES = `
#oorv-loader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 50% 45%,#5a130f 0%,#54100d 72%);
  transition:opacity .9s ease,visibility .9s ease;contain:layout paint;}
#oorv-loader.oorv-done{opacity:0;visibility:hidden;}
#oorv-loader .oorv-stage{position:relative;width:min(80vw,380px);aspect-ratio:1;display:flex;align-items:center;justify-content:center;}
@media(min-width:768px){#oorv-loader .oorv-stage{width:260px;}}
#oorv-loader .oorv-logo{position:relative;width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  transform:translateZ(0);will-change:transform;backface-visibility:hidden;
  animation:oorv-breathe 2.8s cubic-bezier(.45,0,.55,1) infinite;}
#oorv-loader .oorv-logo img{width:100%;height:auto;display:block;
  filter:drop-shadow(0 0 26px rgba(232,185,35,.18));
  user-select:none;-webkit-user-drag:none;}
#oorv-loader .oorv-shimmer{position:absolute;inset:0;pointer-events:none;overflow:hidden;mix-blend-mode:screen;
  -webkit-mask:var(--oorv-logo) center/contain no-repeat;mask:var(--oorv-logo) center/contain no-repeat;}
#oorv-loader .oorv-shimmer::before{content:"";position:absolute;top:-30%;left:-45%;width:45%;height:160%;
  background:linear-gradient(115deg,transparent 0%,rgba(255,255,255,.8) 50%,transparent 100%);
  transform:translateX(0) translateZ(0);will-change:transform;backface-visibility:hidden;
  animation:oorv-shimmer 3.2s cubic-bezier(.45,0,.55,1) infinite;}
@keyframes oorv-breathe{0%,100%{transform:scale(1) translateZ(0)}50%{transform:scale(1.05) translateZ(0)}}
@keyframes oorv-shimmer{0%{transform:translateX(0) translateZ(0)}55%,100%{transform:translateX(360%) translateZ(0)}}
@media(prefers-reduced-motion:reduce){#oorv-loader .oorv-logo,#oorv-loader .oorv-shimmer::before{animation:none}}
`;

// Routes that opt out of the loading screen entirely.
const SUPPRESSED_ROUTES = ["/about", "/contact"];

// Singleton flag: distinguishes the very first page load (wait longer) from
// subsequent client navigations. Module scope because the instance below is
// remounted per route, so component state can't carry this across mounts.
let firstLoadDone = false;

/**
 * One loader lifecycle. Mounted fresh per route (keyed by pathname in the
 * exported wrapper), so it always starts visible and the effect only mutates
 * state from async timer/rAF callbacks — never synchronously in the effect body.
 */
function LoaderInstance() {
  // `active` = mounted/painting; `done` = fading out. Start visible.
  const [active, setActive] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const isFirst = !firstLoadDone;
    firstLoadDone = true;

    const MIN = isFirst ? 1100 : 650; // floor so the animation always reads
    const HARD_CAP = isFirst ? 10000 : 6000; // never hang past this
    const SETTLE = 160; // readiness must hold this long before we commit
    const FADE = 950; // matches the .9s CSS transition, with a little slack
    const t0 = Date.now();

    let hidden = false;
    let raf = 0;
    let readySince = 0;
    let removeTimer: ReturnType<typeof setTimeout> | undefined;

    // Above-the-fold images only: lazy/off-screen images won't load until the
    // user scrolls, so waiting on them would never resolve. We wait for the
    // images that are actually about to paint.
    const imagesReady = () => {
      const imgs = document.images;
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        if (img.loading === "lazy") continue;
        if (!img.complete || img.naturalWidth === 0) return false;
      }
      return true;
    };

    const fontsReady = () =>
      typeof document.fonts === "undefined" || document.fonts.status === "loaded";

    const isReady = () =>
      document.readyState === "complete" && fontsReady() && imagesReady();

    const hide = () => {
      if (hidden) return;
      hidden = true;
      if (raf) cancelAnimationFrame(raf);
      setDone(true);
      removeTimer = setTimeout(() => setActive(false), FADE);
    };

    // rAF-driven readiness poll. requestAnimationFrame pauses in background
    // tabs, so a parallel setTimeout enforces the hard cap regardless.
    const tick = () => {
      const elapsed = Date.now() - t0;
      if (elapsed >= MIN && isReady()) {
        if (!readySince) readySince = Date.now();
        if (Date.now() - readySince >= SETTLE) {
          hide();
          return;
        }
      } else {
        readySince = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const cap = setTimeout(hide, HARD_CAP);

    return () => {
      hidden = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(cap);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      id="oorv-loader"
      className={done ? "oorv-done" : undefined}
      aria-hidden="true"
      style={{ "--oorv-logo": `url(${LOGO_AVIF})` } as CSSProperties}
    >
      <style>{STYLES}</style>
      <div className="oorv-stage">
        <div className="oorv-logo">
          {/* `display:contents` keeps <picture> boxless so the <img> stays the
              direct flex child — identical layout to a bare <img>. */}
          <picture style={{ display: "contents" }}>
            <source srcSet={LOGO_AVIF} type="image/avif" />
            {/* Bare <img> on purpose: the loader overlay must paint instantly,
                without next/image's lazy/optimization pipeline. */}
            <img src={LOGO_PNG} alt="" />
          </picture>
          <span className="oorv-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function OorvasheeLoader() {
  const pathname = usePathname();
  const suppressed = SUPPRESSED_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );
  if (suppressed) return null;

  // Keyed by pathname → a fresh LoaderInstance mounts on every navigation,
  // so the screen replays for each page transition.
  return <LoaderInstance key={pathname} />;
}
