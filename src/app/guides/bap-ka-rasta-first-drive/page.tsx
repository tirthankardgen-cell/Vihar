import Image from "next/image";
import Link from "@/components/site-link";
import { AdSense } from "@/components/adsense";
import { Breadcrumbs, PageIntro } from "@/components/page-intro";
import { BreadcrumbData, StructuredData } from "@/components/structured-data";
import { pageMetadata, site } from "@/lib/site";

const path = "/guides/bap-ka-rasta-first-drive";
const title = "Your first drive in Bap Ka Rasta";
const description = "A practical guide to starting the Mumbai auto-rickshaw game, choosing gears, exploring the streets, using both cameras, and recovering from a stuck vehicle.";
export const metadata = pageMetadata(title, description, path, "/images/social-bap-ka-rasta.png");

const sections = [
  ["start", "Start the playable build"], ["handling", "Get comfortable with the auto"],
  ["explore", "Choose a little route"], ["camera", "Use both camera views"],
  ["recover", "Recover and keep exploring"], ["devices", "Adjust for your device"],
  ["scope", "Know what this build includes"],
] as const;

export default function FirstDriveGuide() {
  return (
    <div className="container guide-page">
      <Breadcrumbs items={[{ label: "Games", href: "/games" }, { label: "Bap Ka Rasta", href: "/games/bap-ka-rasta" }, { label: "First-drive guide" }]} />
      <PageIntro eyebrow="The Vihar play guide" title="Your first drive, at your own pace." description={description} />
      <p className="policy-date">By Vihar · Updated <time dateTime="2026-10-31">31 October 2026</time> · Early playable build</p>
      <div className="legal-layout">
        <aside className="legal-toc"><p className="eyebrow">In this guide</p><nav aria-label="First-drive guide contents">{sections.map(([id, label]) => <a key={id} href={"#" + id}>{label}</a>)}</nav></aside>
        <article className="legal-copy">
          <p className="legal-summary">Bap Ka Rasta gives you an auto rickshaw and a Mumbai-inspired neighbourhood to wander through. There is no race to win or route to complete. This guide suggests a short first drive that lets you learn the controls before exploring the busier streets.</p>
          <figure className="guide-figure"><Image src="/images/bap-ka-rasta-gameplay.webp" alt="The playable auto rickshaw and street view in the early Bap Ka Rasta browser build" width={1440} height={900} sizes="(max-width: 767px) 100vw, 800px" /><figcaption>Actual browser gameplay. The streets are an independently authored interpretation of Mumbai.</figcaption></figure>

          <section id="start" aria-labelledby="start-title"><h2 id="start-title">Start the playable build</h2>
            <p>Open the game from the <Link href="/games/bap-ka-rasta">Bap Ka Rasta page</Link>. It opens in its own tab; no account or installation is required. On the landing screen, select <strong>Mera Bap Ka Rasta</strong>. Choose <strong>Mumbai</strong>, then <strong>Yahin Chalao</strong>. Select the <strong>auto rickshaw</strong> and <strong>Drive Mumbai</strong>.</p>
            <p>The other city and vehicle cards are previews. Choosing one marked Coming soon will not start a drive. Stay with Mumbai and the auto for the currently playable combination.</p>
            <p>Select <strong>Chal Chala</strong> when you are ready. This interaction also lets the browser start the game’s audio. You can mute the speaker control if you prefer to explore quietly.</p>
          </section>
          <section id="handling" aria-labelledby="handling-title"><h2 id="handling-title">Get comfortable with the auto</h2>
            <p>For the first stretch, choose gear <strong>1</strong> using the number key or the on-screen gear button. The four gears limit speed to approximately 12, 25, 45, and 65 km/h. A lower limit gives you more time to see a turn and make small steering corrections; there is no reward for reaching top speed.</p>
            <p>Hold <strong>W or ↑</strong> to accelerate. Hold <strong>A / D or ← / →</strong> to steer while accelerating. On a phone, hold the steering arrow and the Chalao pedal together. Begin on a wider road so you have room to see how steering changes the auto’s direction.</p>
            <p>Release acceleration and hold <strong>S or ↓</strong> to brake. Once stopped, keeping that control held engages reverse after a short delay. If you only want to stop, release the brake when you come to rest. On touch screens, the Ruko / reverse pedal performs the same two actions.</p>
          </section>
          <section id="explore" aria-labelledby="explore-title"><h2 id="explore-title">Choose a little route</h2>
            <p>Try moving from a broad avenue toward the sea edge, then look for a smaller side street before returning to an open road. This is a suggestion for exploring, not a mission with checkpoints. Your position can change after a reset, so use the street names in the driving display and the visible road connections rather than a fixed sequence of left and right turns.</p>
            <p>The playable neighbourhood includes Marine Drive, Churchgate, Fort, and Colaba-inspired areas, a roundabout, and narrow bazaar lanes. The map compresses and reimagines these places for play. It is not a real-world navigation map, and a street name does not promise an exact recreation of its real location.</p>
            <p>Slow down before a narrow lane or an intersection. Traffic, people crossing, and roadside objects share the space. A wall or closed-end barrier marks a boundary; use another connection instead of assuming every gap between buildings is a road. There is no minimap in the current build, so a short loop is a useful way to become familiar with a few neighbouring streets.</p>
          </section>
          <section id="camera" aria-labelledby="camera-title"><h2 id="camera-title">Use both camera views</h2>
            <p>Press <strong>C</strong>, or the <strong>3P / 1P</strong> camera button, to switch between the outside view and the driver’s view. Start outside the auto to judge its position relative to the road. Once you are comfortable, the driver’s view gives you a different sense of the cabin and the streets ahead.</p>
            <figure className="guide-figure"><Image src="/images/bap-ka-rasta-camera.webp" alt="The driver’s camera inside the Bap Ka Rasta auto rickshaw" width={1440} height={900} sizes="(max-width: 767px) 100vw, 800px" /><figcaption>The second camera moves your view into the auto’s cabin.</figcaption></figure>
            <p>You can drag to look around; the view returns smoothly when you release. Stop the auto before taking a longer look at a shopfront or the sea edge. Looking away does not steer or brake for you.</p>
          </section>
          <section id="recover" aria-labelledby="recover-title"><h2 id="recover-title">Recover and keep exploring</h2>
            <p>If a collision leaves you awkwardly positioned, try braking to a stop and reversing slowly. If you remain stuck, press <strong>R</strong> or the reset button to return to a safe road position. Reset is a recovery tool, so you do not need to restart the entire game to get moving again.</p>
            <p>Press <strong>Esc or P</strong> to pause. The game also pauses when it loses focus, including when you switch tabs. Select <strong>Chal, phir niklein</strong> to resume. If the auto seems unresponsive after returning to the tab, check for the pause panel before refreshing.</p>
            <p>Ending a drive returns you to the landing screen. There is no saved progress or completed-mission record to restore; each visit is another chance to roam.</p>
          </section>
          <section id="devices" aria-labelledby="devices-title"><h2 id="devices-title">Adjust for your device</h2>
            <p>Use a current browser with WebGL 2 and hardware acceleration. On a phone, turning the screen sideways gives the landscape play area more room. Touch controls are included, but device performance varies and broad physical-phone and Safari testing is still in progress.</p>
            <p>If steering looks delayed or the scene feels choppy, open the pause panel and choose <strong>Low graphics</strong>. It reduces rendering resolution and fog distance and turns off shadows. This changes presentation, not the roads available to explore. Closing other demanding tabs can also leave more resources for the game.</p>
            <p>If sound is missing, check the speaker toggle and device volume after starting the drive. Toggling sound off and on can retry a failed audio download. If a graphics-context error appears, use the game’s retry action. For persistent problems, send your browser, device, and the step where it failed through <Link href="/contact">Contact</Link>.</p>
          </section>
          <section id="scope" aria-labelledby="scope-title"><h2 id="scope-title">Know what this build includes</h2>
            <p>This is single-player free roaming, with traffic, pedestrians, street audio, four gears, and two cameras. It does not currently include missions, multiplayer, a minimap, saved progress, or a downloadable release. The driving and collisions are fictional arcade play, not guidance for driving on real roads.</p>
            <p>This guide is based on the current playable flow and the project’s <a href="https://github.com/tirthankardgen-cell/Bap-Ka-Rasta/blob/main/README.md" target="_blank" rel="noopener noreferrer">published build notes (opens in a new tab)</a>. Controls and availability can change with later builds. The <Link href="/games/bap-ka-rasta#controls-title">controls reference</Link> and <Link href="/help">Help page</Link> are useful companions for your next visit.</p>
          </section>
        </article>
      </div>
      <BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Bap Ka Rasta", path: "/games/bap-ka-rasta" }, { name: title, path }]} />
      <StructuredData data={{ "@context": "https://schema.org", "@type": "Article", headline: title, description, mainEntityOfPage: `${site.url}${path}`, image: `${site.url}/images/bap-ka-rasta-gameplay.webp`, author: { "@type": "Organization", name: "Vihar", url: `${site.url}/about` }, publisher: { "@id": `${site.url}/#organization` }, datePublished: "2026-10-31", dateModified: "2026-10-31" }} />
      <AdSense path={path} />
    </div>
  );
}
