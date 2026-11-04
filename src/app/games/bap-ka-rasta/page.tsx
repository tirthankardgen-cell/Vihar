import { OfficialGameReviews, OfficialPlayLink } from "@/components/game-reviews";
import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowRight, ArrowUpRight, Check, Gamepad2, Keyboard, LockKeyhole, MapPin, Monitor, Play, SlidersHorizontal, Smartphone } from "lucide-react";
import "@/app/content.css";
import { GameGallery } from "@/components/game-gallery";
import { VehicleShowcase } from "@/components/vehicle-showcase";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { gameImages, galleryPath } from "@/lib/game-images";
import { characters, cities, galleryImages, gameplayImages } from "@/lib/game-showcase";
import { featuredGame } from "@/lib/games";
import { categoryLabel } from "@/lib/game-categories";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata("Bap Ka Rasta — Free-roaming driving game", "Explore familiar Indian streets at your own pace in Bap Ka Rasta, a free-roaming browser driving game. Discover the updated map, city concepts and different rides.", "/games/bap-ka-rasta", "/images/social-bap-ka-rasta.png");

const controls = [
  ["Accelerate", "W / ↑"], ["Brake / reverse", "S / ↓"], ["Steer", "A D / ← →"],
  ["Handbrake", "Space"], ["Select gear", "1–4"], ["Horn", "H"],
  ["Camera", "C"], ["Reset to road", "R"], ["Pause", "Esc / P"],
];
const mainCast = characters.filter((character) => ["sachin", "raju", "meera", "patil"].includes(character.id));

function PlayLink({ label = "Play now" }: { label?: string }) {
  return <OfficialPlayLink id={featuredGame.slug} className="bkr-play-button"><Play size={16} fill="currentColor" aria-hidden="true" />{label}<ArrowUpRight size={19} aria-hidden="true" /><span className="sr-only">, opens Bap Ka Rasta in a new tab</span></OfficialPlayLink>;
}

