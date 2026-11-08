import { GameDiscovery } from "@/components/game-discovery";
import { BreadcrumbData, GameCollectionData } from "@/components/structured-data";
import { games } from "@/lib/games";
import { pageMetadata } from "@/lib/site";
import "@/app/content.css";

const description = "Games created by the VIHAR team. Play Bap Ka Rasta and Gulam Chor in your browser, explore their worlds, and share your ratings and reviews.";
export const metadata = pageMetadata("VIHAR Originals — Games by our team", description, "/games/originals");

export default function OriginalsPage() {
  return <div className="container catalogue-page">
    <div className="catalogue-intro"><p className="eyebrow">Created by the VIHAR team</p><h1>Our worlds.<br /><em>Your next adventure.</em></h1><p className="collection-description">{description}</p></div>
    <GameDiscovery games={games} community={[]} selected="originals" />
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "VIHAR Originals", path: "/games/originals" }]} />
    <GameCollectionData name="VIHAR Originals" path="/games/originals" description={description} games={games.map((game) => ({ title: game.title, path: `/games/${game.slug}` }))} />
  </div>;
}
