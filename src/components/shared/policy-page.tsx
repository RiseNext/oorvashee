import { Navbar } from "@/features/navbar";
import { PageHeader } from "@/components/shared/page-header";

/**
 * Shared layout for long-form informational pages (policies, about, etc.).
 * Mirrors the Contact page treatment: a gold heading band framed by ornamental
 * dividers, over a centered prose column. Pass paragraphs as plain strings.
 */
export function PolicyPage({
  title,
  intro,
  paragraphs,
  children,
}: {
  title: string;
  intro?: string;
  paragraphs?: readonly string[];
  /** Optional extra content rendered after the paragraphs (e.g. contact cards). */
  children?: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-bg-primary">
        {/* ── Page header ── */}
        <PageHeader title={title} subtitle={intro} />

        {/* ── Body ── */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {paragraphs && paragraphs.length > 0 && (
            <div className="space-y-5 font-body text-[15px] leading-relaxed text-text-secondary sm:text-base">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          {children}
        </div>
      </main>
    </>
  );
}
