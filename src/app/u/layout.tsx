import type { Viewport } from "next";
import "../account.css";
import "../player-theme.css";

export const viewport: Viewport = { themeColor: "#111111", colorScheme: "dark" };

export default function PlayerProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className="player-theme">{children}</div>;
}
