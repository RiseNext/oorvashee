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
 * Player vars for the silent reels wall, driven through the YouTube IFrame
 * Player API. No `loop`/`playlist`: looping is done in JS (replay on the ENDED
 * event) so the player never enters playlist mode — that mode is what adds the
 * prev/next buttons. Muted autoplay is mandatory (browsers block sound-on
 * autoplay); controls/keyboard/fullscreen/related/info are all off. The center
 * tap overlay that these flags can't kill is suppressed by `pointer-events:none`
 * on the iframe + the poster cover in `VideoWall`.
 */
export const YT_PLAYER_VARS = {
  autoplay: 1,
  mute: 1,
  controls: 0,
  modestbranding: 1,
  rel: 0,
  playsinline: 1,
  disablekb: 1,
  fs: 0,
  iv_load_policy: 3,
} as const;
