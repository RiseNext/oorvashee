import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Web app manifest — installable/mobile metadata. Colours mirror the approved
 * palette (cream surface, maroon theme). Icons resolve from the app `icon`/
 * `favicon` conventions; no separate PNG set is shipped yet.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.fullName,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F0E6D3",
    theme_color: "#7B0D0D",
    lang: "en-IN",
    categories: ["shopping", "lifestyle"],
  };
}
