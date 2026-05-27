import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Narayanapet Sarees" };

export default function NarayanapetSareesPage() {
  return (
    <SareeListingPage
      title="Narayanapet Sarees"
      subtitle="Traditional Telangana weaves with distinctive cotton-silk texture"
      products={SAREE_LISTING_PRODUCTS["narayanapet-sarees"]}
    />
  );
}
