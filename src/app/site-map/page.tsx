import { OfficialPlayLink } from "@/components/official-play-link";
import { publicGames } from "@/lib/community-public";
import Link from "@/components/site-link";
import { PageIntro } from "@/components/page-intro";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { siteDirectory } from "@/lib/site-directory";
import { pageMetadata, site } from "@/lib/site";
import "./site-map.css";

export const metadata = pageMetadata("Site map — Explore Vihar", "Find Vihar’s games, screenshots, driving guides, FAQs, story, contact and legal pages in one place.", "/site-map");

export const revalidate = 300;

export default async function SiteMapPage() {
  const community = await publicGames();
  return <div className="container catalogue-page site-map-page">
    <PageIntro eyebrow="Find your way" title="A little map of Vihar." description="Games, guides and the details you need. Pick a place to explore." />
    <nav aria-label="All public pages">
      <ul className="site-map-grid">{siteDirectory.map((page) => <li key={page.path}><Link className="site-map-link" href={page.path}>{page.name}</Link><p>{page.description}</p></li>)}</ul>
    </nav>
    <section className="site-map-resources" aria-labelledby="mumbai-resources">
      <h2 id="mumbai-resources">Into Mumbai</h2>
      <ul className="site-map-grid"><li><OfficialPlayLink className="site-map-link" id="bap-ka-rasta">Play Bap Ka Rasta ↗</OfficialPlayLink><p>Free-roam driving in your browser.</p></li><li><a className="site-map-link" href={new URL("/guide.html", site.gameUrl).href}>Game world and controls ↗</a><p>Explore the current cities, vehicles, characters, landmarks and audio credits.</p></li></ul>
    </section>
    <section className="site-map-resources"><h2>Into the baithak</h2><ul className="site-map-grid"><li><OfficialPlayLink className="site-map-link" id="gulam-chor">Play Gulam Chor ↗</OfficialPlayLink><p>A family card game with virtual players, free in your browser.</p></li><li><Link className="site-map-link" href="/games/gulam-chor#gc-rules">Gulam Chor house rules</Link><p>Learn to make pairs, draw cards and avoid the unmatched Jack.</p></li></ul></section>
    <section className="site-map-resources"><h2>Community &amp; creators</h2><ul className="site-map-grid"><li><Link href="/dashboard/publish">Share your game</Link></li><li><a href={site.instagram}>Instagram · @vihar.world ↗</a></li><li><a href="/sitemap.xml">XML sitemap</a></li>{community.map((game) => <li key={game.id}><Link href={`/community/${game.id}`}>{game.title}</Link></li>)}</ul></section>
    <BreadcrumbData items={[{ name: "Site map", path: "/site-map" }]} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Vihar site map", url: site.url + "/site-map", mainEntity: { "@type": "ItemList", itemListElement: siteDirectory.map((page, index) => ({ "@type": "ListItem", position: index + 1, name: page.name, url: site.url + page.path })) } }} />
  </div>;
}
