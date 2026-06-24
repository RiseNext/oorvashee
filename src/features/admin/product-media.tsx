"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { compressImage } from "@/lib/media/compress-image";
import { cn } from "@/lib/utils";
import type { AdminImage } from "@/types/admin";

function fmtSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Cloudinary signed-upload manager. Per file: sign → upload to Cloudinary →
 * attach (backend re-verifies the signature). Images render in `position`
 * order; first upload becomes primary. `onChanged` refetches the product.
 */
export function ProductMedia({
  productId,
  images,
  onChanged,
}: {
  productId: string;
  images: AdminImage[];
  onChanged: () => void;
}) {
  const { authedFetch } = useApiClient();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0 || uploading) return;
    setUploading(true);
    try {
      let primaryCount = images.length;
      let totalOriginal = 0;
      let totalOutput = 0;
      for (const original of Array.from(files)) {
        // Resize + compress in the browser before the signed upload. The
        // smaller file flows through the UNCHANGED sign → upload → attach path
        // (the signature does not cover file bytes, so it stays valid).
        const { file, originalBytes, outputBytes, skipped } = await compressImage(original);
        totalOriginal += originalBytes;
        totalOutput += outputBytes;
        if (!skipped) {
          const pct = Math.round((1 - outputBytes / originalBytes) * 100);
          console.info(
            `[image] ${original.name}: ${fmtSize(originalBytes)} → ${fmtSize(outputBytes)} (${pct}% smaller)`,
          );
        }

        const sig = await admin.signUpload(authedFetch, productId);
        const result = await admin.uploadToCloudinary(sig, file);
        await admin.attachProductImage(authedFetch, productId, result, { isPrimary: primaryCount === 0 });
        primaryCount += 1;
      }
      onChanged();
      const savedPct =
        totalOriginal > 0 ? Math.round((1 - totalOutput / totalOriginal) * 100) : 0;
      toast.success(
        files.length > 1 ? "Images uploaded" : "Image uploaded",
        savedPct > 0
          ? { description: `Optimized ${fmtSize(totalOriginal)} → ${fmtSize(totalOutput)} (${savedPct}% smaller)` }
          : undefined,
      );
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function remove(id: string) {
    try {
      await admin.deleteProductImage(authedFetch, productId, id);
      onChanged();
    } catch {
      toast.error("Couldn't delete that image.");
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-border-light bg-bg-secondary">
            <Image src={img.url} alt={img.altText ?? ""} fill sizes="160px" className="object-cover" />
            {img.isPrimary && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-cta-fill px-2 py-0.5 font-body text-[9px] font-medium uppercase tracking-[0.1em] text-white">
                Primary
              </span>
            )}
            <button
              type="button"
              aria-label="Delete image"
              onClick={() => remove(img.id)}
              className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-text-primary opacity-0 shadow-sm transition-opacity hover:text-cta-fill group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {/* Upload tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            upload(e.dataTransfer.files);
          }}
          className={cn(
            "flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-text-muted transition-colors",
            dragOver ? "border-cta-fill bg-cta-fill/5 text-cta-fill" : "border-border-default hover:border-cta-fill hover:text-cta-fill",
          )}
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
          <span className="px-2 text-center font-body text-[11px]">
            {uploading ? "Uploading…" : "Drop or click"}
          </span>
        </button>

        {/* Capture tile — opens the phone's rear camera (capture="environment")
            on mobile; on desktop it gracefully falls back to the file picker.
            Reuses the EXACT same upload() path (compress → sign → Cloudinary →
            attach) as file upload, so the stored image + security are identical. */}
        <button
          type="button"
          aria-label="Take a photo with the camera"
          onClick={() => cameraInputRef.current?.click()}
          className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-default text-text-muted transition-colors hover:border-cta-fill hover:text-cta-fill"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          <span className="px-2 text-center font-body text-[11px]">
            {uploading ? "Uploading…" : "Take photo"}
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => upload(e.target.files)}
      />

      {/* Camera input: single shot from the device camera on mobile. Same
          onChange → upload() handler as the file picker above. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}
