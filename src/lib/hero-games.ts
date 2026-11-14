import type { CSSProperties } from "react";
import { quickPlayGames } from "./quick-play";
import { quickPlayVisualStyle } from "./quick-play-visuals";

export interface WorldCard {
  src: string;
  alt: string;
  title: string;
  caption: string;
  href: string;
  visual?: CSSProperties;
}

const featured = ["chess", "carrom", "sudoku", "tic-tac-toe", "paperwing", "ludo", "billiards", "silk-trail", "monsoon-blocks", "minesweeper"];
const games = featured.map((id) => quickPlayGames.find((game) => game.id === id)!);
const cards = games.map((game): WorldCard => ({
  src: game.artwork, alt: game.artworkAlt, title: game.title,
  caption: `${game.release.status === "playable" ? "Play here" : "Coming soon"} · ${game.artworkLabel}`,
  href: `/games/${game.id}`, visual: quickPlayVisualStyle(game),
}));

// Small serializable props keep full game descriptions/rules out of hero JS.
export const heroWorlds: WorldCard[] = [
  { src: "/images/bap-ka-rasta-cover.webp", title: "Bap Ka Rasta", caption: "Concept artwork", alt: "Promotional concept art of SUVs, a scooter, motorcycle and rickshaws on an Indian city avenue", href: "/games/bap-ka-rasta" },
  ...cards.slice(0, 3),
  { src: "/images/gulam-chor/landing.webp", title: "Gulam Chor", caption: "Playable now · Family card game", alt: "Gulam Chor illustrated courtyard with its Hindi title and an invitation to play", href: "/games/gulam-chor" },
  ...cards.slice(3),
];
