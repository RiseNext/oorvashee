import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Fancy Gift Saris" };

export default function FancyGiftSarisPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="Fancy Gift Saris"
          blurb="A curated edit of gift-worthy fancy saris — coming as we wire the products grid."
        />
      </main>
    </>
  );
}
