import { notFound } from "next/navigation";
import { CommunityGamePage } from "@/components/community-games";
import { publicGame } from "@/lib/community-public";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await publicGame(id);
  if (!game) notFound();
  return pageMetadata(game.title, game.description.slice(0, 160), `/community/${id}`);
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await publicGame(id);
  if (!game) notFound();
  return <div className="container"><CommunityGamePage key={id} id={id} initialGame={game} /></div>;
}
