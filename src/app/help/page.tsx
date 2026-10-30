import { DiscoveryFaq } from "@/components/discovery-faq";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Breadcrumbs, PageIntro } from "@/components/page-intro";
import { BreadcrumbData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(
  "Help & support",
  "Get help with Vihar browser games: launching Bap Ka Rasta, keyboard and phone controls, graphics, sound, and common loading problems.",
  "/help",
);

function Faq({ question, children }: { question: string; children: ReactNode }) {
  return <details className="faq"><summary>{question}</summary><div className="faq-answer">{children}</div></details>;
}

export default function HelpPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Help" }]} />
      <PageIntro eyebrow="A little help along the way" title="Let’s get you playing." description="A few useful answers, so you can get back to the good part." />
      <div className="help-layout">
        <div>
          <DiscoveryFaq />
          <section className="help-group" aria-labelledby="start-title">
            <h2 id="start-title">Getting started</h2>
            <Faq question="How do I start a game?"><p>Visit <Link href="/games">Games</Link> and choose a title marked Playable now. On its page, select Play now. The game opens in a new tab, so you can return here whenever you like.</p><p>In Bap Ka Rasta, choose “Mera Bap Ka Rasta,” select Mumbai, then “Yahin Chalao.” Choose the auto rickshaw, select “Drive Mumbai,” and then “Chal Chala” to begin.</p></Faq>
            <Faq question="Do I need an account or a download?"><p>No account is needed to browse Vihar or play the current Bap Ka Rasta build. It runs in your browser. We don’t currently offer a downloadable release.</p></Faq>
            <Faq question="Which games can I play right now?"><p>Bap Ka Rasta is available as an early playable build. Mumbai and the auto rickshaw are its current playable combination. Ekka Chor is in development, with no announced release date. Upcoming titles don’t have a Play action.</p></Faq>
          </section>
          <section className="help-group" aria-labelledby="device-title">
            <h2 id="device-title">Your screen, your space</h2>
            <Faq question="Which browser should I use?"><p>Start with an up-to-date browser with WebGL 2 and hardware acceleration enabled. Chrome has been used for our browser checks. Performance and support can vary between devices; broad physical-phone and Safari testing is still in progress.</p></Faq>
            <Faq question="Can I play on my phone?"><p>Bap Ka Rasta includes touch controls and a landscape play area. Turning your phone sideways gives you more room. The Vihar catalogue works in either orientation.</p><p>If driving feels slow, select Low graphics in the game’s pause menu. Touch support doesn’t guarantee the same performance on every phone.</p></Faq>
            <Faq question="Where can I find the controls?"><p>The <Link href="/games/bap-ka-rasta#controls-title">Bap Ka Rasta page</Link> lists all keyboard controls. Use W / ↑ to accelerate, S / ↓ to brake and then reverse, and A D / ← → to steer. Phones have on-screen steering and pedals.</p><p>Press C to change camera, R to reset to a safe road position, and Esc or P to pause. Keep holding brake after stopping to engage reverse.</p></Faq>
          </section>
          <section className="help-group" aria-labelledby="troubleshooting-title">
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
