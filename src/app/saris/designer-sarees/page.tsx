import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Designer Sarees" };

export default function DesignerSareesPage() {
  return (
    <SareeListingPage
      title="Designer Sarees"
      subtitle="Contemporary silhouettes rooted in traditional craftsmanship"
      products={SAREE_LISTING_PRODUCTS["designer-sarees"]}
    />
  );
}
