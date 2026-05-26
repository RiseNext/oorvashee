import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { SAREE_LISTING_PRODUCTS } from "@/features/saree-listing/data";

export const metadata = { title: "Cocktail Party Wear Sarees" };

export default function CocktailPartySareesPage() {
  return (
    <SareeListingPage
      title="Cocktail Party Wear"
      subtitle="Vibrant festive drapes crafted for every celebration"
      products={SAREE_LISTING_PRODUCTS["cocktail-party-wear-sarees"]}
    />
  );
}
