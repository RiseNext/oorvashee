import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";

// ISR: statically rendered, revalidated every 5 min and on-demand via
// revalidateTag("products"). The fetch is caught so a build with no backend (or
// a runtime blip during revalidation) degrades to the listing's empty state
// instead of throwing — consistent with the home page's graceful degradation.
export const revalidate = 300;
export const metadata = { title: "All Sarees" };

const CATALOG_PAGE_SIZE = 100;

export default async function SarisPage() {
  const page = await listProducts({ pageSize: CATALOG_PAGE_SIZE }).catch(() => null);
  return (
    <SareeListingPage
      title="All Sarees"
      subtitle="Handcrafted heritage — from loom to drape"
      products={page ? toCardProducts(page.items) : []}
    />
  );
}
