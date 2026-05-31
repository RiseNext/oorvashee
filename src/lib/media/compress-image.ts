import imageCompression from "browser-image-compression";

/**
 * Client-side image optimisation run BEFORE the Cloudinary signed upload.
 *
 * Why this is signature-safe: the Cloudinary signature is computed over
 * `timestamp / folder / eager / public_id` only — NOT the file bytes. So
 * swapping the original file for a smaller re-encoded one does not invalidate
 * the signed envelope. Nothing in the upload/sign/attach flow changes shape.
 *
 * Policy (premium saree photography — preserve fabric detail + zoom headroom):
 *   - cap the longest edge at 2560px (2× the largest delivered derivative)
 *   - re-encode to WebP at quality 0.82 (visually lossless at these sizes)
 *   - run in a Web Worker so a 20MB phone photo never freezes the admin UI
 *   - EXIF orientation is baked into pixels by the canvas re-encode (the lib
 *     handles this), so portrait phone shots are never rotated
 *
 * Robustness: this NEVER blocks an upload. Non-photo types, already-small
 * images, a larger-than-original result, or any failure all fall back to the
 * untouched original file so existing upload behaviour is preserved exactly.
 */

const MAX_EDGE = 2560;
const QUALITY = 0.82;
/** Already-small files within target dimensions are uploaded untouched. */
const SKIP_UNDER_BYTES = 1.5 * 1024 * 1024;
/** Only these raster formats are safe to transcode to WebP. */
const COMPRESSIBLE = /^image\/(jpeg|jpg|png|webp|avif)$/i;

export interface CompressionResult {
  /** The file to upload — compressed, or the original when skipped. */
  file: File;
  originalBytes: number;
  outputBytes: number;
  /** True when the original was uploaded unchanged (no re-encode happened). */
  skipped: boolean;
}

async function tryGetLongestEdge(file: File): Promise<number | null> {
  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(file);
      const edge = Math.max(bmp.width, bmp.height);
      bmp.close?.();
      return edge;
    }
  } catch {
    /* dimension probe failed — caller proceeds without the skip optimisation */
  }
  return null;
}

function toWebpName(name: string): string {
  return `${name.replace(/\.[^.]+$/, "")}.webp`;
}

export async function compressImage(file: File): Promise<CompressionResult> {
  const originalBytes = file.size;
  const unchanged: CompressionResult = {
    file,
    originalBytes,
    outputBytes: originalBytes,
    skipped: true,
  };

  // Non-photo / unknown types (gif, svg, etc.) pass through untouched.
  if (!COMPRESSIBLE.test(file.type)) return unchanged;

  // Skip-if-smaller: already under ~1.5MB AND within the target dimensions.
  if (originalBytes < SKIP_UNDER_BYTES) {
    const edge = await tryGetLongestEdge(file);
    if (edge !== null && edge <= MAX_EDGE) return unchanged;
  }

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: MAX_EDGE,
      initialQuality: QUALITY,
      fileType: "image/webp",
      useWebWorker: true,
      // Soft ceiling well above any expected output — keeps this quality-driven
      // (resize + q0.82), not size-driven (no iterative quality collapse).
      maxSizeMB: 10,
    });

    // If re-encoding produced a larger file (rare, e.g. tiny PNG → WebP), keep
    // the original.
    if (compressed.size >= originalBytes) return unchanged;

    const renamed = new File([compressed], toWebpName(file.name), {
      type: "image/webp",
    });
    return {
      file: renamed,
      originalBytes,
      outputBytes: renamed.size,
      skipped: false,
    };
  } catch {
    // Never let optimisation break an upload.
    return unchanged;
  }
}
