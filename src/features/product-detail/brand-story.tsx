import Image from "next/image";

export function BrandStory() {
  return (
    <section className="bg-bg-secondary py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <div>
            <p
              className="mb-4 font-body text-[10px] font-semibold uppercase tracking-[0.3em]"
              style={{ color: "var(--gold)" }}
            >
              Our Promise
            </p>
            <h2 className="mb-6 font-display text-3xl font-medium leading-tight text-text-primary sm:text-4xl lg:text-5xl">
              Every Detail Matters
              <br />
              Made With Purpose
            </h2>
            <div className="space-y-4 font-body text-base leading-relaxed text-text-secondary">
              <p>
                Each Oorvashee saree begins as a vision — a thread, a dye, a memory of a weave
                passed down through generations. Our artisans work on handlooms that have remained
                unchanged for centuries, translating ancient technique into contemporary grace.
              </p>
              <p>
                From selecting the finest yarns to the final fold, every step is driven by a single
                intent: to create something that feels as special as the occasion you wear it for.
                Oorvashee is not just a saree — it is a story you wear.
              </p>
            </div>
          </div>

          {/* Editorial image */}
          <div className="relative overflow-hidden rounded-2xl bg-bg-primary lg:aspect-[4/5]">
            <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
              <Image
                src="/images/products/sss-29.jpg"
                alt="Artisan weaving saree fabric"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover grayscale"
              />
              <div className="absolute inset-0 bg-text-primary/10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
