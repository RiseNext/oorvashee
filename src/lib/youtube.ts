/**
 * YouTube helpers shared by the admin video manager (link preview) and the
 * public reels wall (embed + thumbnail URLs).
 *
 * `extractYouTubeId` mirrors the backend's `app.core.validators.extract_youtube_id`
 * so the admin sees the same id the server will store. The backend remains the
 * source of truth — this is purely for the optimistic thumbnail preview.
 */

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const URL_PATTERNS = [
  /(?:youtube\.com|youtube-nocookie\.com)\/watch\?(?:[^&]*&)*v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com|youtube-nocookie\.com)\/shorts\/([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com|youtube-nocookie\.com)\/embed\/([A-Za-z0-9_-]{11})/,
  /(?:youtube\.com|youtube-nocookie\.com)\/live\/([A-Za-z0-9_-]{11})/,
];

/** Canonical 11-char id from any common YouTube URL form (or a bare id), else null. */
export function extractYouTubeId(value: string | null | undefined): string | null {
  if (!value) return null;
  const candidate = value.trim();
  if (ID_RE.test(candidate)) return candidate;
  for (const pattern of URL_PATTERNS) {
    const match = candidate.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/** Poster image for a video id. `hqdefault` exists for every video. */
export function youTubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Embed URL tuned for the silent autoplay reels wall: muted autoplay (browsers
 * block unmuted autoplay), single-video loop (`loop` needs `playlist=<id>`),
 * no controls / keyboard / fullscreen / related videos.
 */
export function youTubeEmbedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
