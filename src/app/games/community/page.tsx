import { GameDiscovery } from "@/components/game-discovery";
import { BreadcrumbData, GameCollectionData } from "@/components/structured-data";
import { publicGames } from "@/lib/community-public";
import { pageMetadata } from "@/lib/site";
import "@/app/content.css";

const description = "Discover browser and downloadable games shared by independent creators and players. Explore creator profiles, play their games, and leave ratings, reviews and feedback.";
export const metadata = pageMetadata("Community Games — Discover independent creators", description, "/games/community");
export const revalidate = 300;

export default async function CommunityPage() {
  const community = await publicGames();
  return <div className="container catalogue-page">
    <div className="catalogue-intro"><p className="eyebrow">Made to be shared</p><h1>New games.<br /><em>Meet their makers.</em></h1><p className="collection-description">{description}</p></div>
    <GameDiscovery games={[]} community={community} selected="community" />
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Community Games", path: "/games/community" }]} />
    <GameCollectionData name="Community Games" path="/games/community" description={description} games={community.map((game) => ({ title: game.title, path: `/community/${game.id}` }))} />
  </div>;
}
