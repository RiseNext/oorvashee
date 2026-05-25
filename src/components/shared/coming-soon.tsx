import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { SectionLabel } from "@/components/shared/section-label";

interface ComingSoonProps {
  title: string;
  blurb?: string;
}

export function ComingSoon({ title, blurb }: ComingSoonProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-5 py-16 text-center sm:gap-5 sm:px-8 sm:py-24 md:px-10 md:py-32 lg:py-40 xl:max-w-5xl xl:py-48 2xl:max-w-6xl 2xl:py-56">
      <SectionLabel>In the loom</SectionLabel>
      <h1 className="font-display text-3xl font-medium tracking-tight text-text-primary sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
        {title}
      </h1>
      <div className="w-32 sm:w-36 md:w-40 xl:w-52 2xl:w-60">
        <OrnamentalDivider align="center" />
      </div>
      <p className="max-w-xl text-sm text-text-secondary sm:text-base md:text-lg xl:max-w-2xl xl:text-xl">
        {blurb ?? "This page is being woven. Check back as we roll out the rest of the experience."}
      </p>
    </section>
  );
}
