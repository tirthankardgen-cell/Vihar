import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";
import PerspectiveTunnelHero from "@/components/ui/perspective-tunnel-hero";
import { featuredGame } from "@/lib/games";
import "../../home.css";

export const metadata: Metadata = {
  title: "Into the Vihar World — Hero Preview",
  description: "A preview of Vihar's new perspective tunnel hero, with original game worlds and browser games.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/" },
};

export default function ViharWorldPreview() {
  return <><PerspectiveTunnelHero playUrl={featuredGame.playUrl} /><HomeContent /></>;
}
