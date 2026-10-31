import type { MetadataRoute } from "next";
import { indexableRoutes, site } from "@/lib/site";
import { gameImages, galleryPath } from "@/lib/game-images";

const pageImages: Record<string, readonly string[]> = {
  "/": ["/images/courtyard.webp", "/images/bap-ka-rasta-cover.webp", "/images/bap-ka-rasta-gameplay.webp"],
  "/games": ["/images/bap-ka-rasta-cover.webp", "/images/gulam-chor.webp"],
  "/games/bap-ka-rasta": ["/images/bap-ka-rasta-cover.webp", "/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  [galleryPath]: gameImages.map((image) => image.src),
  "/guides/bap-ka-rasta-first-drive": ["/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  "/about": ["/images/playground.webp"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes.map((path) => ({
    url: site.url + (path === "/" ? "" : path),
    images: pageImages[path]?.map((image) => site.url + image),
  }));
}
