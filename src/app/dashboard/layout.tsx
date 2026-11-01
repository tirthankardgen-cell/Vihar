import type { Metadata, Viewport } from "next";
import { AccountShell } from "@/components/account/account-shell";
import "../account.css";
import "../player-theme.css";
import "@/components/account/onboarding.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#111111", colorScheme: "dark" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="player-theme"><AccountShell>{children}</AccountShell></div>;
}
