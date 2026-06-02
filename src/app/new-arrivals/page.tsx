import { NewArrivalsListingPage } from "@/features/new-arrivals-page/new-arrivals-listing-page";
import { listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";

// ISR: statically rendered, revalidated every 5 min and on-demand via
// revalidateTag("products"). Fetch is caught so an offline build / transient
// backend blip degrades to an empty listing instead of throwing.
export const revalidate = 300;
export const metadata = { title: "New Arrivals" };

const CATALOG_PAGE_SIZE = 100;

export default async function NewArrivalsPage() {
  const page = await listProducts({ sort: "newest", pageSize: CATALOG_PAGE_SIZE }).catch(
    () => null,
  );
  return <NewArrivalsListingPage products={page ? toCardProducts(page.items) : []} />;
}
