import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import Link from "@/components/site-link";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { ViharAttribution } from "@/components/game-origin";
import { Reviews } from "@/components/game-reviews";
import { QuickPlayExperience, QuickPlayLaunchButton } from "@/components/quick-play-experience";
import { getQuickPlayGame, quickPlayGames, quickPlayModes } from "@/lib/quick-play";
import { isPreview, pageMetadata, site } from "@/lib/site";
import styles from "@/components/quick-play-detail.module.css";
import themes from "@/components/quick-play-theme.module.css";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return quickPlayGames.map((game) => ({ slug: game.id })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = getQuickPlayGame((await params).slug);
  if (!game) notFound();
  const released = game.release.status === "playable";
  return {
    ...pageMetadata(`${game.title} — ${released ? "Play on Vihar" : "Coming soon to Quick Play"}`, `${game.description} ${released ? "Play in your browser, learn the rules and share your review on Vihar." : "Discover the rules and meet this upcoming Vihar Quick Play game."}`, `/games/${game.id}`, game.artwork),
    ...(!released ? { robots: { index: false, follow: !isPreview, googleBot: { index: false, follow: !isPreview } } } : {}),
  };
}

export default async function QuickPlayGamePage({ params }: Props) {
  const game = getQuickPlayGame((await params).slug);
  if (!game) notFound();
  const released = game.release.status === "playable";
  return <QuickPlayExperience key={game.id} game={game}>
    <div className={themes.page} data-theme={game.visual.theme} data-game={game.id}>
    <div className={`container ${styles.detail}`}>
      <Link className={`text-link ${styles.back}`} href="/games/quick-play"><ArrowLeft size={16} aria-hidden="true" />Quick Play</Link>
      <section className={`${styles.hero} ${themes.hero}`} aria-labelledby="game-title">
        <figure className={styles.cover}><Image src={game.artwork} alt={game.artworkAlt} width={1200} height={630} preload sizes="(max-width: 850px) 90vw, 55vw" /><figcaption>{game.artworkLabel}</figcaption></figure>
        <div className={styles.heroCopy}><p className="eyebrow">Quick Play · {game.genre}</p>{game.visual.hindi && <p className={themes.hindi} lang="hi">{game.visual.hindi}</p>}<h1 id="game-title">{game.title}</h1><ViharAttribution /><p className={styles.description}>{game.description}</p>
          {game.release.status === "playable" && <div className={styles.modes} data-modes>{game.release.modes.map((mode) => <span key={mode}>{quickPlayModes[mode]}</span>)}</div>}
          <QuickPlayLaunchButton />
        </div>
      </section>
      <div className={themes.artNote}><span>{game.visual.name}</span><p>{game.visual.description}{!released && " Illustration of the planned game style."}</p></div>
      <div className={styles.detailsGrid}><section className={styles.about}><p className="eyebrow">Meet the game</p><h2>A place for <em>your next move.</em></h2><p>{game.about}</p><div className={styles.tip}><Lightbulb size={21} aria-hidden="true" /><p><strong>Something to try</strong>{game.tip}</p></div></section>
        <section className={styles.guide} aria-labelledby="how-to-play"><p className="eyebrow">The idea is simple</p><h2 id="how-to-play">How to play</h2><ol>{game.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ol>{released ? <p className={styles.note}>Computer and Pass &amp; Play are available. Online rooms are coming soon.</p> : <p className={styles.note}>These are the basics. Final controls and available modes will appear with the playable game.</p>}</section></div>
      {game.screenshot && <section className={themes.inGame} aria-labelledby="inside-game"><div><p className="eyebrow">Inside the game</p><h2 id="inside-game">Your next round.</h2><p>{game.screenshot.caption}</p></div><figure><Image src={game.screenshot.src} alt={game.screenshot.alt} width={1200} height={630} sizes="(max-width: 850px) 90vw, 48vw" /><figcaption>Game screenshot</figcaption></figure></section>}
      <section className={styles.requirements} aria-labelledby="game-controls"><div><h2 id="game-controls">Controls & devices</h2><p>{game.release.status === "playable" ? game.release.controls : "Browser play is planned. We’ll confirm keyboard, touch and device support when this game is ready."}</p></div>{game.release.status === "playable" && <p>{game.release.devices.join(" · ")}</p>}</section>
      {released ? <Reviews id={game.id} source="officialGames" allowWrite /> : <section className={styles.reviewsSoon}><h2>Ratings & reviews</h2><p>Player reviews open when {game.title} is released. Come back after your first round to share what you think.</p></section>}
      <div className={styles.more}><div><p className="eyebrow">There’s more at the table</p><h2>Find your next <em>favourite.</em></h2></div><Link href="/games/quick-play" className="button button-outline">Explore Quick Play <ArrowRight size={17} aria-hidden="true" /></Link></div>
    </div>
    </div>
    <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Quick Play", path: "/games/quick-play" }, { name: game.title, path: `/games/${game.id}` }]} />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "VideoGame", "@id": `${site.url}/games/${game.id}#game`, name: game.title, url: `${site.url}/games/${game.id}`, description: game.about, image: `${site.url}${game.artwork}`, genre: game.genre, publisher: { "@id": `${site.url}/#organization` }, ...(released ? { gamePlatform: "Web browser", isAccessibleForFree: true, playMode: game.release.status === "playable" ? [...new Set(game.release.modes.map((mode) => mode === "online" ? "MultiPlayer" : mode === "pass-and-play" ? "MultiPlayer" : "SinglePlayer"))] : [] } : { creativeWorkStatus: "In development" }) }} />
  </QuickPlayExperience>;
}
