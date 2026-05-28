"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { useApiClient } from "@/hooks/use-api-client";
import * as admin from "@/lib/admin/api";
import { toastApiError } from "@/lib/api/toast";
import { AdminCard } from "@/features/admin/ui";

const input = "w-full rounded-lg border border-border-default bg-white px-3.5 py-2.5 font-body text-sm text-text-primary outline-none transition-colors focus:border-border-focus";

export default function NewProductPage() {
  const { authedFetch } = useApiClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  const create = useMutation({
    mutationFn: () => admin.createProduct(authedFetch, { name, basePrice: Number(basePrice), shortDescription }),
    onSuccess: (p) => {
      toast.success("Product created — add details, variants & images");
      router.push(`/admin/products/${p.id}`);
    },
    onError: (e) => toastApiError(e),
  });

  const valid = name.trim().length >= 2 && Number(basePrice) > 0;

  return (
    <>
      <Link href="/admin/products" className="mb-5 inline-flex items-center gap-1.5 font-body text-sm text-text-muted transition-colors hover:text-cta-fill">
        <ArrowLeft className="h-4 w-4" /> All products
      </Link>
      <h1 className="mb-6 font-display text-2xl font-semibold text-text-primary sm:text-3xl">New product</h1>
      <AdminCard className="max-w-xl">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) create.mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">Product name</label>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Banarasi Katan Silk Saree" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">Base price (₹)</label>
            <input className={input} inputMode="decimal" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium uppercase tracking-[0.08em] text-text-secondary">Short description (optional)</label>
            <input className={input} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>
          <button
            type="submit"
            disabled={!valid || create.isPending}
            className="rounded-full bg-text-primary px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-bg-dark disabled:opacity-50"
          >
            {create.isPending ? "Creating…" : "Create product"}
          </button>
          <p className="font-body text-xs text-text-muted">
            You&apos;ll add variants, images, and publish on the next screen.
          </p>
        </form>
      </AdminCard>
    </>
  );
}
