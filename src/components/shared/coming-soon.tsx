import { OrnamentalDivider } from "@/components/shared/ornamental-divider";
import { SectionLabel } from "@/components/shared/section-label";

interface ComingSoonProps {
  title: string;
  blurb?: string;
}

export function ComingSoon({ title, blurb }: ComingSoonProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center sm:px-6 md:py-32 lg:px-16">
      <SectionLabel>In the loom</SectionLabel>
      <h1 className="font-display text-4xl font-medium tracking-tight text-text-primary sm:text-5xl">
        {title}
      </h1>
      <div className="w-40">
        <OrnamentalDivider align="center" />
      </div>
      <p className="max-w-xl text-base text-text-secondary">
        {blurb ?? "This page is being woven. Check back as we roll out the rest of the experience."}
      </p>
    </section>
  );
}
