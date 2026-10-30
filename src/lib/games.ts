import { site } from "@/lib/site";

type GameBase = {
  slug: string;
  title: string;
  description: string;
  genre: string;
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
      "Your auto. Mumbai’s streets. Take the long way home in a free-roaming driving game.",
    genre: "Driving · Exploration",
    platform: "Browser",
    artwork: "/images/bap-ka-rasta-cover.webp",
    artworkAlt: "Concept artwork of a black-and-yellow auto rickshaw on a warm, lively Mumbai street",
    status: "playable",
    availability: "Early playable build",
    playUrl: site.gameUrl,
  },
  {
    slug: "ekka-chor",
    title: "Ekka Chor",
    description:
      "A new game is taking shape. A little mystery, a fresh world, and more to reveal.",
    genre: "In development",
    platform: "Browser",
    artwork: "/images/ekka-chor.webp",
    artworkAlt: "Original concept illustration of playing cards and a terracotta token on a lavender table",
    status: "upcoming",
    availability: "Coming soon",
  },
];

export const featuredGame = games[0] as Game & { status: "playable"; playUrl: string };
