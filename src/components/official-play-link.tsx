"use client";

import { useRef, useState } from "react";
import { games } from "@/lib/games";

export function OfficialPlayLink({ id, className, children, ariaLabel }: { id: string; className?: string; children: React.ReactNode; ariaLabel?: string }) {
  const [error, setError] = useState("");
  const game = games.find((item) => item.slug === id);
  const recording = useRef(false);
  async function launched() {
    if (recording.current) return;
    recording.current = true; setError("");
    try {
      const [{ getFirebase }, { recordLaunch, rememberGuestLaunch }] = await Promise.all([import("@/lib/firebase/client"), import("@/lib/community")]);
      const { auth } = getFirebase();
      await auth.authStateReady();
      if (auth.currentUser) await recordLaunch(id, auth.currentUser.uid, "officialGames");
      else {
        rememberGuestLaunch(id, "officialGames");
        window.dispatchEvent(new CustomEvent("vihar:game-opened", { detail: { gameId: id, source: "officialGames" } }));
      }
    } catch { setError("Your game opened, but Vihar couldn’t save the activity. Check your connection and open it again to enable reviews."); }
    finally { recording.current = false; }
  }
  if (!game || game.status !== "playable") return null;
  return <><a href={game.playUrl} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel} onClick={() => void launched()} onAuxClick={(event) => { if (event.button === 1) void launched(); }}>{children}</a>{error && <p role="alert" className="account-error">{error}</p>}</>;
}
