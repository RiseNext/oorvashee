import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "All Sarees" };

export default function SarisPage() {
  return (
    <SareeListingPage
      title="All Sarees"
      subtitle="Handcrafted heritage — from loom to drape"
      products={SAREE_LISTING_PRODUCTS.all}
    />
  );
}
