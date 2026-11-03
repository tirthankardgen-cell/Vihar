import { site } from "@/lib/site";
import type { GameCategory } from "@/lib/game-categories";

type GameBase = {
  slug: string;
  title: string;
  description: string;
  genre: string;
  categories: readonly GameCategory[];
  platform: "Browser";
  artwork: string;
  artworkAlt: string;
};

export type Game = GameBase &
  (
    | { status: "playable"; playUrl: string; availability: "Early playable build" }
    | { status: "upcoming"; playUrl?: never; availability: "Coming soon" }
  );

export const games: Game[] = [
  {
    slug: "bap-ka-rasta",
    title: "Bap Ka Rasta",
    description:
      "Your city. Your ride. Your own way. A free-roaming browser game.",
    genre: "Driving · Exploration",
    categories: ["free-roam", "solo", "arcade", "simulation"],
    platform: "Browser",
    artwork: "/images/bap-ka-rasta-cover.webp",
    artworkAlt: "Promotional concept art of SUVs, a scooter, motorcycle and rickshaws exploring a warm Indian city avenue",
    status: "playable",
    availability: "Early playable build",
    playUrl: site.gameUrl,
  },
  {
    slug: "gulam-chor",
    title: "Gulam Chor",
    description:
      "A little mystery. A new world. More to reveal.",
    genre: "In development",
    // Gameplay and player modes have not been announced yet.
    categories: [],
    platform: "Browser",
    artwork: "/images/gulam-chor.webp",
    artworkAlt: "Original concept illustration of playing cards and a terracotta token on a lavender table",
    status: "upcoming",
    availability: "Coming soon",
  },
];

export const featuredGame = games[0] as Game & { status: "playable"; playUrl: string };
