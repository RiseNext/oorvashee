import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "New Arrivals" };

export default function NewArrivalsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon
          title="New Arrivals"
          blurb="Fresh weaves landing soon. This grid will list the latest pieces as they arrive from the looms."
        />
      </main>
    </>
  );
}
