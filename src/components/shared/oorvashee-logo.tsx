import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface OorvasheeLogoProps {
  /** Pixel size of the medallion (square). Default 64. */
  size?: number;
  className?: string;
  /** Use the real PNG once dropped at /images/ui/logo.png. */
  src?: string;
  /** Pass null to render without a link wrapper (e.g. when an ancestor is already a link). */
  href?: string | null;
}

const DEFAULT_LOGO_SRC = "/images/hero/hero-logo/image.png";

/**
 * Brand logo. Defaults to the real PNG at /public/images/hero/hero-logo/image.png.
 * Pass `src={null as never}` style override only if you intentionally want the SVG fallback.
 */
export function OorvasheeLogo({
  size = 64,
  className,
  src = DEFAULT_LOGO_SRC,
  href = "/",
}: OorvasheeLogoProps) {
  const content = src ? (
    <Image
      src={src}
      alt={siteConfig.fullName}
      width={size}
      height={size}
      priority
      className="select-none"
    />
  ) : (
    <PlaceholderMedallion size={size} />
  );

  if (!href) return <span className={cn("inline-block", className)}>{content}</span>;

  return (
    <Link
      href={href}
      aria-label={siteConfig.fullName}
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {content}
    </Link>
  );
}

function PlaceholderMedallion({ size }: { size: number }) {
  const id = "ooorvashee-logo-grad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={siteConfig.fullName}
      className="select-none"
    >
      <defs>
        <radialGradient id={id} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E8C96A" />
          <stop offset="55%" stopColor="#C4982A" />
          <stop offset="100%" stopColor="#7A4B15" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id})`} />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#3D1A08"
        strokeOpacity="0.25"
        strokeWidth="0.8"
      />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="Cormorant Garamond, Georgia, serif"
        fontWeight="600"
        fontSize="28"
        fill="#3D1A08"
      >
        O
      </text>
    </svg>
  );
}
