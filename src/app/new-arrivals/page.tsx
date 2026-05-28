import { NewArrivalsListingPage } from "@/features/new-arrivals-page/new-arrivals-listing-page";
import { listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";

export const dynamic = "force-dynamic";
export const metadata = { title: "New Arrivals" };

const CATALOG_PAGE_SIZE = 100;

export default async function NewArrivalsPage() {
  const page = await listProducts({ sort: "newest", pageSize: CATALOG_PAGE_SIZE });
  return <NewArrivalsListingPage products={toCardProducts(page.items)} />;
}
