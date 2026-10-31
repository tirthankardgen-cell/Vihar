import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs, PageIntro } from "@/components/page-intro";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { gameImages, galleryPath } from "@/lib/game-images";
import { pageMetadata, site } from "@/lib/site";

const title = "Bap Ka Rasta screenshots & playable map";
const description = "Explore actual Bap Ka Rasta gameplay images: Mumbai seafront driving, the auto-rickshaw driver camera, street dialogue and the fictional playable road map.";
export const metadata = pageMetadata(title, description, galleryPath, "/images/social-bap-ka-rasta.png");

export default function ScreenshotsPage() {
  return <div className="container gallery-page">
    <Breadcrumbs items={[{ label: "Games", href: "/games" }, { label: "Bap Ka Rasta", href: "/games/bap-ka-rasta" }, { label: "Screenshots & map" }]} />
    <PageIntro eyebrow="Inside the playable world" title="A few views from the road." description={description} />
    {gameImages.map((item, index) => <section key={item.slug} id={item.slug} className="gallery-section viewport-section" aria-labelledby={item.slug + "-title"}>
      <figure>
        <a href={item.src} aria-label={`Open full-size image: ${item.title}`}><Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 767px) 100vw, 65vw" /></a>
        <figcaption>{item.caption}</figcaption>
      </figure>
      <div><p className="eyebrow">{String(index + 1).padStart(2, "0")} / Early playable build</p><h2 id={item.slug + "-title"}>{item.title}</h2><a className="text-link" href={item.src}>View full-size image <ArrowUpRight size={17} aria-hidden="true" /></a></div>
    </section>)}
    <section className="gallery-next viewport-section"><p className="eyebrow">Ready to explore?</p><h2>Find your own <em>little detour.</em></h2><div><Link href="/games/bap-ka-rasta" className="button button-dark">About the game <ArrowUpRight size={17} aria-hidden="true" /></Link><Link href="/guides/bap-ka-rasta-first-drive" className="text-link">Read the first-drive guide <ArrowUpRight size={17} aria-hidden="true" /></Link></div></section>
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Bap Ka Rasta", path: "/games/bap-ka-rasta" }, { name: "Screenshots & map", path: galleryPath }]} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ImageGallery", name: title, description, url: site.url + galleryPath, about: { "@type": "VideoGame", name: "Bap Ka Rasta", url: site.url + "/games/bap-ka-rasta" }, image: gameImages.map((item) => ({ "@type": "ImageObject", contentUrl: site.url + item.src, url: site.url + galleryPath + "#" + item.slug, name: item.title, description: item.alt, caption: item.caption, width: item.width, height: item.height })) }} />
  </div>;
}
