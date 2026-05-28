"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminCard, StatusBadge, statusTone } from "@/features/admin/ui";
import { ProductMedia } from "@/features/admin/product-media";
import { ProductVariants } from "@/features/admin/product-variants";
import { cn } from "@/lib/utils";
import type { ProductTransition } from "@/lib/admin/api";
import type { AdminProduct, ProductStatus } from "@/types/admin";

const input = "w-full rounded-lg border border-border-default bg-white px-3.5 py-2.5 font-body text-sm text-text-primary outline-none transition-colors focus:border-border-focus";
const label = "font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary";

export default function AdminProductEditPage({ params }: { params: Promise<{ number: string }> }) {
  const { number: id } = use(params);
  const { authedFetch } = useApiClient();
  const query = useQuery({ queryKey: ["admin-product", id], queryFn: () => admin.getProduct(authedFetch, id) });

  return (
    <>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-1.5 font-body text-sm text-text-muted transition-colors hover:text-cta-fill">
        <ArrowLeft className="h-4 w-4" /> All products
      </Link>
      {query.isLoading ? (
        <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-cta-fill/30 border-t-cta-fill" /></div>
      ) : query.data ? (
        <EditForm product={query.data} refetch={() => query.refetch()} />
      ) : (
        <p className="font-body text-sm text-text-secondary">Product not found.</p>
      )}
    </>
  );
}

function EditForm({ product, refetch }: { product: AdminProduct; refetch: () => void }) {
  const { authedFetch } = useApiClient();
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: product.name,
    basePrice: String(product.basePrice),
    mrp: product.mrp != null ? String(product.mrp) : "",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    tags: product.tags.join(", "),
    featured: product.featured,
    isNew: product.isNew,
    isBestseller: product.isBestseller,
  });

  const save = useMutation({
    mutationFn: () =>
      admin.updateProduct(authedFetch, product.id, {
        name: f.name,
        basePrice: Number(f.basePrice),
        mrp: f.mrp ? Number(f.mrp) : null,
        shortDescription: f.shortDescription,
        description: f.description,
        seoTitle: f.seoTitle,
        seoDescription: f.seoDescription,
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        featured: f.featured,
        isNew: f.isNew,
        isBestseller: f.isBestseller,
      }),
    onSuccess: (p) => {
      qc.setQueryData(["admin-product", product.id], p);
      toast.success("Product saved");
    },
    onError: (e) => toastApiError(e),
  });

  const transition = useMutation({
    mutationFn: (t: ProductTransition) => admin.transitionProduct(authedFetch, product.id, t),
    onSuccess: (p) => {
      qc.setQueryData(["admin-product", product.id], p);
      toast.success("Status updated");
    },
    onError: (e) => toastApiError(e),
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-text-primary">{product.name}</h1>
          <StatusBadge label={product.status} tone={statusTone(product.status)} />
        </div>
        <StatusActions status={product.status} pending={transition.isPending} onTransition={(t) => transition.mutate(t)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <AdminCard>
            <h2 className="mb-4 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" full><input className={input} value={f.name} onChange={set("name")} /></Field>
              <Field label="Base price (₹)"><input className={input} inputMode="decimal" value={f.basePrice} onChange={set("basePrice")} /></Field>
              <Field label="MRP (₹, optional)"><input className={input} inputMode="decimal" value={f.mrp} onChange={set("mrp")} /></Field>
              <Field label="Short description" full><input className={input} value={f.shortDescription} onChange={set("shortDescription")} /></Field>
              <Field label="Description" full><textarea className={cn(input, "min-h-[120px] resize-y")} value={f.description} onChange={set("description")} /></Field>
              <Field label="Tags (comma-separated)" full><input className={input} value={f.tags} onChange={set("tags")} /></Field>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">SEO</h2>
            <div className="space-y-4">
              <Field label="SEO title" full><input className={input} value={f.seoTitle} onChange={set("seoTitle")} /></Field>
              <Field label="SEO description" full><textarea className={cn(input, "min-h-[80px] resize-y")} value={f.seoDescription} onChange={set("seoDescription")} /></Field>
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Media</h2>
            <ProductMedia productId={product.id} images={product.images} onChanged={refetch} />
          </AdminCard>

          <AdminCard>
            <h2 className="mb-4 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Variants</h2>
            <ProductVariants
              productId={product.id}
              variants={product.variants}
              basePrice={product.basePrice}
              onChanged={refetch}
            />
          </AdminCard>
        </div>

        {/* Sidebar: flags + save */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <AdminCard>
            <h2 className="mb-3 font-body text-sm font-bold uppercase tracking-[0.14em] text-text-primary">Visibility</h2>
            <div className="space-y-2">
              <Toggle label="Featured" checked={f.featured} onChange={(v) => setF((p) => ({ ...p, featured: v }))} />
              <Toggle label="New arrival" checked={f.isNew} onChange={(v) => setF((p) => ({ ...p, isNew: v }))} />
              <Toggle label="Bestseller" checked={f.isBestseller} onChange={(v) => setF((p) => ({ ...p, isBestseller: v }))} />
            </div>
          </AdminCard>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="w-full rounded-full bg-text-primary py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-bg-dark disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : "Save changes"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function StatusActions({ status, pending, onTransition }: { status: ProductStatus; pending: boolean; onTransition: (t: ProductTransition) => void }) {
  const actions: { label: string; t: ProductTransition }[] = [];
  if (status === "draft" || status === "unavailable") actions.push({ label: "Publish", t: "publish" });
  if (status === "published") actions.push({ label: "Unpublish", t: "unpublish" });
  if (status !== "archived") actions.push({ label: "Archive", t: "archive" });
  if (status === "archived") actions.push({ label: "Restore", t: "unarchive" });
  return (
    <div className="flex gap-2">
      {actions.map((a) => (
        <button
          key={a.t}
          type="button"
          disabled={pending}
          onClick={() => onTransition(a.t)}
          className="rounded-full border border-border-default px-4 py-2 font-body text-xs font-medium uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-cta-fill hover:text-cta-fill disabled:opacity-50"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label: l, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", full && "sm:col-span-2")}>
      <label className={label}>{l}</label>
      {children}
    </div>
  );
}

function Toggle({ label: l, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between font-body text-sm text-text-secondary">
      {l}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--cta-fill)]" />
    </label>
  );
}
