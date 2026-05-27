import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Kalamkari Sarees" };

export default function KalamkariSareesPage() {
  return (
    <SareeListingPage
      title="Kalamkari Sarees"
      subtitle="Hand-painted mythological narratives in natural dyes on fine cotton"
      products={SAREE_LISTING_PRODUCTS["kalamkari-sarees"]}
    />
  );
}
