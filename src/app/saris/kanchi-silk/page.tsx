import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Kanchi Silk Sarees" };

export default function KanchiSilkPage() {
  return (
    <SareeListingPage
      title="Kanchi Silk"
      subtitle="Pure Kanchipuram silk in timeless temple borders and vivid zari"
      products={SAREE_LISTING_PRODUCTS["kanchi-silk"]}
    />
  );
}
