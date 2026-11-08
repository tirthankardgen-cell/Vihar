"use client";

import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { ArrowUpRight, Check, Gamepad2, LockKeyhole, Save, UserRound } from "lucide-react";
import { Emblem } from "@/components/brand";
import { getFirebase } from "@/lib/firebase/client";
import { accountIdAction } from "@/lib/vihar-id/client";
import { useAuth } from "./auth-provider";
import { AuthForm } from "./auth-form";
import { Avatar } from "./avatar";
import { Onboarding } from "./onboarding";

type ConnectRequest = { gameId: string; origin: string; challenge: string; state: string };
export function GameConnect() {
  const { user, profile, loading, error: authError, retry } = useAuth();
  const [request, setRequest] = useState<ConnectRequest | null>(null);
  const [game, setGame] = useState<{ title: string; origin: string; uid: string } | null>(null);
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState<"allowed" | "cancelled" | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const raw = params.has("gameId") ? Object.fromEntries(params) : JSON.parse(sessionStorage.getItem("vihar:connect") || "null");
      if (!raw || !/^[A-Za-z0-9_-]{1,128}$/.test(raw.gameId) || !/^[A-Za-z0-9_-]{43}$/.test(raw.challenge) || !/^[a-f0-9]{64}$/.test(raw.state) || new URL(raw.origin).origin !== raw.origin) throw new Error("Start sign-in using the Vihar ID button on the game’s website.");
      if (params.has("gameId")) sessionStorage.setItem("vihar:connect", JSON.stringify({ ...raw, storedAt: Date.now() }));
      else if (!raw.storedAt || Date.now() - raw.storedAt > 300000) throw new Error("This sign-in request expired. Start again on the game’s website.");
      queueMicrotask(() => setRequest(raw));
    } catch (failure) { queueMicrotask(() => setError((failure as Error).message)); }
  }, []);
  useEffect(() => {
    if (!request || !user) return;
    let active = true;
    void accountIdAction("info", { gameId: request.gameId }).then((value) => {
      if (!active) return;
      if (value.origin !== request.origin) setError("The requesting website is not this game’s registered origin.");
      else setGame({ ...value, uid: user.uid });
    }).catch((failure) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [request, user]);

  async function decide(allow: boolean) {
    if (!request || !window.opener || window.opener.closed) { setError("The game window is unavailable. Return to the game and start sign-in again."); return; }
    setBusy(true); setError("");
    try {
      const result = allow ? await accountIdAction("authorize", request) : { error: "access_denied" };
      window.opener.postMessage({ type: "vihar:id:authorization", state: request.state, ...result }, request.origin);
      sessionStorage.removeItem("vihar:connect"); setComplete(allow ? "allowed" : "cancelled");
    } catch (failure) { setError((failure as Error).message); } finally { setBusy(false); }
  }
  async function switchAccount() {
    setBusy(true);
    try { await signOut(getFirebase().auth); setGame(null); setError(""); setMode("login"); }
    catch { setError("Could not switch accounts. Please try again."); }
    finally { setBusy(false); }
  }

  return <div className="id-flow">
    <div className="id-flow-card">
      <div className="id-flow-brand"><span><Emblem /> <strong>Vihar <b>ID</b></strong></span><span className="id-secure"><LockKeyhole size={12} aria-hidden="true" />Secure sign-in</span></div>
      {complete ? <section className="id-result"><Check size={30} aria-hidden="true" /><h1>{complete === "allowed" ? "You’re connected" : "Connection cancelled"}</h1><p className="id-description">Return to your game. You can close this window.</p><button type="button" className="button button-dark" onClick={() => window.close()}>Close window</button></section> : <>
        {loading || (!request && !error) ? <p className="id-wait" role="status">Loading your Vihar ID…</p> : !request ? <h1>Unable to connect</h1> : authError ? <h1>Unable to load your account</h1> : !user ? <>
          <AuthForm key={mode} mode={mode} embedded onModeChange={setMode} />
          <p className="id-request-origin">Requested by <strong>{request.origin}</strong></p>
        </> : !profile ? <Onboarding compact /> : game?.uid === user.uid && !error ? <section className="id-consent" aria-labelledby="connect-title">
          <h1 id="connect-title">Connect to {game.title}</h1>
          <p className="id-description id-game-origin">{game.origin}<ArrowUpRight size={14} aria-hidden="true" /></p>
          <div className="id-player"><Avatar id={profile.avatarId} size={36} /><div><strong>{profile.displayName}</strong><span>@{profile.username}</span></div><button type="button" className="id-text-button" disabled={busy} onClick={() => void switchAccount()}>Switch</button></div>
          <p className="id-permissions-title">This game will be able to:</p>
          <ul className="id-permissions">
            <li><UserRound size={18} aria-hidden="true" /><span>Read your player ID, name, username and avatar</span></li>
            <li><Save size={18} aria-hidden="true" /><span>Save and load progress for this game</span></li>
            <li><Gamepad2 size={18} aria-hidden="true" /><span>Add its play time to your Vihar dashboard</span></li>
          </ul>
          <p className="id-private-note"><LockKeyhole size={15} aria-hidden="true" /><span>Your email, password, friends and other games’ saves stay private. Disconnect any time in your dashboard.</span></p>
          <button type="button" className="button button-dark id-allow" disabled={busy} onClick={() => void decide(true)}>{busy ? "Connecting…" : "Allow & return to game"}</button>
        </section> : !error ? <p className="id-wait" role="status">Checking the game connection…</p> : <h1>Unable to connect</h1>}
        {(error || authError) && <p className="account-error" role="alert">{error || authError}</p>}
        {authError && <button type="button" className="id-text-button" onClick={retry}>Retry sign-in</button>}
        {request && <button type="button" className="id-cancel" disabled={busy} onClick={() => void decide(false)}>Cancel</button>}
      </>}
      <div className="id-legal"><a href="/help/game-permissions" target="_blank" rel="noopener noreferrer">Permissions</a><span aria-hidden="true">·</span><a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy</a></div>
    </div>
  </div>;
}
