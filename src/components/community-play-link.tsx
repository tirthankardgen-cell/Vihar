"use client";
import { useState } from "react";
import Link from "@/components/site-link";
import { useAuth } from "@/components/account/auth-provider";
import { recordLaunch, rememberGuestLaunch, type CommunityGame } from "@/lib/community";
import { accountIdAction } from "@/lib/vihar-id/client";

export function CommunityPlayLink({ game }: { game: CommunityGame }) {
  const { user, loading } = useAuth();
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  async function launch(event: React.MouseEvent<HTMLAnchorElement>) {
    if (event.type === "auxclick" && event.button !== 1) return;
    if (busy || loading) { event.preventDefault(); return; }
    if (!user) { rememberGuestLaunch(game.id, "communityGames"); return; }
    event.preventDefault();
    const popup = window.open("about:blank", "_blank");
    if (!popup) { setError("Allow popups for Vihar and try again."); return; }
    popup.opener = null; setBusy(true); setError("");
    try {
      const result = await accountIdAction("launch", { gameId: game.id });
      popup.location.replace(result.url);
    } catch (failure) {
      // Older listings stay playable while their creators adopt the tracker.
      popup.location.replace(game.url);
      setError(`The game opened, but tracking is unavailable. ${(failure as Error).message}`);
    } finally { setBusy(false); }
    // A receipt failure must never navigate the already-open game a second time.
    if (user.uid !== game.ownerId) void recordLaunch(game.id, user.uid).catch(() => setError("The game opened, but its website-open record could not be saved."));
  }
  return <div className="community-play"><a href={game.url} target="_blank" rel="noopener noreferrer ugc" className="button button-dark" onClick={(event) => void launch(event)} onAuxClick={(event) => void launch(event)} aria-disabled={busy || loading}>{game.kind === "download" ? "Visit download page ↗" : "Play game ↗"}<span className="sr-only"> — opens on the creator’s website in a new tab</span></a><p>{game.authMode === "vihar-id" ? "Use Sign in with Vihar ID on the creator’s game website for your account and supported saves." : "Start playing directly. No in-game login required."} {user ? "Your game opens and connected play time appear in your private dashboard." : <><Link href={`/login?next=${encodeURIComponent(`/community/${game.id}`)}`}>Sign in to Vihar</Link> before launching to record activity in your dashboard.</>}</p>{error && <p role="alert" className="account-error">{error}</p>}</div>;
}
