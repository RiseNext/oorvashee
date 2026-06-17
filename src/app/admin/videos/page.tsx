"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import type { AdminVideo, VideoUpdateBody } from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminHeading } from "@/features/admin/admin-shell";
import { AdminCard, AdminEmpty, AdminError, StatusBadge, TableSkeleton } from "@/features/admin/ui";
import { extractYouTubeId, youTubeThumb } from "@/lib/youtube";
import { cn } from "@/lib/utils";

const inputClass = cn(
  "w-full rounded-lg border border-border-default bg-white px-3.5 py-2.5 font-body text-sm text-text-primary",
  "placeholder:text-text-muted/60 outline-none transition-colors focus:border-border-focus",
);
const labelClass =
  "mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary";

export default function AdminVideosPage() {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-videos"],
    queryFn: () => admin.listVideos(authedFetch),
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["admin-videos"] });
    // Storefront `/video` reads the public list — bust it too.
    qc.invalidateQueries({ queryKey: ["videos"] });
  }

  const create = useMutation({
    mutationFn: (body: admin.VideoCreateBody) => admin.createVideo(authedFetch, body),
    onSuccess: () => {
      invalidate();
      toast.success("Video added");
    },
    onError: (e) => toastApiError(e),
  });

  const save = useMutation({
    mutationFn: async ({
      id,
      patch,
      displayOrder,
      orderChanged,
    }: {
      id: string;
      patch: VideoUpdateBody;
      displayOrder: number;
      orderChanged: boolean;
    }) => {
      if (Object.keys(patch).length > 0) await admin.updateVideo(authedFetch, id, patch);
      if (orderChanged) await admin.reorderVideo(authedFetch, id, displayOrder);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Video saved");
    },
    onError: (e) => toastApiError(e),
  });

  const remove = useMutation({
    mutationFn: (id: string) => admin.deleteVideo(authedFetch, id),
    onSuccess: () => {
      invalidate();
      toast.success("Video removed");
    },
    onError: (e) => toastApiError(e),
  });

  return (
    <>
      <AdminHeading title="Videos" />
      <p className="-mt-3 mb-6 max-w-2xl font-body text-sm text-text-muted">
        Paste a YouTube link to add it to the storefront video wall. Videos autoplay on a
        silent loop, in the order below. Hidden videos stay saved but don&apos;t show.
      </p>

      <AddVideoForm onAdd={(body) => create.mutate(body)} adding={create.isPending} />

      <div className="mt-8">
        {query.isLoading ? (
          <TableSkeleton rows={3} />
        ) : query.isError ? (
          <AdminError onRetry={() => query.refetch()} />
        ) : (query.data ?? []).length === 0 ? (
          <AdminEmpty
            title="No videos yet"
            body="Add your first YouTube link above — it appears on the /video page right away."
          />
        ) : (
          <div className="space-y-5">
            {(query.data ?? []).map((video) => (
              <VideoEditor
                key={`${video.id}-${video.updatedAt}`}
                video={video}
                saving={save.isPending && save.variables?.id === video.id}
                removing={remove.isPending && remove.variables === video.id}
                onSave={(args) => save.mutate({ id: video.id, ...args })}
                onRemove={() => {
                  if (confirm("Remove this video from the wall?")) remove.mutate(video.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function AddVideoForm({
  onAdd,
  adding,
}: {
  onAdd: (body: admin.VideoCreateBody) => void;
  adding: boolean;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const previewId = extractYouTubeId(url);
  const urlInvalid = url.trim().length > 0 && previewId === null;

  function handleAdd() {
    if (!previewId) {
      toast.error("Paste a valid YouTube link");
      return;
    }
    onAdd({
      url: url.trim(),
      title: title.trim() || undefined,
      linkUrl: linkUrl.trim() || undefined,
    });
    setUrl("");
    setTitle("");
    setLinkUrl("");
  }

  return (
    <AdminCard>
      <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">Add a video</h2>
      <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
        {/* Thumbnail preview */}
        <div className="aspect-[9/16] w-full overflow-hidden rounded-xl border border-border-light bg-bg-secondary sm:w-28">
          {previewId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={youTubeThumb(previewId)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center font-body text-[10px] text-text-muted">
              Preview
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>YouTube link or video id</label>
            <input
              className={cn(inputClass, urlInvalid && "border-cta-fill focus:border-cta-fill")}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/shorts/… or https://youtu.be/…"
            />
            {urlInvalid && (
              <p className="mt-1.5 font-body text-xs text-cta-fill">
                That doesn&apos;t look like a YouTube link.
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title (optional)</label>
              <input
                className={inputClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Shown under the video"
              />
            </div>
            <div>
              <label className={labelClass}>Shop link (optional)</label>
              <input
                className={inputClass}
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="/product/… or full URL"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || !previewId}
              className={cn(
                "rounded-full bg-text-primary px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white",
                "transition-colors hover:bg-bg-dark disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {adding ? "Adding…" : "Add video"}
            </button>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}

function VideoEditor({
  video,
  saving,
  removing,
  onSave,
  onRemove,
}: {
  video: AdminVideo;
  saving: boolean;
  removing: boolean;
  onSave: (args: { patch: VideoUpdateBody; displayOrder: number; orderChanged: boolean }) => void;
  onRemove: () => void;
}) {
  const initialUrl = `https://youtu.be/${video.youtubeId}`;
  const [url, setUrl] = useState(initialUrl);
  const [title, setTitle] = useState(video.title ?? "");
  const [linkUrl, setLinkUrl] = useState(video.linkUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState(video.displayOrder);
  const [isActive, setIsActive] = useState(video.isActive);

  const previewId = extractYouTubeId(url) ?? video.youtubeId;
  const idChanged = extractYouTubeId(url) !== null && extractYouTubeId(url) !== video.youtubeId;
  const orderChanged = displayOrder !== video.displayOrder;
  const dirty =
    idChanged ||
    orderChanged ||
    title !== (video.title ?? "") ||
    linkUrl !== (video.linkUrl ?? "") ||
    isActive !== video.isActive;

  function handleSave() {
    if (extractYouTubeId(url) === null) {
      toast.error("Paste a valid YouTube link");
      return;
    }
    const patch: VideoUpdateBody = {};
    if (idChanged) patch.url = url.trim();
    if (title !== (video.title ?? "")) patch.title = title.trim() || null;
    if (linkUrl !== (video.linkUrl ?? "")) patch.linkUrl = linkUrl.trim() || null;
    if (isActive !== video.isActive) patch.isActive = isActive;
    onSave({ patch, displayOrder, orderChanged });
  }

  return (
    <AdminCard>
      <div className="grid gap-5 sm:grid-cols-[112px_1fr]">
        {/* Thumbnail */}
        <div className="aspect-[9/16] w-full overflow-hidden rounded-xl border border-border-light bg-bg-secondary sm:w-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={youTubeThumb(previewId)} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <h2 className="truncate font-display text-base font-semibold text-text-primary">
              {video.title || video.youtubeId}
            </h2>
            <StatusBadge
              label={video.isActive ? "Visible" : "Hidden"}
              tone={video.isActive ? "green" : "amber"}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>YouTube link or video id</label>
              <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Shop link</label>
                <input
                  className={inputClass}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="optional"
                />
              </div>
              <div>
                <label className={labelClass}>Order</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-[var(--cta-fill)]"
              />
              Visible on the storefront
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRemove}
                disabled={removing}
                className="rounded-full border border-border-default px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-cta-fill hover:text-cta-fill disabled:opacity-40"
              >
                {removing ? "Removing…" : "Remove"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || saving}
                className={cn(
                  "rounded-full bg-text-primary px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.12em] text-white",
                  "transition-colors hover:bg-bg-dark disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminCard>
  );
}
