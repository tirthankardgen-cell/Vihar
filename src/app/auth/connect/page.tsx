import { GameConnect } from "@/components/account/game-connect";
import { Suspense } from "react";
import "@/app/account.css";
import "./connect.css";

export const metadata = { title: "Connect with Vihar ID", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function ConnectPage() { return <Suspense fallback={<div className="id-flow"><p role="status">Loading Vihar ID…</p></div>}><GameConnect /></Suspense>; }
