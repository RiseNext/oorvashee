"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

/**
 * Gold-emblem loading screen — readiness-driven (no timers, no first-load vs
 * navigation distinction).
 *
 * The splash exists for one reason: the user must NEVER see a blank/half-loaded
 * page or a route skeleton. So it covers the screen *only while the view being
 * shown is genuinely not ready yet* — whether that is the very first page load
 * or a client navigation that has to fetch data — and it fades the instant the
 * destination's visible content is painted, revealing the finished page already
 * underneath (no blank gap, no second/skeleton loading state).
 *
 * Three rules make this feel right and never get stuck:
 *  1. Reveal threshold (~150ms): a view that becomes ready almost instantly is
 *     never covered, so fast/cached navigations show NO splash and never flash.
 *  2. "Ready" means the *visible* content is painted — not that every byte has
 *     loaded. We wait on: the document being parsed (readyState !== "loading"),
 *     the navigation having committed, the above-the-fold EAGER images having
 *     decoded, and no route loading skeleton being on screen. We deliberately do
 *     NOT wait on document `load`/`readyState === "complete"` (that blocks on
 *     ~300KB of Clerk JS, analytics, below-the-fold lazy images) — those must
 *     never delay dismissal.
 *  3. Hard cap (~9s): a safety net so the splash can never hang.
 *
 * Navigation is detected without any per-`<Link>` wiring: a passive capture-
 * phase click listener (and `popstate`) marks the start of an internal
 * navigation *before* it commits, and `usePathname()` tells us when it has
 * committed. The component is mounted once at the app root (src/app/layout.tsx)
 * and is NEVER remounted per route, so a single overlay element fades cleanly
 * onto whatever content renders beneath it.
 *
 * The emblem lives in /public (served verbatim, never hashed) so the same URL is
 * safe for the <img> and the shimmer mask; it is threaded through `--oorv-logo`
 * so the two can never drift.
 */

// Optimized loader emblem (transparent). Modern browsers load the ~46 KB AVIF
// for both the <img> (via <picture>) and the shimmer mask — one request — while
// the ~52 KB palette PNG is only fetched by browsers without AVIF support.
const LOGO_AVIF = "/images/hero/hero-logo/loadingscreen-opt.avif";
const LOGO_PNG = "/images/hero/hero-logo/loadingscreen-opt.png";

