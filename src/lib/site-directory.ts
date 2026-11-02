import { publicRoutes } from "@/lib/site";

export const siteDirectory = [
  { path: "/", name: "Vihar home", description: "Original browser games and a little room for wonder." },
  { path: "/games", name: "All games", description: "Browse playable games and upcoming adventures." },
  { path: "/games/bap-ka-rasta", name: "Bap Ka Rasta", description: "Mumbai driving, the rides, cities, characters, gameplay and controls." },
  { path: "/games/bap-ka-rasta/screenshots", name: "Screenshots and gallery", description: "Gameplay, the playable map, landmarks, characters and concept previews." },
  { path: "/guides/bap-ka-rasta-first-drive", name: "First-drive guide", description: "Your first route, gears, cameras, touch controls and recovery." },
  { path: "/games/gulam-chor", name: "Gulam Chor — coming soon", description: "Meet the card game taking shape next. No release date announced." },
  { path: "/about", name: "Our story", description: "The idea behind Vihar, our name and our emblem." },
  { path: "/help", name: "Help and FAQs", description: "Playing, supported devices, downloads and Vihar ID." },
  { path: "/contact", name: "Contact", description: "Get in touch with feedback or a support question." },
  { path: "/privacy", name: "Privacy", description: "Accounts, browser storage and how information is handled." },
  { path: "/terms", name: "Terms", description: "The terms for browsing Vihar and playing our games." },
  { path: "/site-map", name: "Site map", description: "Find every public page in one place." },
] satisfies { path: (typeof publicRoutes)[number]; name: string; description: string }[];
