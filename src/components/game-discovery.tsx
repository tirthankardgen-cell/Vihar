import "@/app/discovery.css";
import { ArrowUpRight } from "lucide-react";
import Link from "@/components/site-link";
import { CommunityGames } from "@/components/community-games";
import { CommunityHighlights } from "@/components/community-highlights";
import { GameCatalogue } from "@/components/game-catalogue";
import { GameCollections, type CollectionFilter } from "@/components/game-collections";
import type { Game } from "@/lib/games";
import type { CommunityGame } from "@/lib/community";

export function GameDiscovery({ games, community, selected = "all" }: { games: Game[]; community: CommunityGame[]; selected?: CollectionFilter }) {
  return <>
    <GameCollections selected={selected} />
    {selected !== "originals" && <CommunityHighlights initialGames={community} originals={games} recommendations={selected === "all"} />}
    {selected === "community" && <CommunityGames initialGames={community} />}
    {selected === "originals" && <section className="originals-catalogue" aria-label="Browse VIHAR Originals"><GameCatalogue games={games} /></section>}
    {selected === "all" && <section className="discovery-publish"><div><p className="eyebrow">For the worlds you’re building</p><h2>Your game. <em>Its next players.</em></h2><p>Publish a game, build your creator profile, and hear what players think.</p></div><Link href="/dashboard/publish" className="button button-dark">Share your game <ArrowUpRight size={17} aria-hidden="true" /></Link></section>}
  </>;
}
