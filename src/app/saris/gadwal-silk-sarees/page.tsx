import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Gadwal Silk Sarees" };

export default function GadwalSilkSareesPage() {
  return (
    <SareeListingPage
      title="Gadwal Silk Sarees"
      subtitle="Handwoven heritage from Gadwal in rich silk and cotton blend"
      products={SAREE_LISTING_PRODUCTS["gadwal-silk-sarees"]}
    />
  );
}
