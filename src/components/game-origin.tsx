import { Sparkles, UsersRound } from "lucide-react";
import type { GameSource } from "@/lib/community";
import styles from "./game-origin.module.css";

// Origin comes from the collection a game belongs to, never its title or URL.
export function GameOrigin({ source }: { source: GameSource }) {
  const official = source === "officialGames";
  const Icon = official ? Sparkles : UsersRound;
  return <span className={`${styles.badge} ${official ? styles.original : styles.community}`}>
    <Icon size={13} aria-hidden="true" />{official ? "VIHAR Original" : "Community Game"}
  </span>;
}

export function ViharAttribution() {
  return <div className={styles.attribution}><GameOrigin source="officialGames" /><span>Created by VIHAR</span></div>;
}
