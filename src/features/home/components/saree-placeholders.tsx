"use client";

import { useId } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { ShowcaseSaree } from "../data/showcase-sarees";

/**
 * SVG-rendered silk-saree placeholders used until the client ships real
 * photography. Two shapes:
 *
 *   - FoldedSareePlaceholder  — stacked square fold with brocade body
 *                                and a thick zari pallu band at the bottom.
 *                                The bottom edge shows the layered fabric.
 *   - DrapedSareePlaceholder  — landscape saree lying open on the table,
 *                                pallu spread out, with a folded corner peek.
 *
 * Drawing in SVG (instead of stacking divs + CSS gradients) gives us crisp
 * brocade patterns, real diagonal silk gradients, and a single element that
 * scales cleanly at every breakpoint. Pattern / gradient IDs are uniqued
 * via React.useId so the same saree can appear multiple times in the bottom
 * loop without ID collisions polluting the SVG defs lookup.
 *
 * When real assets arrive: set `saree.image` and the SVG render is bypassed
 * for a next/image render — no layout changes required upstream.
 */

const GOLD_LIGHT = "#e8c96a";
const GOLD = "#c4982a";
const GOLD_DEEP = "#8a6618";

function silkStops(saree: ShowcaseSaree) {
  return {
    highlight: saree.palette.highlight,
    base: saree.palette.base,
    shadow: saree.palette.shadow,
  };
}

