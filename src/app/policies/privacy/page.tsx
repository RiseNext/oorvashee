import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { getPolicyDoc } from "@/lib/api/policies";
import { PRIVACY_POLICY } from "@/config/policies";

// Admin-editable copy lives in the backend — render per request so edits show
// up without a rebuild. Falls back to the seeded config if the API is down.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: PRIVACY_POLICY.title,
  description: PRIVACY_POLICY.summary,
  alternates: { canonical: "/policies/privacy" },
};

export default async function PrivacyPolicyPage() {
  const doc = (await getPolicyDoc("privacy")) ?? PRIVACY_POLICY;
  return <PolicyPage title={doc.title} paragraphs={doc.paragraphs} />;
}
