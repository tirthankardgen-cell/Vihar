import type { MetadataRoute } from "next";
import { indexableRoutes, site } from "@/lib/site";
import { galleryPath } from "@/lib/game-images";
import { galleryImages } from "@/lib/game-showcase";

const pageImages: Record<string, readonly string[]> = {
  "/": [
    "/brand/icon-192.png", "/brand/vihar-avatar.png", "/images/social-vihar.png",
    "/images/courtyard.webp", "/images/playground.webp", "/images/gulam-chor.webp",
    "/images/bap-ka-rasta-cover.webp", "/images/bap-ka-rasta-gameplay.webp",
    "/images/bap-ka-rasta/street-scene.webp", "/images/bap-ka-rasta/auto.webp",
    "/images/bap-ka-rasta-seafront.webp", "/images/bap-ka-rasta-mumbai-map.webp",
  ],
  "/games": ["/images/bap-ka-rasta-cover.webp", "/images/gulam-chor.webp"],
  "/games/bap-ka-rasta": ["/images/bap-ka-rasta-cover.webp", "/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  [galleryPath]: galleryImages.map((image) => image.src),
  "/guides/bap-ka-rasta-first-drive": ["/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  "/about": ["/images/playground.webp"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes.map((path) => ({
    url: site.url + (path === "/" ? "" : path),
    images: pageImages[path]?.map((image) => site.url + image),
  }));
}
