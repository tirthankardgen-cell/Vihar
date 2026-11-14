import { HelpTopics } from "@/components/help-topics";
import "./help.css";
import { DiscoveryFaq } from "@/components/discovery-faq";
import Link from "@/components/site-link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { PageIntro } from "@/components/page-intro";
import { BreadcrumbData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/site";
import { quickPlayGames } from "@/lib/quick-play";

export const metadata = pageMetadata(
  "Game Help & FAQs — Browser Games, Vihar ID & Publishing",
  "Find browser game rules, Carrom controls, device support and troubleshooting. Get step-by-step help for Vihar ID, indie game publishing, saves and reviews.",
  "/help",
);

function Faq({ question, children }: { question: string; children: ReactNode }) {
  return <details className="faq"><summary>{question}</summary><div className="faq-answer">{children}</div></details>;
}

export default function HelpPage() {
  const released = quickPlayGames.filter((game) => game.release.status === "playable");
  return (
    <div className="container help-page">
      <PageIntro eyebrow="A little help along the way" title="Let’s get you playing." description="One player identity. Independent game worlds. Find detailed guides for playing, publishing and connecting your studio’s game." />
      <HelpTopics />
      <div className="help-layout">
        <div>
          <DiscoveryFaq />
          <section className="help-group viewport-section" aria-labelledby="start-title">
            <h2 id="start-title">Getting started</h2>
            <Faq question="How do I start a game?"><p>Visit <Link href="/games">Games</Link> and choose a title marked Playable now or Play here. Quick Play games open inside their Vihar page; use Exit to Vihar or Escape to return to the details. Bap Ka Rasta, Gulam Chor and community play links open the game&apos;s own website in a new tab.</p><p>In Bap Ka Rasta, choose “Mera Bap Ka Rasta,” select Mumbai, then “Yahin Chalao.” Choose the auto rickshaw, select “Drive Mumbai,” and then “Chal Chala” to begin.</p></Faq>
            <Faq question="Do I need an account or a download?"><p>No account or download is needed to browse Vihar or play its released browser games. Quick Play offers guest play; signing in can record your activity and enable reviews. Community creators describe their own account and download requirements.</p></Faq>
            <Faq question="Which games can I play right now?"><p>Bap Ka Rasta and Gulam Chor are playable on their own websites. Bap Ka Rasta’s current build lets you explore Mumbai in an auto rickshaw. Gulam Chor is a family card game: choose 2–6 seats and play against the virtual family.</p><p>Play here with Quick Play: {released.map((game, index) => <span key={game.id}>{index > 0 ? ", " : ""}<Link href={`/games/${game.id}`}>{game.title}</Link></span>)}. Carrom offers Easy, Medium and Hard computer play, Practice and two-player Pass &amp; Play. Private online rooms are coming soon.</p></Faq>
          </section>
          <section className="help-group viewport-section" aria-labelledby="device-title">
            <h2 id="device-title">Your screen, your space</h2>
            <Faq question="Which browser should I use?"><p>Use an up-to-date browser. Bap Ka Rasta also needs WebGL 2 and hardware acceleration enabled. Chrome has been used for our browser checks. Performance and support can vary between devices; broad physical-phone and Safari testing is still in progress.</p></Faq>
            <Faq question="Can I play on my phone?"><p>Released Quick Play games support phone layouts and touch controls. In Carrom, slide the striker along the baseline, pull back to aim and set power, then release to shoot. Board options also offers keyboard shot controls.</p><p>Gulam Chor supports portrait play: tap a face-down card to draw from the virtual family.</p><p>Bap Ka Rasta includes touch controls. City selection, vehicle selection and driving automatically use a landscape play canvas, even when your phone is upright. The game’s home screen and the Vihar catalogue follow your device orientation.</p><p>If driving feels slow, select Low graphics in the game’s pause menu. Touch support doesn’t guarantee the same performance on every phone.</p></Faq>
            <Faq question="Where can I find the controls?"><p>The <Link href="/games/bap-ka-rasta#controls-title">Bap Ka Rasta page</Link> lists all keyboard controls. Use W / ↑ to accelerate, S / ↓ to brake and then reverse, and A D / ← → to steer. Phones have on-screen steering and pedals.</p><p>Press C to change camera, R to reset to a safe road position, and Esc or P to pause. Keep holding brake after stopping to engage reverse.</p></Faq>
          </section>
          <section className="help-group viewport-section" aria-labelledby="troubleshooting-title">
            <h2 id="troubleshooting-title">A bump in the road?</h2>
            <Faq question="The game won’t load. What should I try?"><p>Check your connection, refresh the game tab, and make sure your browser is up to date. Enable hardware acceleration in your browser settings, then restart the browser if prompted.</p><p>If you see a graphics-context error, use the game’s retry action. If it keeps happening, close other graphics-heavy tabs and try again. <Link href="/contact">Tell us what happened</Link> if you’re still stuck.</p></Faq>
            <Faq question="Why is the game running slowly?"><p>Open the pause menu and switch from Standard to Low graphics. Close other demanding apps or tabs. A keyboard and a larger screen are a good starting point for this early build, though a device’s graphics capability matters more than screen size.</p></Faq>
            <Faq question="Why can’t I hear anything?"><p>Browsers need an interaction before playing audio. Select “Chal Chala” to start, then check the in-game speaker control and your device volume. If an audio download failed, toggling sound off and back on can retry it. The Vihar catalogue itself never plays audio.</p></Faq>
            <Faq question="Why did the game pause when I changed tabs?"><p>The game pauses when it loses focus and clears held controls. Return to the tab and select “Chal, phir niklein” to resume. This helps prevent your auto from continuing down the road while you’re away.</p></Faq>
            <Faq question="Does Bap Ka Rasta save my progress?"><p>The current build is open-ended free roaming. It has no saved progress, missions, multiplayer, or cross-device saves. You can start a new drive whenever you return.</p></Faq>
          </section>
        </div>
        <aside className="help-aside"><MessageCircle size={27} aria-hidden="true" /><h2>Still need <em>a hand?</em></h2><p>Tell us the game, your device and browser, and what happened. A clear description helps us find the right road back.</p><Link href="/contact" className="button button-dark">Get in touch <ArrowUpRight size={17} aria-hidden="true" /></Link></aside>
      </div>
      <BreadcrumbData items={[{ name: "Help", path: "/help" }]} />
    </div>
  );
}
