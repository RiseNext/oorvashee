import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="Collections"
          blurb="Our curated edits — silk, cotton, linen, and bridal — are being arranged. The full grid lands with the products page."
        />
      </main>
    </>
  );
}
