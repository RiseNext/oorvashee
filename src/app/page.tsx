import { Navbar } from "@/features/navbar";
import {
  Hero,
  ShopByCollection,
  SareeShowcaseSection,
  NewArrivals,
} from "@/features/home";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ShopByCollection />
        <SareeShowcaseSection />
        <NewArrivals />
      </main>
    </>
  );
}
