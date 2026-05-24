import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon title="About Us" />
      </main>
    </>
  );
}
