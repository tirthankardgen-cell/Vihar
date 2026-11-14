import { GameDiscovery } from "@/components/game-discovery";
import "@/app/content.css";
import { BreadcrumbData, GameCollectionData } from "@/components/structured-data";
import { publicGames } from "@/lib/community-public";
import { games } from "@/lib/games";
import { quickPlayGames } from "@/lib/quick-play";
import { pageMetadata } from "@/lib/site";

const description = "Discover free browser games, Indian board and card games, puzzles and independent games. Explore VIHAR Originals, community creators and real player reviews.";
export const metadata = pageMetadata("Browser Games, Board Games & Independent Games", description, "/games");

export const revalidate = 300;

export default async function GamesPage() {
  const community = await publicGames();
  return (
    <div className="container catalogue-page">
      <div className="catalogue-intro">
        <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span> Small breaks. New worlds.</p>
        <h1>Find your kind <em>of play.</em></h1>
        <p className="collection-description">{description}</p>
      </div>
      <GameDiscovery games={games} community={community} />
      <BreadcrumbData items={[{ name: "Games", path: "/games" }]} />
      <GameCollectionData name="Games on Vihar" path="/games" description={description} games={[...games.map((game) => ({ title: game.title, path: `/games/${game.slug}` })), ...quickPlayGames.map((game) => ({ title: game.title, path: `/games/${game.id}` })), ...community.map((game) => ({ title: game.title, path: `/community/${game.id}` }))]} />
    </div>
  );
}
