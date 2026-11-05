import { publicGames } from "@/lib/community-public";
import type { MetadataRoute } from "next";
import { indexableRoutes, site } from "@/lib/site";
import { galleryPath } from "@/lib/game-images";
import { galleryImages } from "@/lib/game-showcase";
import { gulamFamily, gulamScreenshots } from "@/lib/gulam-chor";

// Refresh the generated sitemap every five minutes; lastmod records content changes, not requests.
export const revalidate = 300;
const updatedContent = new Set(["/", "/games", "/games/bap-ka-rasta", galleryPath, "/guides/bap-ka-rasta-first-drive", "/about", "/help", "/site-map", "/privacy", "/terms"]);
const creatorUpdated = "2026-11-03T10:43:58+00:00";
const gulamUpdated = "2026-11-05T00:00:00+05:30";

const pageImages: Record<string, readonly string[]> = {
  "/": [
    "/brand/icon-192.png", "/brand/vihar-avatar.png", "/images/social-vihar.png",
    "/images/courtyard.webp", "/images/playground.webp", "/images/gulam-chor/landing.webp",
    "/images/bap-ka-rasta-cover.webp", "/images/bap-ka-rasta-gameplay.webp",
    "/images/bap-ka-rasta/street-scene.webp", "/images/bap-ka-rasta/auto.webp",
    "/images/bap-ka-rasta-seafront.webp", "/images/bap-ka-rasta-mumbai-map.webp",
  ],
  "/games": ["/images/bap-ka-rasta-cover.webp", "/images/gulam-chor/landing.webp"],
  "/games/gulam-chor": ["/images/gulam-chor/landing.webp", "/images/gulam-chor/courtyard.svg", ...gulamScreenshots.map((shot) => shot.src), ...gulamFamily.map((person) => `/images/gulam-chor/${person.id}.svg`)],
  "/games/bap-ka-rasta": ["/images/bap-ka-rasta-city-preview.webp", "/images/bap-ka-rasta-mumbai-chowk.webp", "/images/bap-ka-rasta-mumbai-map.webp", "/images/bap-ka-rasta-cover.webp", "/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  [galleryPath]: galleryImages.map((image) => image.src),
  "/guides/bap-ka-rasta-first-drive": ["/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  "/about": ["/images/playground.webp"],
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const community = await publicGames();
  return [...indexableRoutes.map((path) => ({
    url: site.url + (path === "/" ? "" : path),
    images: pageImages[path]?.map((image) => site.url + image),
    ...(["/", "/games", "/games/gulam-chor", "/about", "/help", "/site-map"].includes(path) ? { lastModified: gulamUpdated } : updatedContent.has(path) ? { lastModified: ["/games/bap-ka-rasta", galleryPath, "/guides/bap-ka-rasta-first-drive"].includes(path) ? "2026-11-03T00:00:00+05:30" : creatorUpdated } : {}),
  })), ...community.map((game) => ({ url: `${site.url}/community/${game.id}`, lastModified: game.updatedAt }))];
}
