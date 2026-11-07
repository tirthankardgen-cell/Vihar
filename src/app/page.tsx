import { HomeContent } from "@/components/home-content";
import PerspectiveTunnelHero from "@/components/ui/perspective-tunnel-hero";
import { StructuredData } from "@/components/structured-data";
import { site } from "@/lib/site";
import "./home.css";

export default function Home() {
  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: "Vihar", description: site.description, inLanguage: "en", publisher: { "@id": `${site.url}/#organization` } }} />
      <PerspectiveTunnelHero />
      <HomeContent />
    </>
  );
}
