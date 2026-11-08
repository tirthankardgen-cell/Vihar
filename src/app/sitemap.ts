import { helpUpdated } from "@/lib/help";
import { publicGames } from "@/lib/community-public";
import type { MetadataRoute } from "next";
import { indexableRoutes, site } from "@/lib/site";
import { galleryPath } from "@/lib/game-images";
import { galleryImages } from "@/lib/game-showcase";
import { gulamFamily, gulamScreenshots } from "@/lib/gulam-chor";
import { quickPlayGames, quickPlayUpdated } from "@/lib/quick-play";

// Refresh the generated sitemap every five minutes; lastmod records content changes, not requests.
export const revalidate = 300;
// Daily discovery hints do not schedule Google/Bing crawls. Published listings
// refresh every five minutes so a new game does not wait a day to be discovered.
const discoveryHints = { changeFrequency: "daily", priority: 1 } as const;
const discoveryUpdated = "2026-11-08T00:00:00+05:30";
const discoveryPages = new Set(["/", "/games", "/games/originals", "/games/community", "/games/bap-ka-rasta", "/games/gulam-chor", "/about", "/help", "/site-map"]);
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
  "/games/originals": ["/images/bap-ka-rasta-cover.webp", "/images/gulam-chor/landing.webp"],
  "/games/quick-play": quickPlayGames.map((game) => game.artwork),
  ...Object.fromEntries(quickPlayGames.map((game) => [`/games/${game.id}`, [game.artwork]])),
  "/games/gulam-chor": ["/images/social-gulam-chor.png", "/images/gulam-chor/landing.webp", "/images/gulam-chor/courtyard.svg", ...gulamScreenshots.map((shot) => shot.src), ...gulamFamily.map((person) => `/images/gulam-chor/${person.id}.svg`)],
  "/games/bap-ka-rasta": ["/images/bap-ka-rasta-city-preview.webp", "/images/bap-ka-rasta-mumbai-chowk.webp", "/images/bap-ka-rasta-mumbai-map.webp", "/images/bap-ka-rasta-cover.webp", "/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  [galleryPath]: galleryImages.map((image) => image.src),
  "/guides/bap-ka-rasta-first-drive": ["/images/bap-ka-rasta-gameplay.webp", "/images/bap-ka-rasta-camera.webp"],
  "/about": ["/images/playground.webp"],
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const community = await publicGames();
  const latestDiscovery = community.reduce((latest, game) => Date.parse(game.updatedAt) > Date.parse(latest) ? game.updatedAt : latest, quickPlayUpdated);
  return [...indexableRoutes.map((path) => ({
    url: site.url + (path === "/" ? "" : path),
    ...discoveryHints,
    ...(path.startsWith("/help/") ? { lastModified: helpUpdated } : {}),
    images: pageImages[path]?.map((image) => site.url + image),
    ...(discoveryPages.has(path) ? { lastModified: ["/", "/games", "/games/community", "/site-map"].includes(path) ? latestDiscovery : discoveryUpdated } : path === "/games/gulam-chor" ? { lastModified: gulamUpdated } : updatedContent.has(path) ? { lastModified: ["/games/bap-ka-rasta", galleryPath, "/guides/bap-ka-rasta-first-drive"].includes(path) ? "2026-11-03T00:00:00+05:30" : creatorUpdated } : {}),
    ...(["/games/quick-play", "/games/originals"].includes(path) ? { lastModified: quickPlayUpdated } : {}),
    ...Object.fromEntries(quickPlayGames.filter((game) => path === `/games/${game.id}` && game.release.status === "playable").map((game) => ["lastModified", game.release.status === "playable" ? game.release.verifiedAt : quickPlayUpdated])),
  })), ...community.map((game) => ({ url: `${site.url}/community/${game.id}`, ...discoveryHints, lastModified: game.updatedAt, images: [...new Set([game.coverUrl, ...(game.screenshots ?? [])].filter((url): url is string => !!url && url.startsWith("https://")))] }))];
}
