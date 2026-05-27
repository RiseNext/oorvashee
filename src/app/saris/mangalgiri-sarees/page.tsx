import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Mangalgiri Sarees" };

export default function MangalgiriSareesPage() {
  return (
    <SareeListingPage
      title="Mangalgiri Sarees"
      subtitle="Lightweight Andhra cotton-silk with signature Nizam-era borders"
      products={SAREE_LISTING_PRODUCTS["mangalgiri-sarees"]}
    />
  );
}
