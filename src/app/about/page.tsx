import Image from "next/image";
import Link from "@/components/site-link";
import { ArrowUpRight, Compass, Heart, Sparkles } from "lucide-react";
import { Emblem } from "@/components/brand";
import "@/app/content.css";
import { BreadcrumbData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Our story — A little room for wonder",
  "Meet Vihar, a home for original browser games rooted in India and open to everyone. Discover the idea behind our name, our emblem, and our approach to play.",
  "/about",
);

export default function AboutPage() {
  return (
    <>
      <div className="container">
        <section className="about-hero page-hero" aria-labelledby="about-title">
          <div>
            <p className="eyebrow"><span className="tiny-spark" aria-hidden="true">✳</span> The world of Vihar</p>
            <h1 id="about-title">A little wandering.<br /><em>A lot of possibility.</em></h1>
            <p className="lead">We’re making room for that lovely feeling of playing just because you feel like it.</p>
          </div>
          <Image src="/images/playground.webp" alt="An imagined courtyard with a play board, colourful pieces, and a kite" width={960} height={960} sizes="(max-width: 767px) 100vw, 45vw" preload />
        </section>
        <section className="editorial-section viewport-section viewport-grid" aria-labelledby="idea-title">
          <div><p className="eyebrow"><span className="section-number">01 /</span> A simple idea</p><h2 id="idea-title">Play belongs<br /><em>in the everyday.</em></h2></div>
          <div className="editorial-copy">
            <p>A quick drive after a long day. One more turn before dinner. A new world when the familiar one needs a little pause. Those small moments are where Vihar begins.</p>
            <p>We’re a home for games from Vihar and independent creators. Create an account to share your self-hosted browser or downloadable game, discover new players, and read their ratings and reviews. Some are inspired by streets and stories close to home in India. Others will wander somewhere entirely different. Each game gets its own personality; Vihar gives them a shared front door.</p>
            <p>Take a drive through familiar Indian streets in Bap Ka Rasta, or settle into the courtyard for a round of Gulam Chor with the virtual family. Two browser games, small beginnings, plenty of curiosity.</p>
            <Link href="/games" className="text-link">Find your next little escape <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>
        <section className="editorial-section viewport-section viewport-grid" aria-labelledby="name-title">
          <div><p className="eyebrow"><span className="section-number">02 /</span> What’s in a name?</p><h2 id="name-title">Room to<br /><em>roam.</em></h2></div>
          <div className="editorial-copy">
            <p>Vihar draws on the Sanskrit word vihāra, associated with wandering, recreation, and leisure. It’s a name that leaves the door open: to explore, to take your time, to see what happens next.</p>
            <p>The word also has historical religious meanings, including a residence or monastery. Our brand draws on its sense of recreation and exploration, without claiming a religious affiliation.</p>
            <p>For us, it comes back to four words: a space to play.</p>
          </div>
        </section>
        <section className="brand-story viewport-section viewport-grid" aria-labelledby="symbol-title">
          <div className="brand-story-art" aria-hidden="true"><Emblem className="brand-story-emblem" /><span>VIHAR</span></div>
          <div>
            <p className="eyebrow">A person, a place, and possibilities</p>
            <h2 id="symbol-title">Our own little <em>gateway.</em></h2>
            <p>Our emblem is a contemporary interpretation of an open architectural arch: a welcoming space around two paths. It takes inspiration from courtyards and entrances, rather than any specific sacred or historical symbol.</p>
            <dl className="brand-meaning">
              <div><dt>The V</dt><dd>Two paths meeting in one shared place.</dd></div>
              <div><dt>The arch</dt><dd>An open invitation to step into another world.</dd></div>
              <div><dt>The warm dot</dt><dd>The player, right at the heart of it all.</dd></div>
            </dl>
          </div>
        </section>
        <section className="values-grid viewport-section viewport-grid" aria-label="Our approach to making games">
          <article><Compass size={23} aria-hidden="true" /><h3>Follow the curiosity.</h3><p>Different genres, familiar details, unexpected turns. We leave room for each game to find its own way.</p></article>
          <article><Heart size={23} aria-hidden="true" /><h3>Keep it welcoming.</h3><p>Clear controls, honest descriptions, and no account needed to browse or try our current game.</p></article>
          <article><Sparkles size={23} aria-hidden="true" /><h3>Grow with care.</h3><p>We share what’s playable and label what’s still in development. New worlds arrive when they’re ready.</p></article>
        </section>
      </div>
      <section className="game-end-cta viewport-section"><div className="container"><p className="eyebrow">Rooted in India. Open to everyone.</p><h2>Make yourself <em>at home.</em></h2><Link href="/games" className="button button-dark">Explore games <ArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
      <BreadcrumbData items={[{ name: "About", path: "/about" }]} />
    </>
  );
}
