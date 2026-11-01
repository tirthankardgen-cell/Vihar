import { GamesDashboard } from "@/components/account/dashboard";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata("Your games", "Keep your favourite Vihar games close and discover your next adventure.", "/dashboard/games");
export default function GamesPage() { return <GamesDashboard />; }
