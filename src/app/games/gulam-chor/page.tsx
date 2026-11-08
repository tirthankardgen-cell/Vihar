import { OfficialGameReviews, OfficialPlayLink } from "@/components/game-reviews";
import Image from "next/image";
import { ViharAttribution } from "@/components/game-origin";
import Link from "@/components/site-link";
import { ArrowLeft, ArrowUpRight, Coffee, Spade } from "lucide-react";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { gulamFamily, gulamScreenshots } from "@/lib/gulam-chor";
import { pageMetadata, site } from "@/lib/site";
import "./gulam-chor.css";

const description = "Make a pair. Pick a card. Keep a straight face. Play Gulam Chor, the classic Indian family card game, in an illustrated courtyard with the virtual family. Free in your browser.";
export const metadata = pageMetadata("Gulam Chor — Play the family card game", description, "/games/gulam-chor", "/images/social-gulam-chor.png");

export default function GulamChorPage() {
  return (
    <div className="gc-page">
      <section className="gc-hero" aria-labelledby="gc-title">
        <Image className="gc-courtyard" src="/images/gulam-chor/courtyard.svg" alt="" fill preload sizes="100vw" />
        <div className="gc-hero-shade" />
        <div className="gc-hero-top">
          <Link href="/games/originals" className="gc-back"><ArrowLeft size={15} aria-hidden="true" />VIHAR Originals</Link>
          <span className="gc-live"><span aria-hidden="true" />Playable now</span>
        </div>
        <div className="gc-hero-copy">
          <Image src="/images/gulam-chor/logo.svg" alt="Gulam Chor card emblem" width={48} height={58} />
          <ViharAttribution />
          <p className="gc-eyebrow">The great Indian family game</p>
          <h1 id="gc-title" lang="hi"><span>गुलाम</span><span>चोर<span className="gc-title-dot">.</span></span><span className="sr-only" lang="en">Gulam Chor</span></h1>
          <p className="gc-roman">Gulam Chor</p>
          <p className="gc-hindi" lang="hi">वही पुराने पत्ते। वही अपनों की बैठक।</p>
          <p className="gc-tagline">Make a pair. Pick a card. Keep a straight face.</p>
          <OfficialPlayLink id="gulam-chor" className="gc-play">
            <Spade size={27} fill="currentColor" aria-hidden="true" />
            <span>Come, play a round<small lang="hi">आओ, एक बाज़ी हो जाए</small></span>
            <ArrowUpRight size={22} aria-hidden="true" /><span className="sr-only"> — play Gulam Chor in a new tab</span>
          </OfficialPlayLink>
          <p className="gc-preview">A playable preview · You &amp; the virtual family</p>
          <a className="gc-review-link" href="#reviews-gulam-chor">★ Played already? Rate & review ↓</a>
        </div>
        <div className="gc-hero-footer"><span><Coffee size={16} aria-hidden="true" />Best served with chai.</span><p>2–6 seats <i>✦</i> 51 cards <i>✦</i> One unlucky Jack</p><span lang="hi">बस, गुलाम तुम्हारे पास न रह जाए।</span></div>
      </section>
      <section className="gc-section gc-intro" aria-labelledby="gc-baithak">
        <div><p className="gc-eyebrow">A little luck. A lot of apne.</p><h2 id="gc-baithak">Your place in<br /><em>the baithak.</em></h2><p>A familiar courtyard, a cup of chai, and one mischievous Jack. Settle in for the card game we grew up with, brought to your browser with an illustrated family and a table full of little chances.</p><p>Choose anywhere from two to six seats. You take one; the virtual family takes the others. Pairs leave the table automatically. All you need is a little luck and a straight face.</p><a href="#gc-rules" className="gc-text-link">Learn the house rules <span aria-hidden="true">↓</span></a></div>
        <figure className="gc-table-preview"><Image src={gulamScreenshots[0].src} alt={gulamScreenshots[0].alt} width={1280} height={720} sizes="(max-width: 767px) 90vw, 55vw" /><figcaption>Actual browser gameplay · The evening baithak</figcaption></figure>
      </section>
      <section className="gc-section gc-family-section" aria-labelledby="gc-family-title">
        <p className="gc-eyebrow">Same table. Familiar faces.</p><h2 id="gc-family-title">Meet <em>the apne.</em></h2><p className="gc-section-lede">Your virtual company for one more round.</p>
        <ul className="gc-family">{gulamFamily.map((person) => <li key={person.id}><Image src={`/images/gulam-chor/${person.id}.svg`} alt={person.alt} width={140} height={140} /><h3>{person.name} <span lang="hi">{person.hindi}</span></h3><p>{person.role}</p></li>)}</ul>
      </section>
      <section className="gc-section gc-rules-section" id="gc-rules" aria-labelledby="gc-rules-title">
        <div className="gc-rules-heading"><p className="gc-eyebrow" lang="hi">नियम छोटे हैं। मज़ा बहुत है।</p><h2 id="gc-rules-title">Small rules.<br /><em>One more round.</em></h2><Image src="/images/gulam-chor/jack.svg" alt="The game's illustrated mischievous Jack" width={130} height={170} /></div>
        <ol className="gc-rules">
          <li><span>01</span><div><h3>One Jack sits this one out.</h3><p>One Jack is removed face down. The other 51 cards are dealt between 2–6 seats.</p></div></li>
          <li><span>02</span><div><h3>Pairs leave together.</h3><p>Two cards of the same rank make a pair. Suits and colours don’t matter; your pairs are put away automatically.</p></div></li>
          <li><span>03</span><div><h3>Take a little chance.</h3><p>Choose a hidden card from the next active player on your left. Play moves anticlockwise. A new pair goes away; otherwise, keep the card.</p></div></li>
          <li><span>04</span><div><h3>Empty hands. Happy hearts.</h3><p>No cards left? You’re safe. The last player holding the unmatched Jack is the Gulam Chor.</p></div></li>
        </ol>
      </section>
      <section className="gc-section" aria-labelledby="gc-gallery-title">
        <p className="gc-eyebrow">A peek at the table</p><h2 id="gc-gallery-title">The game, <em>in play.</em></h2>
        <div className="gc-gallery">{gulamScreenshots.map((shot) => <figure key={shot.src}><a href={shot.src} target="_blank" rel="noopener noreferrer" aria-label={`Open ${shot.title} screenshot in a new tab`}><Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes={shot.width < 500 ? "(max-width: 767px) 70vw, 25vw" : "(max-width: 767px) 90vw, 65vw"} /></a><figcaption><strong>{shot.title}</strong><span>{shot.caption}</span></figcaption></figure>)}</div>
      </section>
      <section className="gc-section gc-play-notes" aria-labelledby="gc-before-play">
        <div><p className="gc-eyebrow">Make yourself at home</p><h2 id="gc-before-play">A browser.<br /><em>A little free time.</em></h2></div>
        <div><h3>Click, or tap.</h3><p>Pick a face-down card when it’s your turn. On a phone, tap to draw. Use Table settings to choose 2–6 seats and a leisurely or quicker round.</p><h3>No download. No account needed.</h3><p>Play opens on <OfficialPlayLink id="gulam-chor">gulamchor.vihar.online ↗</OfficialPlayLink>. This preview is you against virtual players. Choose your gathering, toggle sounds, and deal another round whenever you like.</p></div>
      </section>
      <div className="gc-section gc-reviews"><OfficialGameReviews id="gulam-chor" /></div>
      <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Gulam Chor", path: "/games/gulam-chor" }]} />
      <StructuredData data={{ "@context": "https://schema.org", "@type": "VideoGame", name: "Gulam Chor", description, url: `${site.url}/games/gulam-chor`, image: `${site.url}/images/social-gulam-chor.png`, genre: ["Card game", "Family"], gamePlatform: "Web browser", playMode: "SinglePlayer", applicationCategory: "Game", operatingSystem: "Any with a modern web browser", publisher: { "@id": `${site.url}/#organization` }, offers: { "@type": "Offer", price: "0", priceCurrency: "INR", url: site.gulamChorUrl }, screenshot: gulamScreenshots.map((shot) => ({ "@type": "ImageObject", contentUrl: site.url + shot.src, name: shot.title, caption: shot.caption, width: shot.width, height: shot.height })) }} />
    </div>
  );
}
