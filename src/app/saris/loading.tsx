import { Navbar } from "@/features/navbar";
import { CatalogSkeleton } from "@/components/shared/catalog-skeleton";

export default function Loading() {
  return (
    <>
      <Navbar />
      <CatalogSkeleton count={15} />
    </>
  );
}
