import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Cotton Sarees" };

export default function CottonSareesPage() {
  return (
    <SareeListingPage
      title="Cotton Sarees"
      subtitle="Breathable everyday elegance in fine handwoven cotton"
      products={SAREE_LISTING_PRODUCTS["cotton-sarees"]}
    />
  );
}
