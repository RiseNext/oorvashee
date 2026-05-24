import type { SVGProps } from "react";

const base = {
  width: 28,
  height: 28,
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Trust-bar icons — line-art SVGs in `currentColor`.
 * Per docs/UI.md §3.13 — color them via `text-gold` on the parent.
 * Drop replacement SVGs in /public/images/icons/ when ready and swap the import.
 */

export function LotusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M16 26c-5 0-10-3-10-8 2 1 4 1 5 0-1-3 1-6 5-6 4 0 6 3 5 6 1 1 3 1 5 0 0 5-5 8-10 8Z" />
      <path d="M16 22V11" />
      <path d="M16 11c-1.6 0-3 1.4-3 3" />
      <path d="M16 11c1.6 0 3 1.4 3 3" />
    </svg>
  );
}

export function WeaveGridIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="5" width="22" height="22" rx="1.5" />
      <path d="M5 12h22" />
      <path d="M5 19h22" />
      <path d="M12 5v22" />
      <path d="M19 5v22" />
    </svg>
  );
}

export function HeritageIcon(props: SVGProps<SVGSVGElement>) {
  // Temple-arch silhouette
  return (
    <svg {...base} {...props}>
      <path d="M6 27V14a10 10 0 0 1 20 0v13" />
      <path d="M6 27h20" />
      <path d="M11 27v-7a5 5 0 0 1 10 0v7" />
      <path d="M16 7V4" />
      <circle cx="16" cy="11" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpoolIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="6" width="14" height="20" rx="1.5" />
      <path d="M6 6h20" />
      <path d="M6 26h20" />
      <path d="M9 12h14" />
      <path d="M9 20h14" />
    </svg>
  );
}

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M16 4 6 8v8c0 6 4.5 10 10 12 5.5-2 10-6 10-12V8l-10-4Z" />
      <path d="m12 16 3 3 5-6" />
    </svg>
  );
}

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M16 27s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12Z" />
    </svg>
  );
}
