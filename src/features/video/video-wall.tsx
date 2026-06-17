"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { VideoItem } from "@/config/site";
import { YT_PLAYER_VARS, youTubeThumb } from "@/lib/youtube";

/**
 * Portrait reels wall. Each card plays a YouTube video silently on a loop with
 * NO player chrome — no controls, no pause, no prev/next, no center tap button.
 *
 * The three things that together remove every button (incl. the YouTube Shorts
 * tap overlay, which `controls=0` alone does NOT suppress):
 *  1. YouTube IFrame Player API + JS loop (replay on ENDED) — never enters
 *     playlist mode, so the prev/next buttons never exist.
 *  2. `pointer-events: none` on the iframe — YouTube receives zero hover/tap,
 *     so it never shows its tap controls (the center play/pause overlay).
 *  3. Poster cover held until the player reports PLAYING — masks the brief
 *     load-phase control flash, then fades to the clean video.
 *  A `linkUrl` adds a "shop this look" link layer above the (inert) player.
 *  Players are lazy-created as each card nears the viewport (perf).
 */

// ---- Minimal typings for the YouTube IFrame Player API (avoids @types/youtube) ----
interface YTPlayer {
  mute(): void;
  playVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  destroy(): void;
}
interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}
interface YTPlayerConfig {
  videoId: string;
  host?: string;
  playerVars?: Record<string, number>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
  };
}
interface YTNamespace {
  Player: new (el: HTMLElement, config: YTPlayerConfig) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Load the IFrame API script exactly once; resolve when `window.YT` is ready.
let apiPromise: Promise<YTNamespace> | null = null;
function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

export function VideoWall({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {videos.map((video, i) => (
        <VideoReel key={`${video.id}-${i}`} video={video} priority={i < 5} />
      ))}
    </div>
  );
}

function VideoReel({ video, priority }: { video: VideoItem; priority: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null); // IntersectionObserver target
  const hostRef = useRef<HTMLDivElement>(null); // React-owned wrapper; YT injects an iframe inside
  const playerRef = useRef<YTPlayer | null>(null);
  // Eagerly build the first row; lazy-build the rest as they approach the viewport.
  const [inView, setInView] = useState(priority);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (inView) return;
    const node = cardRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled || playerRef.current || !hostRef.current) return;
      // YT replaces the element we pass with an <iframe>; hand it a throwaway
      // child so it never removes the React-owned wrapper node.
      const mount = document.createElement("div");
      hostRef.current.appendChild(mount);
      playerRef.current = new YT.Player(mount, {
        videoId: video.id,
        host: "https://www.youtube-nocookie.com",
        playerVars: { ...YT_PLAYER_VARS },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              // Manual loop — no playlist, so prev/next buttons never exist.
              event.target.seekTo(0);
              event.target.playVideo();
            } else if (event.data === YT.PlayerState.PLAYING) {
              // Reveal only once truly playing → the load-phase flash stays
              // hidden behind the poster the whole time.
              setPlaying(true);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [inView, video.id]);

  return (
    <figure className="overflow-hidden rounded-2xl border border-border-default/50 bg-bg-card shadow-sm">
      <div ref={cardRef} className="relative aspect-[9/16] w-full overflow-hidden bg-bg-secondary">
        {/* Player mounts here. React owns this wrapper; YT injects the iframe child. */}
        {/* pointer-events:none on the iframe = YouTube gets no hover/tap → no tap controls ever. */}
        <div
          ref={hostRef}
          className="absolute inset-0 h-full w-full [&>iframe]:pointer-events-none [&>iframe]:h-full [&>iframe]:w-full"
        />

        {/* Poster cover — masks the entire load phase (and its control flash) until PLAYING. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youTubeThumb(video.id)}
          alt={video.title ?? ""}
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-700 ${
            playing ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Shop link layer (only when set). The player itself is inert (pointer-events:none). */}
        {video.linkUrl && (
          <Link
            href={video.linkUrl}
            aria-label={video.title ? `Shop ${video.title}` : "Shop this look"}
            className="absolute inset-0 z-20"
          />
        )}

        {/* Title + optional shop affordance, overlaid like a reel caption. */}
        {(video.title || video.linkUrl) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pb-3 pt-8">
            {video.title && (
              <p className="line-clamp-2 font-display text-sm text-white drop-shadow">{video.title}</p>
            )}
            {video.linkUrl && (
              <span className="mt-1 inline-flex items-center gap-1 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
                Shop this look <span aria-hidden>→</span>
              </span>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}
