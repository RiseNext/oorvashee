import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { getPolicyDoc } from "@/lib/api/policies";
import { TERMS_AND_CONDITIONS } from "@/config/policies";

// ISR: cached + revalidated hourly, bustable on-demand via revalidateTag("policies").
export const revalidate = 3600;

export const metadata: Metadata = {
  title: TERMS_AND_CONDITIONS.title,
  description: TERMS_AND_CONDITIONS.summary,
  alternates: { canonical: "/policies/terms" },
};

export default async function TermsPage() {
  const doc = (await getPolicyDoc("terms")) ?? TERMS_AND_CONDITIONS;
  return <PolicyPage title={doc.title} paragraphs={doc.paragraphs} />;
}
