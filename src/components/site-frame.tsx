"use client";

import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState } from "react";

const PlayerFrameContext = createContext<(() => () => void) | null>(null);

export function usePlayerFrame() {
  const activate = useContext(PlayerFrameContext);
  if (!activate) throw new Error("The embedded player must be inside SiteFrame.");
  return activate;
}

// The identity provider is a task window, not a page in the discovery site.
// Pass the site chrome as slots so its server components stay on the server.
export function SiteFrame({ children, header, footer }: { children: React.ReactNode; header: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const identityWindow = pathname === "/auth/connect";
  const [player, setPlayer] = useState<{ pathname: string } | null>(null);
  const activate = useCallback(() => {
    const owner = { pathname };
    setPlayer(owner);
    // An old frame's cleanup cannot hide/show a newer frame's chrome.
    return () => setPlayer((current) => current === owner ? null : current);
  }, [pathname]);
  const playing = player?.pathname === pathname;
  return <PlayerFrameContext.Provider value={activate}>
    {!playing && <a href="#main-content" className="skip-link">Skip to content</a>}
    {!identityWindow && !playing && header}
    <main id="main-content" tabIndex={-1} data-player-active={playing || undefined}>{children}</main>
    {!identityWindow && !playing && footer}
  </PlayerFrameContext.Provider>;
}
