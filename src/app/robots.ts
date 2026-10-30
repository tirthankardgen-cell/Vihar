import type { MetadataRoute } from "next";
import { isPreview, site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (isPreview) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: site.url + "/sitemap.xml",
    host: site.url,
  };
}
