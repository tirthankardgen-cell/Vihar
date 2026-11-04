"use client";

import { usePathname } from "next/navigation";
import Link from "@/components/site-link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { site } from "@/lib/site";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return null;
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
            <nav aria-label="Explore"><Link href="/games">Games</Link><Link href="/dashboard/publish">Share your game</Link><Link href="/signup">Create your Vihar ID</Link><Link href="/guides/bap-ka-rasta-first-drive">First-drive guide</Link><Link href="/about">Our story</Link><Link href="/help">FAQs</Link><Link href="/help">Help &amp; support</Link></nav>
          </div>
          <div className="footer-group">
            <p className="eyebrow">Say hello</p>
            <Link href="/contact" className="footer-contact">Let’s talk <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram · @vihar.world <ArrowUpRight size={16} aria-hidden="true" /></a>
            <a href={`mailto:${site.email}`} className="footer-email">{site.email}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Vihar. Made for a little escape.</p>
          <nav aria-label="Legal and site map"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/contact">Contact</Link><Link href="/site-map">Site map</Link></nav>
          <span className="footer-signoff"><span aria-hidden="true">✳</span> Rooted in India. Open to everyone.</span>
        </div>
      </div>
    </footer>
  );
}
