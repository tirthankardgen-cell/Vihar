"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

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
    <header className="site-header" ref={header}>
      <div className="container header-inner">
        <Link href="/" aria-label="Vihar home" onClick={() => setMenuOpen(false)} className="logo-link">
          <Brand />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          <Link href="/games" aria-current={pathname.startsWith("/games") ? "page" : undefined}>Games</Link>
          <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>About</Link>
        </nav>
        <Link href="/games" className="button button-dark header-cta">Explore games <ArrowUpRight size={16} aria-hidden="true" /></Link>
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
        <Link href="/games" onClick={() => setMenuOpen(false)} aria-current={pathname.startsWith("/games") ? "page" : undefined}>Games <ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link href="/about" onClick={() => setMenuOpen(false)} aria-current={pathname === "/about" ? "page" : undefined}>About <ArrowUpRight size={18} aria-hidden="true" /></Link>
        <Link href="/help" onClick={() => setMenuOpen(false)}>Help <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </nav>
    </header>
  );
}
