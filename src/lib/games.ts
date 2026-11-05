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
  artworkLabel: "Concept artwork" | "Game artwork";
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
    artworkLabel: "Concept artwork",
    status: "playable",
    availability: "Early playable build",
    playUrl: site.gameUrl,
  },
  {
    slug: "gulam-chor",
    title: "Gulam Chor",
    description:
      "Make a pair. Pick a card. Keep a straight face. A little luck, a lot of apne.",
    genre: "Cards · Family",
    categories: ["cards", "solo"],
    platform: "Browser",
    artwork: "/images/gulam-chor/landing.webp",
    artworkAlt: "Gulam Chor's illustrated Indian courtyard with its Hindi title and an invitation to play a round",
    artworkLabel: "Game artwork",
    status: "playable",
    availability: "Early playable build",
    playUrl: site.gulamChorUrl,
  },
];

export const featuredGame = games[0] as Game & { status: "playable"; playUrl: string };
