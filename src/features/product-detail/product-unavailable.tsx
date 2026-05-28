import Link from "next/link";
import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";
import { cn } from "@/lib/utils";

/**
 * Rendered for archived / unavailable products. Per the bot URL contract the
 * backend returns 200 with `available=false` (not a 404), so a shared link
 * never dead-ends — it lands here with a graceful, on-brand message.
 */
export function ProductUnavailable({ name }: { name?: string }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title={name ?? "Product Unavailable"}
          blurb="This piece is currently unavailable — it may be sold out or no longer part of the collection. Explore the rest of our handwoven sarees."
        />
        <div className="-mt-6 mb-24 flex justify-center sm:-mt-10">
          <Link
            href="/saris"
            className={cn(
              "group inline-flex items-center gap-2 rounded-md border-[1.5px] border-cta-fill px-6 py-3",
              "font-body text-[11px] font-medium uppercase tracking-[0.2em] text-cta-fill transition-colors duration-300",
              "hover:bg-cta-fill hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fill/30",
            )}
          >
            Browse All Sarees
          </Link>
        </div>
      </main>
    </>
  );
}
