import { NewArrivalsListingPage } from "@/features/new-arrivals-page/new-arrivals-listing-page";
import { NEW_ARRIVALS_PAGE_PRODUCTS } from "@/features/new-arrivals-page/data";

export const metadata = { title: "New Arrivals" };

export default function NewArrivalsPage() {
  return <NewArrivalsListingPage products={NEW_ARRIVALS_PAGE_PRODUCTS} />;
}
