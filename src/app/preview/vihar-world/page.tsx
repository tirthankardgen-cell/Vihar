import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";
import PerspectiveTunnelHero from "@/components/ui/perspective-tunnel-hero";
import { heroWorlds } from "@/lib/hero-games";
import "../../home.css";

export const metadata: Metadata = {
  title: "Into the Vihar World — Hero Preview",
  description: "A preview of Vihar's new perspective tunnel hero, with original game worlds and browser games.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function ViharWorldPreview() {
  return <><PerspectiveTunnelHero worldCards={heroWorlds} /><HomeContent /></>;
}
