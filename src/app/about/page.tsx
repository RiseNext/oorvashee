import type { Metadata } from "next";
import { PolicyPage } from "@/components/shared/policy-page";
import { ABOUT_US } from "@/config/policies";

export const metadata: Metadata = {
  title: ABOUT_US.title,
  description: ABOUT_US.tagline,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PolicyPage title={ABOUT_US.title} intro={ABOUT_US.tagline} paragraphs={ABOUT_US.paragraphs} />
  );
}
