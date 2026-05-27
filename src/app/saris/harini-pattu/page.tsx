import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Harini Pattu" };

export default function HariniPattuPage() {
  return (
    <SareeListingPage
      title="Harini Pattu"
      subtitle="Exclusive pattu weaves with intricate motifs and lustrous finish"
      products={SAREE_LISTING_PRODUCTS["harini-pattu"]}
    />
  );
}
