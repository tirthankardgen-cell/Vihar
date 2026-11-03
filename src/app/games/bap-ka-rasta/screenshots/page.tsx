import Link from "@/components/site-link";
import { ArrowLeft, ArrowUpRight, Play } from "lucide-react";
import "@/app/content.css";
import { GameGallery } from "@/components/game-gallery";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { galleryPath } from "@/lib/game-images";
import { galleryImages } from "@/lib/game-showcase";
import { featuredGame } from "@/lib/games";
import { pageMetadata, site } from "@/lib/site";

const title = "Bap Ka Rasta screenshots, rides, cities & characters";
const description = "Explore Bap Ka Rasta in pictures: free-roaming branding, the updated road map, city renders, characters, gameplay and upcoming cities and rides.";
export const metadata = pageMetadata(title, description, galleryPath, "/images/social-bap-ka-rasta.png");

export default function ScreenshotsPage() {
  return <div className="bkr-page bkr-media-page container">
    <header className="bkr-media-intro"><div><Link href="/games/bap-ka-rasta" className="bkr-text-link"><ArrowLeft size={15} aria-hidden="true" />Back to the game</Link><h1>A look <span>around.</span></h1><p>The streets, the sawaaris, and the people who make the city.</p></div><a href={featuredGame.playUrl} target="_blank" rel="noopener noreferrer" className="bkr-play-button"><Play size={15} fill="currentColor" aria-hidden="true" />Play now<ArrowUpRight size={18} aria-hidden="true" /><span className="sr-only">, opens Bap Ka Rasta in a new tab</span></a></header>
    <GameGallery items={galleryImages} preloadFirst />
    <p className="bkr-gallery-note">Explore the growing world of Bap Ka Rasta. Upcoming cities and rides, world renders, and earlier-build gameplay are labelled separately.</p>
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Bap Ka Rasta", path: "/games/bap-ka-rasta" }, { name: "Gallery", path: galleryPath }]} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ImageGallery", name: title, description, url: site.url + galleryPath, about: { "@type": "VideoGame", name: "Bap Ka Rasta", url: site.url + "/games/bap-ka-rasta" }, image: galleryImages.map((item) => ({ "@type": "ImageObject", contentUrl: site.url + item.src, url: site.url + galleryPath + "#" + item.slug, name: item.title, description: item.alt, caption: item.caption, width: item.width, height: item.height })) }} />
  </div>;
}
