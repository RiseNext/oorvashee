import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Kanchipattu Sarees" };

export default function KanchiPattuSareePage() {
  return (
    <SareeListingPage
      title="Kanchipattu Sarees"
      subtitle="Woven on traditional Kanchipuram looms in pure mulberry silk"
      products={SAREE_LISTING_PRODUCTS["kanchi-pattu-saree"]}
    />
  );
}
