import { helpArticles } from "./help";
import { publicRoutes } from "@/lib/site";
import { quickPlayGames } from "./quick-play";

export const siteDirectory = [
  ...helpArticles.map((article) => ({ path: `/help/${article.slug}`, name: article.title, description: article.description })),
  { path: "/", name: "Vihar home", description: "VIHAR Originals, Community Games and a little room for wonder." },
  { path: "/games", name: "All games", description: "Browse playable games and upcoming adventures." },
  { path: "/games/originals", name: "VIHAR Originals", description: "Games created by the VIHAR team, with artwork, play guides and player reviews." },
  { path: "/games/community", name: "Community Games", description: "Independent games shared by creators and players. Discover who published each game." },
  { path: "/games/quick-play", name: "Quick Play", description: "Board favourites, tabletop games and thoughtful puzzles by VIHAR." },
  ...quickPlayGames.map((game) => ({ path: `/games/${game.id}`, name: `${game.title} — Quick Play${game.release.status === "upcoming" ? " (coming soon)" : ""}`, description: game.description })),
  { path: "/games/bap-ka-rasta", name: "Bap Ka Rasta — VIHAR Original", description: "Free-roaming driving, rides, cities, characters, gameplay and controls." },
  { path: "/games/bap-ka-rasta/screenshots", name: "Screenshots and gallery", description: "Gameplay, the playable map, landmarks, characters and concept previews." },
  { path: "/guides/bap-ka-rasta-first-drive", name: "First-drive guide", description: "Your first route, gears, cameras, touch controls and recovery." },
  { path: "/games/gulam-chor", name: "Gulam Chor — VIHAR Original", description: "Play the family card game, meet the virtual family, and learn the rules." },
  { path: "/about", name: "Our story", description: "The idea behind Vihar, our name and our emblem." },
  { path: "/help", name: "Help and FAQs", description: "Playing, supported devices, downloads and Vihar ID." },
  { path: "/contact", name: "Contact", description: "Get in touch with feedback or a support question." },
  { path: "/privacy", name: "Privacy", description: "Accounts, browser storage and how information is handled." },
  { path: "/terms", name: "Terms", description: "The terms for browsing Vihar and playing our games." },
  { path: "/site-map", name: "Site map", description: "Find every public page in one place." },
] satisfies { path: (typeof publicRoutes)[number]; name: string; description: string }[];
