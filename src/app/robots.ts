import type { MetadataRoute } from "next";
import { isPreview, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (isPreview) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    // Keep pages, original artwork and Next's image renderer crawlable. Account
    // pages use noindex metadata; blocking them here would hide that directive.
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: ["bingbot", "BingPreview", "Googlebot", "Googlebot-Image", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot"], allow: "/" },
    ],
    sitemap: site.url + "/sitemap.xml",
    host: site.url,
  };
}