const STYLES = `
#oorv-loader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
  background:radial-gradient(circle at 50% 45%,#5a130f 0%,#54100d 72%);
  transition:opacity .45s ease;contain:layout paint;}
#oorv-loader.oorv-done{opacity:0;}
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

// Routes that opt out of the loading screen entirely (their own intro handles it).
const SUPPRESSED_ROUTES = ["/about", "/contact"];

const REVEAL_DELAY = 150; // only reveal the splash if still not ready after this
const SETTLE = 80; // readiness must hold this long before we commit to dismissing
const FADE = 480; // matches the .45s CSS opacity transition, with slack
const HARD_CAP = 9000; // never hang past this

const isSuppressed = (path: string) =>
  SUPPRESSED_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));

type Ctl = {
  path: string;
  target: string | null;
  active: boolean;
  shown: boolean;
  readySince: number;
  revealTimer: ReturnType<typeof setTimeout> | null;
  capTimer: ReturnType<typeof setTimeout> | null;
  fadeTimer: ReturnType<typeof setTimeout> | null;
  raf: number;
};

export default function OorvasheeLoader() {
  const pathname = usePathname();

  const [visible, setVisible] = useState(false); // overlay element mounted
  const [fading, setFading] = useState(false); // overlay fading out (opacity→0)

  const ctl = useRef<Ctl>({
    path: pathname,
    target: null,
    active: false,
    shown: false,
    readySince: 0,
    revealTimer: null,
    capTimer: null,
    fadeTimer: null,
    raf: 0,
  });
  // Keep the controller's view of the committed route in sync every render.
  ctl.current.path = pathname;

  // `begin` is created inside the mount effect (stable closure); exposed via a
  // ref so the per-navigation effect below can call it.
  const api = useRef<{ begin: (target: string) => void }>({ begin: () => {} });

  useEffect(() => {
    const st = ctl.current;

    const now = () =>
      typeof performance !== "undefined" ? performance.now() : Date.now();

    // Every EAGER (non-lazy) image that is currently in the viewport must be
    // decoded. Lazy/off-screen images are ignored — waiting on them would never
    // resolve and they are not part of the visible, above-the-fold content.
    const eagerImagesReady = () => {
      const imgs = document.images;
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        if (img.loading === "lazy") continue;
        const r = img.getBoundingClientRect();
        const inView = r.top < vh && r.bottom > 0 && r.width > 0 && r.height > 0;
        if (!inView) continue;
        if (!img.complete || img.naturalWidth === 0) return false;
      }
      return true;
    };

    // A route loading state (Next `loading.tsx` Suspense fallback, or a page's
    // own data skeleton) is on screen while a pulse placeholder is visible. In
    // this codebase `animate-pulse` is used exclusively for loading skeletons,
    // so an in-viewport `.animate-pulse` element means "content not ready yet".
    // This is what bridges the splash over the skeleton so the logo gives way
    // straight to finished content — never to a second/skeleton screen.
    const routeSkeletonVisible = () => {
      const nodes = document.querySelectorAll<HTMLElement>(".animate-pulse");
      const vh = window.innerHeight || document.documentElement.clientHeight || 0;
      for (let i = 0; i < nodes.length; i++) {
        const r = nodes[i].getBoundingClientRect();
        if (r.top < vh && r.bottom > 0 && r.width > 0 && r.height > 0) return true;
      }
      return false;
    };

    const isReady = () => {
      if (document.readyState === "loading") return false; // document not parsed yet
      if (st.target && st.target !== st.path) return false; // navigation not committed
      if (routeSkeletonVisible()) return false; // a skeleton is still on screen
      return eagerImagesReady(); // above-the-fold visible images painted
    };

    const clearTimers = () => {
      if (st.revealTimer) clearTimeout(st.revealTimer);
      if (st.capTimer) clearTimeout(st.capTimer);
      if (st.raf) cancelAnimationFrame(st.raf);
      st.revealTimer = null;
      st.capTimer = null;
      st.raf = 0;
    };

    // End the current loading episode. If the splash is up, fade it; otherwise
    // it never appeared and there is nothing to do.
    const resolve = () => {
      if (!st.active) return;
      st.active = false;
      st.target = null;
      st.readySince = 0;
      clearTimers();
      if (st.shown) {
        setFading(true);
        st.fadeTimer = setTimeout(() => {
          st.shown = false;
          setVisible(false);
          setFading(false);
        }, FADE);
      }
    };

    const tick = () => {
      if (!st.active) return;
      if (isReady()) {
        if (!st.readySince) st.readySince = now();
        if (now() - st.readySince >= SETTLE) {
          resolve();
          return;
        }
      } else {
        st.readySince = 0;
      }
      st.raf = requestAnimationFrame(tick);
    };

    const begin = (target: string) => {
      if (isSuppressed(target)) return; // these routes never show the splash
      if (st.active && st.target === target) return; // already covering this view
      // A new navigation supersedes any in-flight one. If the splash is fading
      // out, keep it solid rather than flickering.
      if (st.fadeTimer) {
        clearTimeout(st.fadeTimer);
        st.fadeTimer = null;
      }
      if (st.shown) setFading(false);
      st.active = true;
      st.target = target;
      st.readySince = 0;
      clearTimers();
      st.revealTimer = setTimeout(() => {
        if (st.active) {
          st.shown = true;
          setVisible(true);
          setFading(false);
        }
      }, REVEAL_DELAY);
      st.capTimer = setTimeout(resolve, HARD_CAP);
      st.raf = requestAnimationFrame(tick);
    };

    api.current.begin = begin;

    // Detect the START of an internal navigation before it commits. Purely
    // observational — never calls preventDefault, so navigation is untouched.
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const el = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!el) return;
      const anchor = el as HTMLAnchorElement;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return; // new tab/window
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // external
      if (url.pathname === window.location.pathname) return; // same page / hash / search-only
      begin(url.pathname);
    };

    const onPopState = () => begin(window.location.pathname);

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);

    // Cover the initial page load too (same readiness rules, same threshold).
    begin(window.location.pathname);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
      if (st.fadeTimer) clearTimeout(st.fadeTimer);
      st.fadeTimer = null;
      clearTimers();
      st.active = false;
      st.target = null;
      st.shown = false;
    };
  }, []);

  // When the committed route changes, re-evaluate readiness. This also starts an
  // episode for navigations that don't originate from a link click (e.g.
  // router.push); `begin` is a no-op if one is already covering this target.
  useEffect(() => {
    api.current.begin(pathname);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      id="oorv-loader"
      className={fading ? "oorv-done" : undefined}
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
