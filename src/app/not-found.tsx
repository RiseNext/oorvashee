import Link from "next/link";
import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";
import { cn } from "@/lib/utils";

export const metadata = { title: "Page Not Found" };

/** Branded 404 — also rendered for unknown product/category slugs. */
export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="Page Not Found"
          blurb="We couldn't find the page you were looking for. It may have moved, or the link may be incomplete. Explore our collection instead."
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
