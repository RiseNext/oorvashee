/**
 * Listing-page skeleton — mirrors the saree grid layout so the swap from
 * loading → content is shift-free (no CLS). Pure CSS pulse, no JS.
 */
export function CatalogSkeleton({ count = 10 }: { count?: number }) {
  return (
    <main className="flex-1 bg-bg-primary">
      {/* Heading band */}
      <div className="bg-bg-secondary py-10 text-center sm:py-14 lg:py-16">
        <div className="mx-auto h-10 w-64 animate-pulse rounded bg-black/5 sm:h-14 sm:w-80" />
        <div className="mx-auto mt-4 h-4 w-48 animate-pulse rounded bg-black/5" />
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-screen-xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between sm:mb-8">
          <div className="h-9 w-28 animate-pulse rounded-md bg-black/5" />
          <div className="h-4 w-20 animate-pulse rounded bg-black/5" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-border-light bg-bg-card"
            >
              <div className="aspect-[4/5] w-full animate-pulse bg-bg-secondary" />
              <div className="flex flex-col gap-2 px-4 py-3.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-black/5" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-black/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
