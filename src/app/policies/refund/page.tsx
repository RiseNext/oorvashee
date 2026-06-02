import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { getPolicyDoc } from "@/lib/api/policies";
import { REFUND_POLICY } from "@/config/policies";

// ISR: cached + revalidated hourly, bustable on-demand via revalidateTag("policies").
export const revalidate = 3600;

export const metadata: Metadata = {
  title: REFUND_POLICY.title,
  description: REFUND_POLICY.summary,
  alternates: { canonical: "/policies/refund" },
};

export default async function RefundPolicyPage() {
  const doc = (await getPolicyDoc("refund")) ?? REFUND_POLICY;
  return <PolicyPage title={doc.title} paragraphs={doc.paragraphs} />;
}
