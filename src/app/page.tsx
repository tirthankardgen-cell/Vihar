import { DiscoveryFaq } from "@/components/discovery-faq";
import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowDown, ArrowRight, ArrowUpRight, Compass, Monitor, Play, Sparkles } from "lucide-react";
import { GameCard } from "@/components/game-card";
import { StructuredData } from "@/components/structured-data";
import { featuredGame, games } from "@/lib/games";
import { site } from "@/lib/site";
import "./home.css";
import courtyardAvif480 from "../../public/images/courtyard-480.avif";
import courtyardAvif768 from "../../public/images/courtyard-768.avif";
import courtyardAvif1100 from "../../public/images/courtyard-1100.avif";
import courtyardWebp480 from "../../public/images/courtyard-480.webp";
import courtyardWebp768 from "../../public/images/courtyard-768.webp";
import courtyardWebp1100 from "../../public/images/courtyard-1100.webp";

const courtyardSizes = "(max-width: 519px) calc(100vw - 40px), (max-width: 767px) 480px, (max-width: 1376px) calc(53vw + 6px), (max-width: 1599px) 735px, 764px";
const courtyardAvifSrcSet = `${courtyardAvif480.src} 480w, ${courtyardAvif768.src} 768w, ${courtyardAvif1100.src} 1100w`;

