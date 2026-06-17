/**
 * Storefront video wall — fetched from the backend (admin-managed) with the
 * static `videoGallery` config as a guaranteed fallback.
 *
 * The backend owns the canonical list: admins add YouTube links in the
 * dashboard and they flow to the `/video` page. If the API is unavailable (or
 * mock mode is on) the page falls back to config and ultimately to the
 * "watch on YouTube" CTA — it never errors.
 */
import { clientEnv } from "@/lib/env";
import { videoGallery, type VideoItem } from "@/config/site";
import { apiFetch } from "./client";

const useMock = clientEnv.NEXT_PUBLIC_USE_MOCK_API;

// Admin-edited but changes rarely. Short window so new videos appear within a
// minute; bustable on demand via revalidateTag("videos").
const VIDEO_REVALIDATE = 60;
const TAG_VIDEOS = "videos";

/** Backend `VideoRead` shape. */
interface BackendVideo {
  youtube_id: string;
  title: string | null;
  link_url: string | null;
}

function mapVideo(v: BackendVideo): VideoItem {
  return {
    id: v.youtube_id,
    title: v.title ?? undefined,
    linkUrl: v.link_url ?? undefined,
  };
}

/** Active videos in display order. Falls back to the config list on failure. */
export async function listVideos(): Promise<VideoItem[]> {
  if (useMock) return videoGallery;
  try {
    const rows = await apiFetch<BackendVideo[]>("/videos", {
      revalidate: VIDEO_REVALIDATE,
      tags: [TAG_VIDEOS],
    });
    return rows.length > 0 ? rows.map(mapVideo) : videoGallery;
  } catch {
    return videoGallery;
  }
}
