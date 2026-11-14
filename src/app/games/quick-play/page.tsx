import { BreadcrumbData, GameCollectionData } from "@/components/structured-data";
import { GameCollections } from "@/components/game-collections";
import { QuickPlayCatalogue } from "@/components/quick-play-catalogue";
import { quickPlayGames } from "@/lib/quick-play";
import { pageMetadata } from "@/lib/site";
import styles from "@/components/quick-play-catalogue.module.css";
import "@/app/content.css";

const description = "Play free browser board games on Vihar: Carrom, Chess and Tic-Tac-Toe. Try computer or Pass & Play modes, learn the rules and explore upcoming games and puzzles.";
export const metadata = pageMetadata("Free Browser Board Games & Puzzles — Quick Play", description, "/games/quick-play", "/images/quick-play/ludo.png");

export default function QuickPlayPage() {
  return <div className={`container catalogue-page ${styles.collection}`}>
    <div className="catalogue-intro"><p className="eyebrow">Free browser board games &amp; puzzles</p><h1>Good moves.<br /><em>Great company.</em></h1><p className="collection-description">{description}</p></div>
    <GameCollections selected="quick-play" />
    <QuickPlayCatalogue games={quickPlayGames} />
    <p className={styles.collectionNote}>Quick Play games are VIHAR Originals. Each game has its own page, rules and player reviews. Available modes appear when a game is released.</p>
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Quick Play", path: "/games/quick-play" }]} />
    <GameCollectionData name="Quick Play" path="/games/quick-play" description={description} games={quickPlayGames.map((game) => ({ title: game.title, path: `/games/${game.id}` }))} />
  </div>;
}
