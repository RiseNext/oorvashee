import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Our Craft" };

export default function OurCraftPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="Our Craft"
          blurb="The story of the looms, the weavers, and the regions behind every Oorvashee saree."
        />
      </main>
    </>
  );
}
