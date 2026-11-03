import { CommunityGamePage } from "@/components/community-games";
import { publicGame } from "@/lib/community-public";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await publicGame(id);
  return game ? pageMetadata(game.title, game.description.slice(0, 160), `/community/${id}`) : { title: "Game unavailable", robots: { index: false, follow: false } };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await publicGame(id);
  return <div className="container"><CommunityGamePage key={id} id={id} initialGame={game} /></div>;
}