export function FoldedSareePlaceholder({
  saree,
  className,
}: {
  saree: ShowcaseSaree;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const silk = `silk-${uid}`;
  const gold = `gold-${uid}`;
  const body = `body-${uid}`;
  const pallu = `pallu-${uid}`;
  const sheen = `sheen-${uid}`;

  const { highlight, base, shadow } = silkStops(saree);

  if (saree.image) {
    return (
      <div
        className={cn(
          "relative aspect-[6/5] w-full overflow-hidden rounded-[4px] ring-1 ring-black/30",
          className,
        )}
      >
        <Image
          src={saree.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 18vw, (min-width: 640px) 25vw, 33vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)} aria-hidden>
      <svg
        viewBox="0 0 200 168"
        preserveAspectRatio="none"
        className="block h-auto w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.45)]"
      >
        <defs>
          {/* Diagonal silk gradient — highlight catches from top-left */}
          <linearGradient id={silk} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="55%" stopColor={base} />
            <stop offset="100%" stopColor={shadow} />
          </linearGradient>

          {/* Antique zari gold */}
          <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD_LIGHT} />
            <stop offset="45%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DEEP} />
          </linearGradient>

          {/* Sheen overlay — a soft diagonal swipe of white */}
          <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
            <stop offset="35%" stopColor="rgba(255,255,255,0)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="75%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Scattered floral motifs on the silk body */}
          <pattern
            id={body}
            x="0"
            y="0"
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <g fill={GOLD} opacity="0.55">
              <circle cx="13" cy="13" r="1.4" />
              <path d="M13 7 L15.2 13 L13 19 L10.8 13 Z" />
              <path d="M7 13 L13 11 L19 13 L13 15 Z" opacity="0.7" />
              <circle cx="1" cy="1" r="0.7" />
              <circle cx="25" cy="25" r="0.7" />
            </g>
          </pattern>

          {/* Dense pallu brocade — small interlocking flowers */}
          <pattern
            id={pallu}
            x="0"
            y="0"
            width="22"
            height="22"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="rgba(60,30,0,0.55)"
              strokeWidth="0.7"
            >
              <path d="M11 2 C 15 5 15 10 11 13 C 7 10 7 5 11 2 Z" />
              <path d="M11 20 C 7 17 7 12 11 9 C 15 12 15 17 11 20 Z" />
              <circle cx="11" cy="11" r="1.4" fill="rgba(60,30,0,0.5)" />
              <circle cx="2" cy="11" r="0.9" fill="rgba(60,30,0,0.5)" />
              <circle cx="20" cy="11" r="0.9" fill="rgba(60,30,0,0.5)" />
            </g>
          </pattern>
        </defs>

        {/* ── Silk body ── */}
        <rect width="200" height="120" fill={`url(#${silk})`} />
        <rect width="200" height="120" fill={`url(#${body})`} opacity="0.7" />

        {/* ── Pallu — gold brocade band, the visible folded edge ── */}
        <rect y="120" width="200" height="38" fill={`url(#${gold})`} />
        <rect
          y="120"
          width="200"
          height="38"
          fill={`url(#${pallu})`}
          opacity="0.85"
        />
        {/* dark seam where body meets pallu */}
        <line
          x1="0"
          y1="120"
          x2="200"
          y2="120"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth="0.8"
        />
        {/* thin gold beading along the seam */}
        <line
          x1="0"
          y1="121.5"
          x2="200"
          y2="121.5"
          stroke={GOLD_LIGHT}
          strokeWidth="0.5"
        />

        {/* ── Layered fabric stack at the bottom (suggests fold thickness) ── */}
        <rect y="158" width="200" height="4" fill={base} opacity="0.85" />
        <rect y="162" width="200" height="3" fill={shadow} opacity="0.9" />
        <rect y="165" width="200" height="3" fill="rgba(0,0,0,0.55)" />

        {/* ── Sheen pass over the whole fold ── */}
        <rect width="200" height="168" fill={`url(#${sheen})`} opacity="0.7" />

        {/* ── Outer hairline frame ── */}
        <rect
          x="0.5"
          y="0.5"
          width="199"
          height="167"
          fill="none"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

export function DrapedSareePlaceholder({
  saree,
  className,
}: {
  saree: ShowcaseSaree;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const silk = `silk-${uid}`;
  const silkBack = `silkBack-${uid}`;
  const gold = `gold-${uid}`;
  const brocade = `brocade-${uid}`;
  const palluDense = `palluDense-${uid}`;
  const sheen = `sheen-${uid}`;

  const { highlight, base, shadow } = silkStops(saree);

  if (saree.image) {
    return (
      <div
        className={cn(
          "relative aspect-[16/10] w-full overflow-hidden rounded-[6px] ring-1 ring-black/35",
          className,
        )}
      >
        <Image
          src={saree.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 32vw, (min-width: 640px) 45vw, 70vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)} aria-hidden>
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
        className="block h-auto w-full drop-shadow-[0_14px_18px_rgba(0,0,0,0.5)]"
      >
        <defs>
          <linearGradient id={silk} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="60%" stopColor={base} />
            <stop offset="100%" stopColor={shadow} />
          </linearGradient>

          {/* Silk underside (the folded peek shows this) */}
          <linearGradient id={silkBack} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={shadow} />
            <stop offset="100%" stopColor={base} />
          </linearGradient>

          <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD_LIGHT} />
            <stop offset="50%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DEEP} />
          </linearGradient>

          <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
            <stop offset="30%" stopColor="rgba(255,255,255,0)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="75%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Body brocade — repeating gold floral diamond */}
          <pattern
            id={brocade}
            x="0"
            y="0"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <g fill={GOLD} opacity="0.7">
              <circle cx="14" cy="14" r="2" />
              <path d="M14 6 L17 14 L14 22 L11 14 Z" />
              <path d="M6 14 L14 11 L22 14 L14 17 Z" opacity="0.7" />
              <circle cx="0" cy="0" r="1" />
              <circle cx="28" cy="0" r="1" />
              <circle cx="0" cy="28" r="1" />
              <circle cx="28" cy="28" r="1" />
              <circle cx="14" cy="0" r="0.6" />
              <circle cx="0" cy="14" r="0.6" />
            </g>
          </pattern>

          {/* Dense pallu — outlined paisley */}
          <pattern
            id={palluDense}
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <g
              fill="none"
              stroke="rgba(50,25,0,0.55)"
              strokeWidth="0.7"
            >
              <path d="M5 18 C 2 14 4 8 10 6 C 16 4 20 8 20 12 C 20 16 16 20 12 20 C 9 20 6 19 5 18 Z" />
              <circle cx="12" cy="13" r="1.4" fill="rgba(50,25,0,0.5)" />
              <circle cx="2" cy="2" r="0.8" fill="rgba(50,25,0,0.5)" />
              <circle cx="22" cy="22" r="0.8" fill="rgba(50,25,0,0.5)" />
            </g>
          </pattern>
        </defs>

        {/* ── Main draped body ── */}
        <rect width="320" height="200" fill={`url(#${silk})`} />
        <rect width="320" height="200" fill={`url(#${brocade})`} opacity="0.85" />

        {/* ── Thick gold border framing the saree ── */}
        {/* top */}
        <rect width="320" height="10" fill={`url(#${gold})`} />
        <rect
          width="320"
          height="10"
          fill={`url(#${palluDense})`}
          opacity="0.6"
        />
        {/* bottom — wider pallu band */}
        <rect y="170" width="320" height="30" fill={`url(#${gold})`} />
        <rect
          y="170"
          width="320"
          height="30"
          fill={`url(#${palluDense})`}
          opacity="0.85"
        />
        <line
          x1="0"
          y1="170"
          x2="320"
          y2="170"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth="0.8"
        />
        {/* left */}
        <rect width="8" height="200" fill={`url(#${gold})`} />
        {/* right */}
        <rect x="312" width="8" height="200" fill={`url(#${gold})`} />

        {/* ── Folded corner peek on the right edge ── */}
        {/* shadow cast by the lifted corner */}
        <path
          d="M 218 200 L 248 80 L 240 200 Z"
          fill="rgba(0,0,0,0.35)"
        />
        {/* the lifted fabric corner showing the back */}
        <path
          d="M 230 200 L 320 200 L 320 110 L 248 80 Z"
          fill={`url(#${silkBack})`}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.8"
        />
        {/* gold edge along the fold crease */}
        <path
          d="M 230 200 L 248 80"
          stroke={GOLD}
          strokeWidth="2"
          opacity="0.8"
        />
        <path
          d="M 248 80 L 320 110"
          stroke={GOLD_LIGHT}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* ── Sheen over the silk ── */}
        <rect
          width="320"
          height="200"
          fill={`url(#${sheen})`}
          opacity="0.6"
        />

        {/* ── Outer hairline ── */}
        <rect
          x="0.5"
          y="0.5"
          width="319"
          height="199"
          fill="none"
          stroke="rgba(0,0,0,0.5)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}
