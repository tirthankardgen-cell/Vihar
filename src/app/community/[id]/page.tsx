import { notFound } from "next/navigation";
import { CommunityGamePage } from "@/components/community-games";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { publicCreator, publicGame } from "@/lib/community-public";
import { pageMetadata, site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await publicGame(id);
  if (!game) notFound();
  const creator = await publicCreator(game.ownerId);
  const metadata = pageMetadata(`${game.title} — Community Game`, game.description.slice(0, 160), `/community/${id}`);
  return { ...metadata, ...(creator ? { authors: [{ name: creator.displayName, url: `${site.url}/u/${creator.username}` }], creator: creator.displayName } : {}), ...(game.coverUrl ? { openGraph: { ...metadata.openGraph, images: [{ url: game.coverUrl, alt: `${game.title} — Community Game` }] }, twitter: { ...metadata.twitter, images: [game.coverUrl] } } : {}) };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await publicGame(id);
  if (!game) notFound();
  const creator = await publicCreator(game.ownerId);
  return <div className="container"><CommunityGamePage key={id} id={id} initialGame={game} initialCreator={creator} />
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Community Games", path: "/games/community" }, { name: game.title, path: `/community/${id}` }]} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "VideoGame", "@id": `${site.url}/community/${id}#game`, name: game.title, description: game.description, url: `${site.url}/community/${id}`, ...(game.coverUrl ? { image: game.coverUrl } : {}), genre: game.genre || undefined, gamePlatform: game.kind === "browser" ? "Web browser" : undefined, ...(creator ? { publisher: { "@type": "Person", name: creator.displayName, url: `${site.url}/u/${creator.username}` } } : {}), subjectOf: { "@type": "WebPage", url: `${site.url}/community/${id}`, isPartOf: { "@id": `${site.url}/#website` } } }} />
  </div>;
}
