import { ArrowUpRight, Dices, Sparkles, UsersRound } from "lucide-react";
import Link from "@/components/site-link";
import styles from "./game-collections.module.css";

export type CollectionFilter = "all" | "originals" | "community" | "quick-play";
const collections = [
  { id: "originals", title: "VIHAR Originals", description: "Games created by the VIHAR team.", Icon: Sparkles },
  { id: "community", title: "Community Games", description: "Games shared by independent creators and players.", Icon: UsersRound },
  { id: "quick-play", title: "Quick Play", description: "Board favourites and thoughtful puzzles by VIHAR.", Icon: Dices },
] as const;

export function GameCollections({ selected }: { selected?: CollectionFilter }) {
  return <div className={styles.collections}>
    <div className={styles.heading}><p>Find a game. Know who’s behind it.</p>{selected && <Link href="/games" aria-current={selected === "all" ? "page" : undefined}>All games</Link>}</div>
    <nav className={styles.choices} aria-label="Game collections">
      {collections.map(({ id, title, description, Icon }) => {
        const content = <><span className={styles.icon}><Icon size={21} aria-hidden="true" /></span><span className={styles.copy}><strong>{title}</strong><span>{description}</span></span><ArrowUpRight size={18} aria-hidden="true" /></>;
        const className = `${styles.choice} ${styles[id]}`;
        return <Link key={id} className={className} href={`/games/${id}`} aria-current={selected === id ? "page" : undefined}>{content}</Link>;
      })}
    </nav>
  </div>;
}
