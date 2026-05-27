import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Fancy Sarees" };

export default function FancySareesPage() {
  return (
    <SareeListingPage
      title="Fancy Sarees"
      subtitle="Statement drapes for every celebration — bold, beautiful, unforgettable"
      products={SAREE_LISTING_PRODUCTS["fancy-sarees"]}
    />
  );
}
