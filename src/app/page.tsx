import { Navbar } from "@/features/navbar";
import {
  Hero,
  ShopByCollection,
  NewArrivals,
  SareesForYou,
} from "@/features/home";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ShopByCollection />
        <NewArrivals />
        <SareesForYou />
      </main>
    </>
  );
}
