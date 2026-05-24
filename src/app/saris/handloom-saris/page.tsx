import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Handloom Saris" };

export default function HandloomSarisPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="Handloom Saris"
          blurb="Hand-spun, hand-woven heirloom pieces — the catalogue lands with the products page."
        />
      </main>
    </>
  );
}
