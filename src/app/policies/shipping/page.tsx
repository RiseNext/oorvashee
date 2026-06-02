import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { getPolicyDoc } from "@/lib/api/policies";
import { SHIPPING_POLICY } from "@/config/policies";

// ISR: cached + revalidated hourly, bustable on-demand via revalidateTag("policies").
export const revalidate = 3600;

export const metadata: Metadata = {
  title: SHIPPING_POLICY.title,
  description: SHIPPING_POLICY.summary,
  alternates: { canonical: "/policies/shipping" },
};

export default async function ShippingPolicyPage() {
  const doc = (await getPolicyDoc("shipping")) ?? SHIPPING_POLICY;
  return <PolicyPage title={doc.title} paragraphs={doc.paragraphs} />;
}
