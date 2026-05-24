import { Navbar } from "@/features/navbar";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ComingSoon title="Contact" />
      </main>
    </>
  );
}
