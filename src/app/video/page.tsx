import type { Metadata } from "next";
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
        </div>
      </main>
    </>
  );
}
