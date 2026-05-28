import { SareeListingPage } from "@/features/saree-listing/saree-listing-page";
import { listProducts } from "@/lib/api/products";
import { toCardProducts } from "@/lib/catalog/presenters";

export const dynamic = "force-dynamic";
export const metadata = { title: "All Sarees" };

const CATALOG_PAGE_SIZE = 100;

export default async function SarisPage() {
  const page = await listProducts({ pageSize: CATALOG_PAGE_SIZE });
  return (
    <SareeListingPage
      title="All Sarees"
      subtitle="Handcrafted heritage — from loom to drape"
      products={toCardProducts(page.items)}
    />
  );
}
