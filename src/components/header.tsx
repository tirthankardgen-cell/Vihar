"use client";

import Link from "@/components/site-link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { AccountLink } from "@/components/account/account-link";

export function Header() {
  const pathname = usePathname();
  const hasHero = pathname === "/" || pathname === "/preview/vihar-world";
  const [heroVisibility, setHeroVisibility] = useState({ pathname, visible: true });
  const overHero = hasHero && (heroVisibility.pathname !== pathname || heroVisibility.visible);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!hasHero) return;
    const hero = document.querySelector('[aria-labelledby="vihar-world-title"]');
    if (!hero) return;
    const headerHeight = header.current?.querySelector(".header-inner")?.getBoundingClientRect().height ?? 0;
    const observer = new IntersectionObserver(([entry]) => {
      setHeroVisibility({ pathname, visible: entry.isIntersecting });
    }, { rootMargin: `-${headerHeight}px 0px 0px 0px` });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [hasHero, pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  return (
    <header className={`site-header${hasHero ? " site-header--hero" : ""}`} data-over-hero={overHero} ref={header}>
      <div className="container header-inner">
        <Link href="/" aria-label="Vihar home" onClick={() => setMenuOpen(false)} className="logo-link">
          <Brand />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          <Link href="/games" aria-current={pathname.startsWith("/games") ? "page" : undefined}>Games</Link>
          <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
          <Link href={pathname === "/" ? "/#faqs" : "/help"}>FAQs</Link>
        </nav>
        <AccountLink />
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
          ref={menuButton}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav" hidden={!menuOpen}>
        <AccountLink mobile onClick={() => setMenuOpen(false)} />
        <Link href="/games" onClick={() => setMenuOpen(false)} aria-current={pathname.startsWith("/games") ? "page" : undefined}>Games <ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link href="/about" onClick={() => setMenuOpen(false)} aria-current={pathname === "/about" ? "page" : undefined}>About <ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link href="/help" onClick={() => setMenuOpen(false)}>Help &amp; support <ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link href={pathname === "/" ? "/#faqs" : "/help"} onClick={() => setMenuOpen(false)}>FAQs <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </nav>
    </header>
  );
}
