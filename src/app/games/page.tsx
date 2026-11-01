import { GameCatalogue } from "@/components/game-catalogue";
import "@/app/content.css";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { games } from "@/lib/games";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata("Explore our games", "Find your kind of play. Browse Vihar’s growing collection by category, search for a game, or see what’s playable now and coming next.", "/games");

export default function GamesPage() {
  return (
    <div className="container catalogue-page">
      <div className="catalogue-intro">
        <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span> Small breaks. New worlds.</p>
        <h1>Find your kind <em>of play.</em></h1>
      </div>
      <section className="catalogue-panel" aria-label="Browse games"><GameCatalogue games={games} /></section>
      <BreadcrumbData items={[{ name: "Games", path: "/games" }]} />
      <StructuredData data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Vihar games", url: `${site.url}/games`, description: "Original browser games and upcoming worlds from Vihar.", mainEntity: { "@type": "ItemList", itemListElement: games.map((game, index) => ({ "@type": "ListItem", position: index + 1, url: `${site.url}/games/${game.slug}`, name: game.title })) } }} />
    </div>
  );
}
