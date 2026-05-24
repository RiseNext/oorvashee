import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Kanchi Pattu Saree" };

export default function KanchiPattuSareePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="Kanchi Pattu Saree"
          blurb="The Kanchi Pattu edit will live here — woven on traditional Kanchipuram looms."
        />
      </main>
    </>
  );
}
