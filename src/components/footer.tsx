import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" aria-label="Vihar home"><Brand /></Link>
            <p>A space to play.<br />A little room for wonder.</p>
          </div>
          <div className="footer-group">
            <p className="eyebrow">Wander a little</p>
            <nav aria-label="Explore"><Link href="/games">Games</Link><Link href="/about">Our story</Link><Link href="/#faqs">FAQs</Link><Link href="/help">Help &amp; support</Link></nav>
          </div>
          <div className="footer-group">
            <p className="eyebrow">Say hello</p>
            <Link href="/contact" className="footer-contact">Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <a href={`mailto:${site.email}`} className="footer-email">{site.email}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Vihar. Made for a little escape.</p>
          <nav aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link></nav>
          <span className="footer-signoff"><span aria-hidden="true">✳</span> Rooted in India. Open to everyone.</span>
        </div>
      </div>
    </footer>
  );
}
