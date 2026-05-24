import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Saris" };

export default function SarisPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="Saris"
          blurb="The full saris catalogue lands when we build the products page."
        />
      </main>
    </>
  );
}
