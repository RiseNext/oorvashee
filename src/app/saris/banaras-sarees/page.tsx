import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Banaras Sarees" };

export default function BanarasSareesPage() {
  return (
    <SareeListingPage
      title="Banaras Sarees"
      subtitle="Timeless Banarasi silk in intricate zari and brocade weaves"
      products={SAREE_LISTING_PRODUCTS["banaras-sarees"]}
    />
  );
}