export default function BapKaRastaPage() {
  return <div className="bkr-page">
    <div className="container bkr-opening">
      <section className="bkr-hero" aria-labelledby="bkr-title">
        <div className="bkr-hero-art">
          <Image src={featuredGame.artwork} alt={featuredGame.artworkAlt} fill sizes="(max-width: 767px) 100vw, 75vw" preload />
          <span className="bkr-hero-art-label">Concept artwork</span>
          <div className="bkr-hero-location"><MapPin size={16} aria-hidden="true" /><span>Mumbai<small>Your first stop.</small></span></div>
        </div>
        <div className="bkr-hero-copy">
          <span className="bkr-badge bkr-hero-status"><span className="status-dot" aria-hidden="true" />Early playable build</span>
          <Image src="/brand/bap-ka-rasta/br-mark.svg" alt="Bap Ka Rasta official BR logo" width={56} height={56} />
          <h1 id="bkr-title">Bap Ka<br /><span>Rasta.</span></h1>
          <p>Apna sheher. Apni sawaari.<br />Apna rasta.</p>
          <div className="bkr-hero-meta"><span><Monitor size={15} aria-hidden="true" />Browser</span><nav aria-label="Game categories"><Gamepad2 size={16} aria-hidden="true" />{featuredGame.categories.slice(0, 2).map((category) => <Link key={category} href={`/games?category=${category}`}>{categoryLabel(category)}</Link>)}</nav></div>
          <div className="bkr-hero-launch"><PlayLink /><span>Free to play · No account · Opens a new tab</span></div>
        </div>
      </section>
      <nav className="bkr-jump-nav" aria-label="Explore Bap Ka Rasta"><span>Take a look around</span><Link href="#rides">The rides</Link><Link href="#cities">The cities</Link><Link href="#characters">The people</Link><Link href="#gameplay">Gameplay</Link><Link href="#controls">Controls <ArrowRight size={14} aria-hidden="true" /></Link></nav>
    </div>

    <section className="container bkr-panel viewport-section" id="rides" aria-labelledby="rides-title">
      <div className="bkr-section-heading"><div><p className="eyebrow">01 / The garage</p><h2 id="rides-title">Pick your kind of <span>swag.</span></h2></div><p>13 original vehicle models. Find your kind of ride.</p></div>
      <VehicleShowcase playUrl={featuredGame.playUrl} />
      <p className="bkr-section-note">Scroll the garage to explore all 13 models from the game’s vehicle library. Each card shows player availability; the full line-up appears in city traffic.</p>
    </section>

    <section className="container bkr-panel viewport-section" id="cities" aria-labelledby="cities-title">
      <div className="bkr-section-heading"><div><p className="eyebrow">02 / Same roads. Different stories.</p><h2 id="cities-title">Next stop: <span>somewhere good.</span></h2></div><p>Cities you know. Streets to rediscover.</p></div>
      <div className="bkr-city-grid">{cities.map((city) => <figure key={city.id} className={`bkr-city-card ${city.playable ? "bkr-city-featured" : ""}`}>
        <Image src={city.src} alt={city.alt} width={city.id === "mumbai" ? 498 : 768} height={city.id === "mumbai" ? 344 : 512} sizes={city.playable ? "(max-width: 767px) 100vw, 45vw" : "(max-width: 767px) 50vw, 25vw"} />
        <span className={`bkr-badge ${city.playable ? "bkr-badge-playable" : "bkr-badge-soon"}`}>{city.playable ? <Check size={12} aria-hidden="true" /> : <LockKeyhole size={11} aria-hidden="true" />}{city.playable ? "Playable now" : "Coming soon"}</span>
        <figcaption><span>{city.landmark}</span><h3>{city.name}</h3>{city.playable && <p>{city.line}</p>}</figcaption>
      </figure>)}</div>
      <div className="bkr-section-footer"><p className="bkr-section-note">City concept art · The playable streets are inspired by Mumbai.</p><Link href={galleryPath} className="bkr-text-link">Explore the world &amp; map <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
    </section>

    <section className="container bkr-panel" aria-labelledby="posters-title">
      <div className="bkr-section-heading"><div><p className="eyebrow">The world of Bap Ka Rasta</p><h2 id="posters-title">Your city. <span>Your own way.</span></h2></div><p>Familiar faces, different rides, and room to roam.</p></div>
      <div className="bkr-poster-showcase"><GameGallery items={galleryImages.filter((item) => ["01-free-roam-launch", "02-meet-the-vehicles", "03-meet-the-mohalla"].includes(item.slug))} compact /></div>
    </section>

    <div className="bkr-people-block">
      <section className="container bkr-panel viewport-section" id="characters" aria-labelledby="characters-title">
        <div className="bkr-section-heading"><div><p className="eyebrow">03 / A city with company</p><h2 id="characters-title">Meet the <span>mohalla.</span></h2></div><Link href={galleryPath} className="bkr-text-link">See the full cast <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        <div className="bkr-character-grid">{mainCast.map((character) => <figure key={character.id}><Image src={character.src} alt={character.alt} width={384} height={460} sizes="(max-width: 767px) 45vw, 25vw" /><figcaption><h3>{character.name}</h3><p>{character.role}</p></figcaption></figure>)}</div>
        <p className="bkr-section-note">Actual 3D characters · Street chatter, chai stops, and familiar faces around Mumbai.</p>
      </section>
    </div>

    <section className="container bkr-panel viewport-section" id="gameplay" aria-labelledby="gameplay-title">
      <div className="bkr-section-heading"><div><p className="eyebrow">04 / Inside the game</p><h2 id="gameplay-title">Street-level <span>freedom.</span></h2></div><Link href={galleryPath} className="bkr-text-link">All {galleryImages.length} images &amp; map <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      <GameGallery items={galleryImages.filter((item) => ["updated-city", "mumbai-chowk", "playable-map"].includes(item.slug))} compact />
      <GameGallery items={gameplayImages} compact />
      <div className="bkr-section-footer"><p className="bkr-section-note">Updated gameplay captures · Two camera views. Earlier conversation capture labelled in the gallery.</p><Link href={galleryPath} className="bkr-text-link">Open the gallery <ArrowRight size={15} aria-hidden="true" /></Link></div>
    </section>

    <section className="container bkr-panel bkr-controls-panel viewport-section" id="controls" aria-labelledby="controls-title">
      <div className="bkr-section-heading"><div><p className="eyebrow">05 / Meter down. Tension down.</p><h2 id="controls-title">Get in. <span>Head out.</span></h2></div><Link href="/guides/bap-ka-rasta-first-drive" className="bkr-text-link">First-drive guide <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      <div className="bkr-ready-grid">
        <div className="bkr-keyboard"><h3><Keyboard size={20} aria-hidden="true" />Your keys to the city</h3><dl className="bkr-controls-list">{controls.map(([action, key]) => <div key={action}><dt>{action}</dt><dd><kbd>{key}</kbd></dd></div>)}</dl><p>Keep holding brake after stopping to reverse.</p></div>
        <div className="bkr-device-notes"><div><Smartphone size={22} aria-hidden="true" /><div><h3>Phone? Ready to drive.</h3><p>Automatic landscape, touch steering and pedals.</p></div></div><div><Monitor size={22} aria-hidden="true" /><div><h3>A modern browser.</h3><p>WebGL 2 and hardware acceleration on.</p></div></div><div><SlidersHorizontal size={22} aria-hidden="true" /><div><h3>Make it your ride.</h3><p>Low graphics and sound settings in Pause.</p></div></div></div>
      </div>
      <div className="bkr-ready-bar"><div><h3>Your next detour is waiting.</h3><p>No account. No download. Just a little detour.</p></div><PlayLink label="Let’s drive" /></div>
      <div className="bkr-section-footer"><p className="bkr-section-note">Early build · Single player · No saved progress</p><a href="https://github.com/tirthankardgen-cell/Bap-Ka-Rasta/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="bkr-text-link">Build notes <ArrowUpRight size={14} aria-hidden="true" /><span className="sr-only"> on GitHub, opens in a new tab</span></a></div>
    </section>

    <section className="container bkr-panel"><OfficialGameReviews id="bap-ka-rasta" /></section>
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Bap Ka Rasta", path: "/games/bap-ka-rasta" }]} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "VideoGame", name: "Bap Ka Rasta", description: "A single-player free-roaming browser driving game inspired by familiar Indian cities. Start with the playable Mumbai streets and explore concepts for more cities and rides.", url: `${site.url}/games/bap-ka-rasta`, image: `${site.url}/images/social-bap-ka-rasta.png`, screenshot: gameImages.map((image) => site.url + image.src), gamePlatform: "Web browser", operatingSystem: "Web browser with WebGL 2", genre: ["Driving", "Exploration"], playMode: "SinglePlayer", inLanguage: "en", publisher: { "@id": `${site.url}/#organization` }, sameAs: featuredGame.playUrl }} />
  </div>;
}
