import { GameDiscovery } from "@/components/game-discovery";
import "@/app/content.css";
import { BreadcrumbData, GameCollectionData } from "@/components/structured-data";
import { publicGames } from "@/lib/community-public";
import { games } from "@/lib/games";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("VIHAR Originals & Community Games", "Explore VIHAR Originals made by our team and Community Games shared by independent creators and players. Find a game and meet the people behind it.", "/games");

export const revalidate = 300;

export default async function GamesPage() {
  const community = await publicGames();
  return (
    <div className="container catalogue-page">
      <div className="catalogue-intro">
        <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span> Small breaks. New worlds.</p>
        <h1>Find your kind <em>of play.</em></h1>
      </div>
      <GameDiscovery games={games} community={community} />
      <BreadcrumbData items={[{ name: "Games", path: "/games" }]} />
      <GameCollectionData name="Games on Vihar" path="/games" description="VIHAR Originals by the VIHAR team and Community Games by independent creators and players." games={[...games.map((game) => ({ title: game.title, path: `/games/${game.slug}` })), ...community.map((game) => ({ title: game.title, path: `/community/${game.id}` }))]} />
    </div>
  );
}
