import type { MetadataRoute } from "next";
import { indexableRoutes, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes.map((path) => ({
    url: site.url + (path === "/" ? "" : path),
  }));
}
