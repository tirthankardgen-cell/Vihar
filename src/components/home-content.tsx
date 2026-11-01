import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowRight, ArrowUpRight, Monitor, Play, Sparkles } from "lucide-react";
import { DiscoveryFaq } from "@/components/discovery-faq";
import { GameCard } from "@/components/game-card";
import { GameCategories } from "@/components/game-categories";
import { featuredGame, games } from "@/lib/games";
import { categoryLabel } from "@/lib/game-categories";

// Shared sections let the hero preview use the real homepage content.
export function HomeContent() {
  return (
    <>
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
              <div><p className="eyebrow featured-genre">{featuredGame.categories.slice(0, 2).map(categoryLabel).join(" · ")}</p><h2 id="featured-title">Bap Ka<br /><em>Rasta.</em></h2></div>
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
          <GameCategories showAll={false} />
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
