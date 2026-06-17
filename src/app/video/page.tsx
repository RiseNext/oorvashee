import type { Metadata } from "next";
import { Play } from "lucide-react";
import { Navbar } from "@/features/navbar";
import { PageHeader } from "@/components/shared/page-header";
import { VideoWall } from "@/features/video/video-wall";
import { siteConfig } from "@/config/site";
import { listVideos } from "@/lib/api/videos";

// ISR: cached + revalidated, bustable on-demand via revalidateTag("videos").
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Video",
  description: `Watch draping guides, weave stories, and collection films from ${siteConfig.fullName}.`,
  alternates: { canonical: "/video" },
};

export default async function VideoPage() {
  const videos = await listVideos();
  const hasVideos = videos.length > 0;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        {/* ── Page header ── */}
        <PageHeader
          title="Video"
          subtitle="Draping guides, weave stories, and collection films"
        />

        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          {hasVideos && <VideoWall videos={videos} />}

          {/* Channel CTA — the hero of the page until featured films are added. */}
          <div className={hasVideos ? "mt-12" : ""}>
            <div className="mx-auto max-w-2xl rounded-2xl border border-border-default/50 bg-bg-card px-8 py-12 text-center shadow-sm sm:px-12 sm:py-16">
              <div
                className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "color-mix(in srgb, var(--gold) 15%, transparent)" }}
              >
                <Play className="h-7 w-7" style={{ color: "var(--gold)" }} strokeWidth={1.5} fill="currentColor" />
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-wide text-text-primary sm:text-3xl">
                Our films live on YouTube
              </h2>
              <p className="mx-auto mt-3 max-w-md font-body text-sm text-text-secondary sm:text-base">
                See sarees in motion — draping tutorials, the stories behind each weave, and
                a closer look at our newest collections.
              </p>
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-cta-fill px-7 py-3 font-body text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-cta-fill-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/40"
              >
                Watch on YouTube
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
