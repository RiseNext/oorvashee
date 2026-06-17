"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import type { VideoItem } from "@/config/site";
import { youTubeEmbedUrl, youTubeThumb } from "@/lib/youtube";

/**
 * Portrait reels wall: each card autoplays muted on a loop with no controls.
 * To keep the page light (and avoid YouTube throttling), a card only mounts its
 * iframe once it scrolls near the viewport — until then it shows the poster
 * thumbnail. A transparent overlay swallows clicks so the video can't be
 * paused; when a `linkUrl` is set the overlay becomes a "shop this look" link.
 */
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
  const ref = useRef<HTMLDivElement>(null);
  // Eagerly mount the first row; lazy-mount the rest as they approach the viewport.
  const [show, setShow] = useState(priority);

  useEffect(() => {
    if (show) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [show]);

  const overlayClass = "absolute inset-0 z-10";

  return (
    <figure className="overflow-hidden rounded-2xl border border-border-default/50 bg-bg-card shadow-sm">
      <div ref={ref} className="relative aspect-[9/16] w-full bg-bg-secondary">
        {show ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={youTubeEmbedUrl(video.id)}
            title={video.title ?? "Oorvashee video"}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={youTubeThumb(video.id)}
            alt={video.title ?? ""}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Blocks pause (clicks never reach the player); becomes the shop link when set. */}
        {video.linkUrl ? (
          <Link
            href={video.linkUrl}
            aria-label={video.title ? `Shop ${video.title}` : "Shop this look"}
            className={overlayClass}
          />
        ) : (
          <span aria-hidden className={overlayClass} />
        )}

        {/* Title + optional shop affordance, overlaid like a reel caption. */}
        {(video.title || video.linkUrl) && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3 pb-3 pt-8">
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
