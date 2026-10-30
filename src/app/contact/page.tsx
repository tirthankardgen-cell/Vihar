import Link from "next/link";
import { ArrowUpRight, Mail, ShieldCheck } from "lucide-react";
import { Breadcrumbs, PageIntro } from "@/components/page-intro";
import { BreadcrumbData } from "@/components/structured-data";
import { pageMetadata, site } from "@/lib/site";

export const metadata = pageMetadata(
  "Contact Vihar",
  "Say hello to Vihar. Get support with a browser game, share feedback, or get in touch about a creative collaboration.",
  "/contact",
);

export default function ContactPage() {
  const emailLink = "mailto:" + site.email;
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <PageIntro eyebrow="The door is open" title="A conversation starts here." description="A question, a little feedback, or an idea worth exploring. We’d like to hear it." />
      <div className="contact-grid">
        <section className="contact-primary" aria-labelledby="hello-title">
          <Mail size={28} aria-hidden="true" /><h2 id="hello-title">Say <em>hello.</em></h2>
          <a href={emailLink} className="contact-email">{site.email}<ArrowUpRight size={21} aria-hidden="true" /></a>
          <p>We’re a small team building thoughtfully. We read your messages and reply as we’re able.</p>
          <a href={emailLink + "?subject=Hello%20Vihar"} className="button button-dark">Write to us <ArrowUpRight size={17} aria-hidden="true" /></a>
          <p>Opens your email app. You can also copy the address into the email service you use.</p>
        </section>
        <div className="contact-options">
          <section className="contact-option"><h2>Something not working?</h2><p>Include the game name, device, browser version, and the steps that led to the problem. A screenshot can help; please leave out private information.</p><a href={emailLink + "?subject=Vihar%20game%20support"} className="text-link">Ask for support <ArrowUpRight size={16} aria-hidden="true" /></a></section>
          <section className="contact-option"><h2>An idea to share?</h2><p>We welcome thoughtful feedback and conversations about games, art, and creative collaborations.</p><a href={emailLink + "?subject=An%20idea%20for%20Vihar"} className="text-link">Start a conversation <ArrowUpRight size={16} aria-hidden="true" /></a></section>
          <section className="contact-option"><h2>Just finding your feet?</h2><p>Our help page covers controls, phone support, sound, and the most common bumps in the road.</p><Link href="/help" className="text-link">Visit help &amp; support <ArrowUpRight size={16} aria-hidden="true" /></Link></section>
        </div>
      </div>
      <aside className="contact-note"><ShieldCheck size={20} aria-hidden="true" /><p>Never send passwords, payment details, or other sensitive information. We use the details you send to handle your message. Read our <Link href="/privacy">privacy notice</Link> for more.</p></aside>
      <BreadcrumbData items={[{ name: "Contact", path: "/contact" }]} />
    </div>
  );
}
