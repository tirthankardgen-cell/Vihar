import { BreadcrumbData, GameCollectionData } from "@/components/structured-data";
import { GameCollections } from "@/components/game-collections";
import { QuickPlayCatalogue } from "@/components/quick-play-catalogue";
import { quickPlayGames } from "@/lib/quick-play";
import { pageMetadata } from "@/lib/site";
import styles from "@/components/quick-play-catalogue.module.css";
import "@/app/content.css";

const description = "Explore Quick Play on Vihar: familiar board games, tabletop favourites and thoughtful puzzles. Meet all twelve games and see which are ready to play.";
export const metadata = pageMetadata("Quick Play — Board games & thoughtful puzzles", description, "/games/quick-play", "/images/quick-play/ludo.png");

export default function QuickPlayPage() {
  return <div className={`container catalogue-page ${styles.collection}`}>
    <div className="catalogue-intro"><p className="eyebrow">The Quick Play collection</p><h1>Good moves.<br /><em>Great company.</em></h1><p className="collection-description">Old favourites. New rivalries. A little room to think. Find a board game or a puzzle that makes you want one more round.</p></div>
    <GameCollections selected="quick-play" />
    <QuickPlayCatalogue games={quickPlayGames} />
    <p className={styles.collectionNote}>Quick Play games are VIHAR Originals. Each game has its own page, rules and player reviews. Available modes appear when a game is released.</p>
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Quick Play", path: "/games/quick-play" }]} />
    <GameCollectionData name="Quick Play" path="/games/quick-play" description={description} games={quickPlayGames.map((game) => ({ title: game.title, path: `/games/${game.id}` }))} />
  </div>;
}
