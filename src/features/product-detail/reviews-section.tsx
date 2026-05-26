export function ReviewsSection() {
  return (
    <section className="bg-bg-primary py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-2xl font-medium text-text-primary sm:text-3xl">
          Customer Reviews
        </h2>

        {/* Empty star row */}
        <div className="mt-5 flex items-center justify-center gap-1" aria-label="0 out of 5 stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="h-6 w-6" viewBox="0 0 24 24" aria-hidden>
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="none"
                stroke="var(--star-empty)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
        <p className="mt-1.5 font-body text-sm text-text-muted">0 / 5</p>

        <p className="mt-8 font-body text-base text-text-secondary">
          Be the first to write a review
        </p>

        <button
          type="button"
          className="mt-6 rounded-full bg-text-primary px-8 py-3 font-body text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary/40"
        >
          Write a Review
        </button>
      </div>
    </section>
  );
}
