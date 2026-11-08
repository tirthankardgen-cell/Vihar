import { GameConnect } from "@/components/account/game-connect";
import "@/app/account.css";
import "@/app/help/help.css";

export const metadata = { title: "Connect with Vihar ID", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function ConnectPage() { return <GameConnect />; }
