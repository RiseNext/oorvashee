import { Navbar } from "@/features/navbar";

/** PDP skeleton — gallery + buy-zone two-column shell. Shift-free. */
export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="bg-bg-primary">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12 xl:gap-16">
            {/* Gallery */}
            <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-bg-secondary" />
            {/* Buy zone */}
            <div className="flex flex-col gap-5">
              <div className="h-4 w-40 animate-pulse rounded bg-black/5" />
              <div className="h-9 w-3/4 animate-pulse rounded bg-black/5" />
              <div className="h-7 w-32 animate-pulse rounded bg-black/5" />
              <div className="h-px bg-border-light" />
              <div className="h-5 w-24 animate-pulse rounded bg-black/5" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 w-14 animate-pulse rounded-xl bg-bg-secondary" />
                ))}
              </div>
              <div className="mt-2 flex gap-3">
                <div className="h-12 flex-1 animate-pulse rounded-full bg-black/5" />
                <div className="h-12 flex-1 animate-pulse rounded-full bg-black/5" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
