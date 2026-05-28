"use client";

import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics";

// Confines the client boundary to this tiny component (mounted once in the
// root layout). Forwards Core Web Vitals (LCP/CLS/INP/FCP/TTFB) into the
// analytics seam — a no-op until a sink is attached, so it costs nothing in
// production until monitoring is wired.
const report: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  track({
    name: "web_vital",
    metric: metric.name,
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    rating: metric.rating,
    id: metric.id,
  });
};

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
