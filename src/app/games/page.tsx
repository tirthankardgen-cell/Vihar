import { GameCatalogue } from "@/components/game-catalogue";
import { Breadcrumbs, PageIntro } from "@/components/page-intro";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { games } from "@/lib/games";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata("Explore our games", "Find your next little escape. Play Bap Ka Rasta in your browser and discover what’s coming next from Vihar.", "/games");

export default function GamesPage() {
  return <div className="container catalogue-page"><Breadcrumbs items={[{ label: "Games" }]} /><PageIntro eyebrow="Small breaks. New worlds." title="Pick your next adventure." description="Take the scenic route. Try something new. There’s a little escape here with your name on it." /><GameCatalogue games={games} /><aside className="catalogue-aside"><span aria-hidden="true">✳</span><div><h2>Good things take a little play.</h2><p>We’re starting small and building thoughtfully. New worlds will find their way here when they’re ready.</p></div></aside><BreadcrumbData items={[{ name: "Games", path: "/games" }]} /><StructuredData data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Vihar games", url: `${site.url}/games`, description: "Original browser games and upcoming worlds from Vihar.", mainEntity: { "@type": "ItemList", itemListElement: games.map((game, index) => ({ "@type": "ListItem", position: index + 1, url: `${site.url}/games/${game.slug}`, name: game.title })) } }} /></div>;
}
