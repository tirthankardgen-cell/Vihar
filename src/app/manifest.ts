import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Vihar — A space to play.",
    short_name: site.name,
    description: site.description,
    start_url: "/",
    scope: "/",
    display: "browser",
    lang: "en",
    background_color: "#FAF9F6",
    theme_color: "#FAF9F6",
    categories: ["games", "entertainment"],
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
