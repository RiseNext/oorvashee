import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Pure Kanjivaram Silk" };

export default function PureKanjivaramSilkPage() {
  return (
    <SareeListingPage
      title="Pure Kanjivaram Silk"
      subtitle="Mark-certified pure Kanjivaram — the pinnacle of South Indian silk weaving"
      products={SAREE_LISTING_PRODUCTS["pure-kanjivaram-silk"]}
    />
  );
}
