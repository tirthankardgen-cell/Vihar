import { site } from "@/lib/site";
import type { GameCategory } from "@/lib/game-categories";
import { quickPlayGames } from "./quick-play";

type GameBase = {
  slug: string;
  title: string;
  description: string;
  genre: string;
  categories: readonly GameCategory[];
  platform: "Browser";
  artwork: string;
  artworkAlt: string;
  artworkLabel: "Concept artwork" | "Game artwork" | "Game illustration";
  collection?: "quick-play";
};

export type Game = GameBase &
  (
    | { status: "playable"; playUrl: string; availability: "Early playable build" | "Ready to play" }
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
  ...quickPlayGames.map((game): Game => ({
    slug: game.id, title: game.title, description: game.description,
    genre: game.genre, categories: game.categories, platform: "Browser",
    collection: game.collection, artwork: game.artwork, artworkAlt: game.artworkAlt,
    artworkLabel: "Game illustration",
    ...(game.release.status === "playable"
      ? { status: "playable", playUrl: game.embedUrl, availability: "Ready to play" }
      : { status: "upcoming", availability: "Coming soon" }),
  })),
];

export const featuredGame = games[0] as Game & { status: "playable"; playUrl: string };
