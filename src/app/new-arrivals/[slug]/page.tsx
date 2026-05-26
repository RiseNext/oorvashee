import { ProductDetailPage } from "@/features/product-detail/product-detail-page";
import { MOCK_PRODUCT_DETAIL } from "@/features/product-detail/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return <ProductDetailPage product={MOCK_PRODUCT_DETAIL} />;
}
