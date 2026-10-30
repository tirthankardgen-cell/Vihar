import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/page-intro";
import { BreadcrumbData } from "@/components/structured-data";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata("Ekka Chor — Coming soon", "Something new is taking shape at Vihar. Meet Ekka Chor, an upcoming game. Gameplay details and a release date will be shared when they are ready.", "/games/ekka-chor", "/images/social-ekka-chor.png");

export default function EkkaChorPage() {
  return <div className="container upcoming-page"><Breadcrumbs items={[{ label: "Games", href: "/games" }, { label: "Ekka Chor" }]} /><div className="upcoming-grid"><div className="upcoming-copy"><span className="status-badge status-upcoming"><span className="status-dot" aria-hidden="true" />Coming soon</span><p className="eyebrow">A new world is taking shape</p><h1>Ekka <em>Chor.</em></h1><p className="upcoming-lede">Some things are worth a little curiosity.</p><p>There’s a new game on our drawing board. We’re giving it the time and care it deserves, and keeping a little of the mystery for now.</p><p>Gameplay details, supported devices, and a release date haven’t been announced yet. This page will grow with the game.</p><Link href="/games" className="button button-dark"><ArrowLeft size={17} aria-hidden="true" />Explore our games</Link><Link href="/games/bap-ka-rasta" className="text-link">Take a drive while you wait <ArrowUpRight size={16} aria-hidden="true" /></Link></div><figure className="upcoming-art"><Image src="/images/ekka-chor.webp" alt="Concept artwork of ivory playing cards and a terracotta token arranged on a lilac surface" width={1200} height={900} sizes="(max-width: 767px) 100vw, 50vw" preload /><figcaption>Original concept artwork. Not a gameplay preview.</figcaption></figure></div><BreadcrumbData items={[{ name: "Games", path: "/games" }, { name: "Ekka Chor", path: "/games/ekka-chor" }]} /></div>;
}
