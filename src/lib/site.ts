import { helpPaths } from "./help";
import type { Metadata } from "next";
import { quickPlayGames } from "./quick-play";

function httpsUrl(value: string, name: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${name} must be a public HTTPS URL without credentials.`);
  }
  return url.toString().replace(/\/$/, "");
}

export const site = {
  name: "Vihar",
  tagline: "A space to play.",
  searchUpdated: "2026-11-14T08:26:00.000Z",
  url: httpsUrl(process.env.SITE_URL || "https://vihar.online", "SITE_URL"),
  instagram: "https://www.instagram.com/vihar.world",
  email: process.env.SUPPORT_EMAIL || "contact@vihar.online",
  description:
    "Play free browser games, Indian board and card games, and puzzles on Vihar. Discover independent games, read player reviews or publish your own game.",
  gameUrl: httpsUrl(
    process.env.BAP_KA_RASTA_URL || "https://rasta.vihar.online",
    "BAP_KA_RASTA_URL",
  ),
  gulamChorUrl: httpsUrl(
    process.env.GULAM_CHOR_URL || "https://gulamchor.vihar.online",
    "GULAM_CHOR_URL",
  ),
};

const canonical = new URL(site.url);
if (canonical.pathname !== "/" || canonical.search || canonical.hash) {
  throw new Error("SITE_URL must be an HTTPS origin, without a path, query, or fragment.");
}

export const isPreview = process.env.VERCEL_ENV === "preview";
export const publicRoutes = [
  "/", "/games", "/games/originals", "/games/community", "/games/bap-ka-rasta", "/games/bap-ka-rasta/screenshots", "/games/gulam-chor",
  "/games/quick-play", ...quickPlayGames.map((game) => `/games/${game.id}`),
  ...helpPaths, "/about", "/help", "/contact", "/privacy", "/terms", "/guides/bap-ka-rasta-first-drive", "/site-map",
] as const;

const upcomingRoutes = new Set(quickPlayGames.filter((game) => game.release.status !== "playable").map((game) => `/games/${game.id}`));
export const indexableRoutes = publicRoutes.filter((route) => !upcomingRoutes.has(route));

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)) {
  throw new Error("SUPPORT_EMAIL must be a valid email address.");
}

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  image = "/images/social-vihar.png",
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_IN",
      url: path,
      title: `${title} | Vihar`,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — Vihar` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Vihar`,
      description,
      images: [image],
    },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