export default function Home() {
  return (
    <>
      <link rel="preload" as="image" type="image/avif" imageSrcSet={courtyardAvifSrcSet} imageSizes={courtyardSizes} fetchPriority="high" />
      <StructuredData data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: "Vihar", description: site.description, inLanguage: "en", publisher: { "@id": `${site.url}/#organization` } }} />
      <section className="hero viewport-section" aria-labelledby="hero-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span> A little room for wonder</p>
            <h1 id="hero-title">A space<br />to <em>play.</em></h1>
            <p className="hero-description">Original browser games. Different worlds.<br />No download. Find your next little escape.</p>
            <div className="hero-actions">
              <Link href="/games" className="button button-dark">Explore games <ArrowUpRight size={18} aria-hidden="true" /></Link>
              <a href="#featured" className="hero-scroll" aria-label="Discover our featured game"><ArrowDown size={17} aria-hidden="true" /></a>
            </div>
            <p className="hero-footnote"><span aria-hidden="true" />No sign-up. Just show up and play.</p>
          </div>
          <div className="hero-art">
            <picture>
              <source type="image/avif" srcSet={courtyardAvifSrcSet} sizes={courtyardSizes} />
              {/* Pre-encoded responsive assets use hashed, immutable URLs without a conversion request. */}
              <img src={courtyardWebp1100.src} srcSet={`${courtyardWebp480.src} 480w, ${courtyardWebp768.src} 768w, ${courtyardWebp1100.src} 1100w`} sizes={courtyardSizes} alt="An imagined courtyard with a welcoming arch, a winding path, a kite and a terracotta sun" width={1100} height={1100} loading="eager" fetchPriority="high" decoding="sync" className="courtyard-image" />
            </picture>
            <div className="art-caption"><span className="caption-line" aria-hidden="true" /><span>A world outside the everyday.</span></div>
          </div>
        </div>
        <div className="container hero-bottom"><span>Rooted in India. Open to everyone.</span><span className="hero-bottom-right">Good things happen when you wander. <Compass size={16} aria-hidden="true" /></span></div>
      </section>

      <section className="section featured-section viewport-section" id="featured" aria-labelledby="featured-title">
        <div className="container">
          <div className="section-heading"><p className="eyebrow"><span className="section-number">01 /</span> In the spotlight</p><span className="quiet-note">A little escape, ready when you are.</span></div>
          <div className="featured-card">
            <Link href="/games/bap-ka-rasta" className="featured-visual" aria-label="Discover Bap Ka Rasta. Mumbai, with a little imagination. Concept artwork.">
              <Image src={featuredGame.artwork} alt={featuredGame.artworkAlt} fill sizes="(max-width: 767px) calc(100vw - 42px), (max-width: 1376px) 52vw, 700px" />
              <span className="featured-location"><span aria-hidden="true">↗</span> Mumbai, with a little imagination.</span>
              <span className="artwork-label">Concept artwork</span>
            </Link>
            <div className="featured-copy">
              <span className="status-badge status-available"><span className="status-dot" aria-hidden="true" />Playable now</span>
              <div><p className="eyebrow featured-genre">Driving · Exploration</p><h2 id="featured-title">Bap Ka<br /><em>Rasta.</em></h2></div>
              <p>Your auto. Your city. Your own sweet time. Weave through Mumbai-inspired streets and see where the road takes you.</p>
              <p className="hinglish">Apna sheher. Apni sawaari. Apna rasta.</p>
              <div className="featured-actions"><a href={featuredGame.playUrl} target="_blank" rel="noopener noreferrer" className="button button-dark"><Play size={14} fill="currentColor" aria-hidden="true" />Play now<span className="sr-only"> — opens Bap Ka Rasta in a new tab</span><ArrowUpRight size={17} aria-hidden="true" /></a><Link href="/games/bap-ka-rasta" className="text-link">Meet the game <ArrowRight size={16} aria-hidden="true" /></Link></div>
              <div className="featured-details"><span><Monitor size={14} aria-hidden="true" />Browser</span><span>Single player</span><span>Early build</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section collection-section viewport-section" aria-labelledby="collection-title">
        <div className="container">
          <div className="section-title-row"><div><p className="eyebrow"><span className="section-number">02 /</span> Pick your next adventure</p><h2 id="collection-title">Different worlds.<br /><em>Same curiosity.</em></h2></div><Link href="/games" className="text-link">View all games <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
          <div className="game-grid">{games.map((game) => <GameCard key={game.slug} game={game} />)}</div>
          <p className="collection-note"><Sparkles size={16} aria-hidden="true" /> A small collection, growing with a little imagination.</p>
        </div>
      </section>

      <section className="world-section viewport-section" aria-labelledby="world-title">
        <div className="container world-inner">
          <div className="world-art"><Image src="/images/playground.webp" alt="An original illustration of a courtyard play board, a kite and colourful game pieces" width={960} height={960} sizes="(max-width: 767px) 100vw, 45vw" /></div>
          <div className="world-copy"><p className="eyebrow"><span className="section-number">03 /</span> The world of Vihar</p><h2 id="world-title">A little wandering.<br /><em>A lot of possibility.</em></h2><p>Remember playing just for the joy of it? No grand plan. No perfect score. Just one more turn before heading home.</p><p>That’s the feeling we’re making room for. Vihar is a home for original games, familiar little details, and worlds worth getting a little lost in.</p><Link href="/about" className="text-link">A little about us <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="section container guide-preview viewport-section" aria-labelledby="play-guide-title"><div><p className="eyebrow">Before your first turn</p><h2 id="play-guide-title">A little guide<br />to the <em>streets.</em></h2><p className="page-description">Start with a low gear, learn the two cameras, and find your way from an open avenue into a smaller lane. Our Bap Ka Rasta guide covers a first drive, recovering from collisions, and adjusting the game for your device.</p><Link href="/guides/bap-ka-rasta-first-drive" className="text-link">Read the first-drive guide <ArrowRight size={16} aria-hidden="true" /></Link></div><figure><Image src="/images/bap-ka-rasta-gameplay.webp" alt="An auto rickshaw driving through the playable Mumbai-inspired streets in Bap Ka Rasta" width={1440} height={900} sizes="(max-width: 767px) 100vw, 50vw" /><figcaption>Actual browser gameplay · Bap Ka Rasta</figcaption></figure></section>

      <div className="section container viewport-section"><DiscoveryFaq featured /></div>

      <section className="closing-section viewport-section"><div className="container closing-inner"><span className="closing-spark" aria-hidden="true">✳</span><p>Nothing to finish. Nowhere to rush.</p><h2>Shall we <em>play?</em></h2><Link href="/games" className="button button-dark">Find your little escape <ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
    </>
  );
}
