import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Pattu Sarees" };

export default function PattuSareesPage() {
  return (
    <SareeListingPage
      title="Pattu Sarees"
      subtitle="A curated collection of South India's finest silk pattu weaves"
      products={SAREE_LISTING_PRODUCTS["pattu"]}
    />
  );
}
